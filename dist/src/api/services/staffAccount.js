import { escape } from 'mysql2/promise';
import { MAX_DELIVERING_ORDER } from '../config.js';
import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase, decodeGender, encodeGender } from '../utils/dataMapping.js';
import { createLimitSql, hashText } from '../utils/misc.js';
import { createUid } from '../utils/uid.js';
const DEFAULT_PASSWORD = 'default0';
export async function signIn(phone, password) {
    const findStaffIdQuery = 'select id, first_login from staff_account where phone=? and password=? and deleted_at is null';
    const hashedPassword = hashText(password);
    const [staffRowDatas] = await pool.query(findStaffIdQuery, [phone, hashedPassword]);
    return convertUnderscorePropertiesToCamelCase(staffRowDatas[0] || null);
}
export async function getStaffAccounts(limit) {
    let getStaffAccountsQuery = 'select staff_account.id, branch_id, branch.name as branch_name, staff_account.name, staff_account.phone, delivering_count, avatar from staff_account inner join branch on branch_id=branch.id where staff_account.deleted_at is null';
    if (limit) {
        getStaffAccountsQuery += ' ' + createLimitSql(limit);
    }
    const [staffAccountRowDatas] = await pool.query(getStaffAccountsQuery);
    return staffAccountRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getInformation(staffAccountId) {
    const getInformationQuery = 'select staff_account.id, branch_id, branch.name as branch_name, staff_account.name, staff_account.phone, delivering_count, gender, date_of_birth, avatar, email, first_login from staff_account inner join branch on branch_id=branch.id where staff_account.id=? and staff_account.deleted_at is null';
    const [staffRowDatas] = await pool.query(getInformationQuery, [staffAccountId]);
    if (Array.isArray(staffRowDatas) && staffRowDatas.length > 0) {
        const staffAccount = staffRowDatas[0];
        // remap data
        staffAccount['gender'] = decodeGender(staffAccount['gender']);
        return convertUnderscorePropertiesToCamelCase(staffAccount);
    }
    return null;
}
export async function addStaffAccount(staffInformation) {
    const id = createUid(20);
    const { name, branchId, phone, gender, dateOfBirth, avatar, email } = staffInformation;
    const existsPhone = await checkExistsPhone(phone);
    if (existsPhone) {
        return false;
    }
    const addStaffAccountQuery = 'insert into staff_account(`id`, `branch_id`, `name`, `phone`, `password`, `gender`, `date_of_birth`, `avatar`, `email`, `first_login`) values(?)';
    const [result] = await pool.query(addStaffAccountQuery, [[id, branchId, name, phone, DEFAULT_PASSWORD, encodeGender(gender), new Date(dateOfBirth), avatar, email, true]]);
    return result.affectedRows > 0;
}
export async function updatePassword(staffAccountId, oldPassword, newPassword) {
    const updatePasswordQuery = 'update staff_account set password=?, first_login=false where id=? and password=?';
    const hashedOldPassword = hashText(oldPassword);
    const hashedNewPassword = hashText(newPassword);
    const [result] = await pool.query(updatePasswordQuery, [hashedNewPassword, staffAccountId, hashedOldPassword]);
    return result.affectedRows > 0;
}
export async function updateBranch(staffAccountId, branchId) {
    const updateBranchQuery = 'update staff_account set branch_id=? where id=? and deleted_at is null and delivering_count=0';
    const [result] = await pool.query(updateBranchQuery, [branchId, staffAccountId]);
    return result.affectedRows > 0;
}
export async function updateInformation(staffAccountId, information) {
    const { name, phone, gender, dateOfBirth, avatar, email } = information;
    const existsPhone = await checkExistsPhone(phone, staffAccountId);
    if (existsPhone) {
        return false;
    }
    const updateInformationQuery = 'update staff_account set name=?, phone=?, gender=?, date_of_birth=?, avatar=?, email=? where id=? and deleted_at is null';
    const [result] = await pool.query(updateInformationQuery, [name, phone, encodeGender(gender), new Date(dateOfBirth), avatar, email, staffAccountId]);
    return result.affectedRows > 0;
}
export async function deleteAccount(staffAccountId) {
    const deleteAccountQuery = 'update staff_account set deleted_at=? where id=? and deleted_at is null and delivering_count=0';
    const [result] = await pool.query(deleteAccountQuery, [new Date(), staffAccountId]);
    return result.affectedRows > 0;
}
export async function resetPassword(staffAccountId, defaultPassword = DEFAULT_PASSWORD) {
    const resetPasswordQuery = 'update staff_account set password=?, first_login=true where id=? and deleted_at is null';
    const hashedDefaultPassword = hashText(defaultPassword);
    const [result] = await pool.query(resetPasswordQuery, [hashedDefaultPassword, staffAccountId]);
    return result.affectedRows > 0;
}
export async function checkExistsPhone(phone, staffAccountId) {
    let checkExistsPhoneQuery = 'select phone from staff_account where phone=? and deleted_at is null';
    if (staffAccountId) {
        checkExistsPhoneQuery += ` and id<> ${escape(staffAccountId)}`;
    }
    const [result] = await pool.query(checkExistsPhoneQuery, [phone]);
    return result.length > 0;
}
export async function countNotDeliveringStaff(branchId) {
    const countNotDeliveringStaffQuery = 'select count(id) as not_delivering_staff_count from staff_account where branch_id=? and delivering_count=0 and deleted_at is null';
    const [rowDatas] = await pool.query(countNotDeliveringStaffQuery, [branchId]);
    return Number(rowDatas?.[0]?.['not_delivering_staff_count']) || 0;
}
export async function increaseDeliveringCount(staffAccountId, connection) {
    const setDeliveryQuery = `update staff_account set delivering_count=delivering_count + 1 where id=? and delivering_count<${MAX_DELIVERING_ORDER}`;
    const [result] = await connection.query(setDeliveryQuery, [staffAccountId]);
    return result.affectedRows > 0;
}
export async function decreaseDeliveringCount(staffAccountId, connection) {
    const setDeliveryQuery = 'update staff_account set delivering_count=delivering_count-1 where id=? and delivering_count>0';
    const [result] = await connection.query(setDeliveryQuery, [staffAccountId]);
    return result.affectedRows > 0;
}
