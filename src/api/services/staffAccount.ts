import { OkPacket, RowDataPacket } from "mysql2";
import { escape } from "mysql2/promise";
import { LimitOptions } from "../config.js";
import pool from "../db.js";
import {
  convertUnderscorePropertiesToCamelCase,
  decodeGender,
  encodeGender,
} from "../utils/dataMapping.js";
import { createLimitSql, hashText } from "../utils/misc.js";
import { createUid } from "../utils/uid.js";

interface StaffSignInResult {
  id: string;
}

interface StaffAccount {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  address: string;
  longitude: string;
  latitude: string;
  identificationCard: string;
  gender: string;
  dateOfBirth: string;
}

interface ExtraStaffAccount {
  id: string;
  phone: string;
  name: string;
  gender: string;
  dateOfBirth: Date | string;
  avatar?: string;
  email?: string;
  address: string;
  longitude: string;
  latitude: string;
  identificationCard: string;
}

// còn thiếu căn cước công dân, địa chỉ

export type InformationToCreateStaffAccount = Omit<ExtraStaffAccount, "id">;
export type InformationToUpdateStaffAccount = Omit<ExtraStaffAccount, "id">;

const DEFAULT_PASSWORD = "default0";

export async function signIn(phone: string, password: string) {
  const findStaffIdQuery =
    "select id from staff_account where phone=? and password=? and deleted_at is null";
  const hashedPassword = hashText(password);
  const [staffRowDatas] = (await pool.query(findStaffIdQuery, [
    phone,
    hashedPassword,
  ])) as RowDataPacket[][];
  return convertUnderscorePropertiesToCamelCase(
    staffRowDatas[0] || null
  ) as StaffSignInResult | null;
}

export async function getStaffAccounts(limit?: LimitOptions) {
  let getStaffAccountsQuery =
    "select staff_account.id, staff_account.name, staff_account.date_of_birth, staff_account.phone, staff_account.gender, avatar, staff_account.address, staff_account.longitude, staff_account.latitude, staff_account.identificationCard from staff_account where staff_account.deleted_at is null";
  if (limit) {
    getStaffAccountsQuery += " " + createLimitSql(limit);
  }

  const [staffAccountRowDatas] = (await pool.query(
    getStaffAccountsQuery
  )) as RowDataPacket[][];
  return staffAccountRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as StaffAccount[];
}

export async function getInformation(staffAccountId?: string) {
  const getInformationQuery =
    "select staff_account.id, staff_account.name, staff_account.phone, gender, date_of_birth, avatar, staff_account.email, staff_account.address, staff_account.longitude, staff_account.latitude, staff_account.identificationCard from staff_account where staff_account.id=? and staff_account.deleted_at is null";
  const [staffRowDatas] = (await pool.query(getInformationQuery, [
    staffAccountId,
  ])) as RowDataPacket[][];

  if (Array.isArray(staffRowDatas) && staffRowDatas.length > 0) {
    const staffAccount = staffRowDatas[0];
    // remap data
    staffAccount["gender"] = decodeGender(staffAccount["gender"]);
    return convertUnderscorePropertiesToCamelCase(
      staffAccount
    ) as ExtraStaffAccount;
  }

  return null;
}

export async function addStaffAccount(
  staffInformation: InformationToCreateStaffAccount
) {
  const id = createUid(20);
  const {
    name,
    phone,
    gender,
    dateOfBirth,
    avatar,
    email,
    address,
    longitude,
    latitude,
    identificationCard,
  } = staffInformation;

  const existsPhone = await checkExistsPhone(phone);
  if (existsPhone) {
    console.log("this number is existed");
    return false;
  }

  const addStaffAccountQuery =
    "insert into staff_account(`id`, `name`, `phone`, `password`, `gender`, `date_of_birth`, `avatar`, `email`, `address`, `longitude`, `latitude`, `identificationCard`) values(?)";
  const [result] = (await pool.query(addStaffAccountQuery, [
    [
      id,
      name,
      phone,
      hashText(DEFAULT_PASSWORD),
      encodeGender(gender as string),
      new Date(dateOfBirth as Date | string),
      avatar,
      email,
      address,
      longitude,
      latitude,
      identificationCard,
    ],
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function updatePassword(
  staffAccountId: string,
  oldPassword: string,
  newPassword: string
) {
  const updatePasswordQuery =
    "update staff_account set password=? where id=? and password=?";
  const hashedOldPassword = hashText(oldPassword);
  const hashedNewPassword = hashText(newPassword);
  const [result] = (await pool.query(updatePasswordQuery, [
    hashedNewPassword,
    staffAccountId,
    hashedOldPassword,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function updateInformation(
  staffAccountId: string,
  information: InformationToUpdateStaffAccount
) {
  const {
    name,
    phone,
    gender,
    dateOfBirth,
    avatar,
    email,
    address,
    longitude,
    latitude,
    identificationCard,
  } = information;

  const existsPhone = await checkExistsPhone(phone, staffAccountId);
  if (existsPhone) {
    console.log("this number is existed");
    return false;
  }

  const updateInformationQuery =
    "update staff_account set name=?, phone=?, gender=?, date_of_birth=?, avatar=?, email=?, address=?, longitude=?, latitude=?, identificationCard=? where id=? and deleted_at is null";
  const [result] = (await pool.query(updateInformationQuery, [
    name,
    phone,
    encodeGender(gender as string),
    new Date(dateOfBirth as string),
    avatar,
    email,
    address,
    longitude,
    latitude,
    identificationCard,
    staffAccountId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function deleteAccount(staffAccountId: string) {
  const deleteAccountQuery =
    "update staff_account set deleted_at=? where id=? and deleted_at is null";
  const [result] = (await pool.query(deleteAccountQuery, [
    new Date(),
    staffAccountId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function resetPassword(
  staffAccountId: string,
  defaultPassword = DEFAULT_PASSWORD
) {
  const resetPasswordQuery =
    "update staff_account set password=? where id=? and deleted_at is null";
  const hashedDefaultPassword = hashText(defaultPassword);
  const [result] = (await pool.query(resetPasswordQuery, [
    hashedDefaultPassword,
    staffAccountId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function checkExistsPhone(phone: string, staffAccountId?: string) {
  let checkExistsPhoneQuery =
    "select phone from staff_account where phone=? and deleted_at is null";
  if (staffAccountId) {
    checkExistsPhoneQuery += ` and id<> ${escape(staffAccountId)}`;
  }

  const [result] = (await pool.query(checkExistsPhoneQuery, [
    phone,
  ])) as RowDataPacket[][];
  return result.length > 0;
}
