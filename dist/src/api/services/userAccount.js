import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase, decodeGender, encodeGender } from '../utils/dataMapping.js';
import { createLimitSql, hashText } from '../utils/misc.js';
import { createUid } from '../utils/uid.js';
import { setUnavailableRating } from './rating.js';
export async function signIn(email, password) {
    const findUserAccountQuery = 'select id, verified from user_account where email=? and password=? and deleted_at is null and verified=true';
    const hashedPassword = hashText(password);
    const [userAccountRowDatas] = await pool.query(findUserAccountQuery, [email, hashedPassword]);
    return convertUnderscorePropertiesToCamelCase(userAccountRowDatas[0] || null);
}
export async function getUserAccounts(limit) {
    let getUserAccountsQuery = 'select id, name, avatar, locked from user_account where deleted_at is null';
    if (limit) {
        getUserAccountsQuery += ' ' + createLimitSql(limit);
    }
    const [userAccountRowDatas] = await pool.query(getUserAccountsQuery);
    return userAccountRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getInformation(userAccountId) {
    const findUserInformationQuery = 'select phone, name, gender, date_of_birth, avatar, email, address, longitude, latitude from user_account where id=? and deleted_at is null';
    const [userInformationRowDatas] = await pool.query(findUserInformationQuery, [userAccountId]);
    if (Array.isArray(userInformationRowDatas) && userInformationRowDatas.length > 0) {
        // remap data
        userInformationRowDatas[0].gender = decodeGender(userInformationRowDatas[0].gender);
        return convertUnderscorePropertiesToCamelCase(userInformationRowDatas[0] || null);
    }
    return null;
}
export async function updateInformation(userAccountId, information) {
    const { email, name, gender, dateOfBirth, phone, avatar, address, longitude, latitude } = information;
    const updateUserInformationQuery = 'update user_account set phone=?, name=?, gender=?, date_of_birth=?, avatar=?, email=?, address=?, longitude=?, latitude=?  where id=? and deleted_at is null';
    const [result] = await pool.query(updateUserInformationQuery, [phone, name, encodeGender(gender), new Date(dateOfBirth), avatar, email, address, longitude, latitude, userAccountId]);
    return result.affectedRows > 0;
}
export async function updatePassword(userAccountId, oldPassword, newPassword) {
    const updatePasswordQuery = 'update user_account set password=? where id=? and password=?';
    const hashedOldPassword = hashText(oldPassword);
    const hashedNewPassword = hashText(newPassword);
    const [result] = await pool.query(updatePasswordQuery, [hashedNewPassword, userAccountId, hashedOldPassword]);
    return result.affectedRows > 0;
}
export async function deleteAccount(userAccountId) {
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        const deleteAccountQuery = 'update user_account set deleted_at=? where id=? and deleted_at is null';
        const [result] = await poolConnection.query(deleteAccountQuery, [new Date(), userAccountId]);
        if (result.affectedRows <= 0) {
            throw new Error('Not yet delete user account');
        }
        await setUnavailableRating(userAccountId, poolConnection);
        await poolConnection.commit();
        return true;
    }
    catch (error) {
        console.log(error);
        await poolConnection.rollback();
        return false;
    }
    finally {
        poolConnection.release();
    }
}
export async function forceUpdatePassword(userAccountId, password) {
    const updatePasswordQuery = 'update user_account set password=? where id=? and deleted_at is null';
    const hashedPassword = hashText(password);
    try {
        const [result] = await pool.query(updatePasswordQuery, [hashedPassword, userAccountId]);
        return result.affectedRows > 0;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}
export async function getId(email) {
    const getIdQuery = 'select id from user_account where email=? and deleted_at is null';
    const [result] = await pool.query(getIdQuery, [email]);
    return result.length > 0 ? result[0].id : '';
}
export async function createAccount(information) {
    const id = createUid(20);
    const { email, name, password, gender, dateOfBirth, phone, avatar, address, longitude, latitude } = information;
    const hashedPassword = hashText(password);
    const createUserAccountQuery = 'insert into user_account(`id`, `phone`, `name`, `password`, `gender`, `date_of_birth`, `avatar`, `email`, `address`, `longitude`, `latitude`) values(?)';
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        const isExistsEmail = await checkExistsEmail(String(email), poolConnection);
        if (isExistsEmail) {
            throw new Error(`Email '${email}' is registered`);
        }
        const [result] = await poolConnection.query(createUserAccountQuery, [[id, phone, name, hashedPassword, encodeGender(gender), new Date(dateOfBirth), avatar, email, address, longitude, latitude]]);
        await poolConnection.commit();
        return result.affectedRows > 0 ? id : '';
    }
    catch (error) {
        console.log(error);
        await poolConnection.rollback();
        return '';
    }
    finally {
        poolConnection.release();
    }
}
export async function checkExistsEmail(email, continueWithConnection) {
    const connection = continueWithConnection || pool;
    const checkExistsEmailQuery = 'select email from user_account where email=? and deleted_at is null';
    const [result] = await connection.query(checkExistsEmailQuery, [email]);
    return result.length > 0;
}
export async function verifyEmail(id) {
    const verifyEmailQuery = 'update user_account set verified=true where id=? and deleted_at is null';
    const [result] = await pool.query(verifyEmailQuery, [id]);
    return result.affectedRows > 0;
}
export async function lockAccount(userAccountId) {
    const lockAccountQuery = 'update user_account set locked=true where id=? and locked=false and deleted_at is null';
    const [result] = await pool.query(lockAccountQuery, [userAccountId]);
    return result.affectedRows > 0;
}
export async function unlockAccount(userAccountId) {
    const lockAccountQuery = 'update user_account set locked=false where id=? and locked=true and deleted_at is null';
    const [result] = await pool.query(lockAccountQuery, [userAccountId]);
    return result.affectedRows > 0;
}
export async function checkLock(userAccountId) {
    const checkLockQuery = 'select count(id) as locked_count from user_account where id=? and locked=true';
    const [rowDatas] = await pool.query(checkLockQuery, [userAccountId]);
    return Boolean(rowDatas[0]['locked_count']);
}
