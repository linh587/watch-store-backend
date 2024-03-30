import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { hashText } from "../utils/misc.js";
export async function signIn(username, password) {
    const findAdminAccountQuery = `select username, type from admin_account where username=? and password=?`;
    const [adminAccountRowDatas] = (await pool.query(findAdminAccountQuery, [
        username,
        password,
    ]));
    const adminAccount = convertUnderscorePropertiesToCamelCase(adminAccountRowDatas[0] || null);
    return adminAccount;
}
export async function getInformation(username) {
    const getInformationQuery = "select username, type from admin_account where username=?";
    const [adminAccountRowDatas] = (await pool.query(getInformationQuery, [
        username,
    ]));
    return (convertUnderscorePropertiesToCamelCase(adminAccountRowDatas[0] || null) || null);
}
export async function updatePassword(username, oldPassword, newPassword) {
    const updatePasswordQuery = "update admin_account set password=? where username=? and password=?";
    const hashedOldPassword = hashText(oldPassword);
    const hashedNewPassword = hashText(newPassword);
    const [result] = (await pool.query(updatePasswordQuery, [
        hashedNewPassword,
        username,
        hashedOldPassword,
    ]));
    return result.affectedRows > 0;
}
