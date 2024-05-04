import { OkPacket, RowDataPacket } from "mysql2";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { hashText } from "../utils/misc.js";

type AdminAccountType = "store" | "website";

interface AdminSignInResult {
  id: string;
  username: string;
  type: AdminAccountType;
}

type AdminAccount = AdminSignInResult;

export async function signIn(username: string, password: string) {
  const findAdminAccountQuery = `select id from admin_account where username=? and password=?`;
  const [adminAccountRowDatas] = (await pool.query(findAdminAccountQuery, [
    username,
    password,
  ])) as RowDataPacket[][];
  const adminAccount = convertUnderscorePropertiesToCamelCase(
    adminAccountRowDatas[0] || null
  ) as AdminSignInResult | null;
  return adminAccount;
}

export async function getInformation(id?: string) {
  const getInformationQuery =
    "select id, username, type from admin_account where id=?";
  const [adminAccountRowDatas] = (await pool.query(getInformationQuery, [
    id,
  ])) as RowDataPacket[][];

  return (
    (convertUnderscorePropertiesToCamelCase(
      adminAccountRowDatas[0] || null
    ) as AdminAccount) || null
  );
}

export async function updatePassword(
  username: string,
  oldPassword: string,
  newPassword: string
) {
  const updatePasswordQuery =
    "update admin_account set password=? where id=? and password=?";
  const hashedOldPassword = hashText(oldPassword);
  const hashedNewPassword = hashText(newPassword);
  const [result] = (await pool.query(updatePasswordQuery, [
    hashedNewPassword,
    username,
    hashedOldPassword,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}
