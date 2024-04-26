import dotenv from "dotenv";
import pool from "../db.js";
import { createUid } from "../utils/uid.js";
import * as DamageDetailService from "./damageDetail.js";
import * as ProductService from "./product.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
const MYSQL_DB = process.env.MYSQL_DB || "watch_db";
dotenv.config();
export async function getAllDamages() {
    let getAllDamagisQuery = `select id, total_amount, creator, created_at, note from ${MYSQL_DB}.damage where deleted_at is null`;
    const [damageRowDatas] = (await pool.query(getAllDamagisQuery));
    return damageRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function createDamage(information) {
    const damageId = createUid(20);
    const createdAt = new Date();
    const { creator, note, details } = information;
    if (details.length <= 0) {
        return "";
    }
    const temporaryDamageDetails = (await Promise.all(details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productId);
        if (!productId) {
            return null;
        }
        return { ...detail };
    }))).flatMap((detail) => (detail ? [detail] : []));
    const totalAmount = calculateTemporaryTotalQuantity(temporaryDamageDetails);
    const createDamageQuery = "insert into " +
        MYSQL_DB +
        ".damage(`id`, `creator`, `created_at`, `note`, `total_amount`) values (?)";
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(createDamageQuery, [
            [damageId, creator, createdAt, note, totalAmount],
        ]);
        await DamageDetailService.addDamageDetails(damageId, temporaryDamageDetails, poolConnection);
        await poolConnection.commit();
        return damageId;
    }
    catch (error) {
        await poolConnection.rollback();
        console.log(error);
        return "";
    }
    finally {
        poolConnection.release();
    }
}
export async function updateDamage(damageId, information) {
    const { creator, note, details } = information;
    if (details.length <= 0) {
        return false;
    }
    const temporaryDamageDetails = (await Promise.all(details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productId);
        if (!productId) {
            return null;
        }
        return { ...detail };
    }))).flatMap((detail) => (detail ? [detail] : []));
    const totalAmount = calculateTemporaryTotalQuantity(temporaryDamageDetails);
    const updateDamage = "UPDATE " +
        MYSQL_DB +
        ".damage SET creator = ?, note = ?, total_amount = ? WHERE id = ?";
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(updateDamage, [
            creator,
            note,
            totalAmount,
            damageId,
        ]);
        await DamageDetailService.updateDamageDetails(damageId, temporaryDamageDetails, poolConnection);
        await poolConnection.commit();
        return true;
    }
    catch (error) {
        await poolConnection.rollback();
        console.log(error);
        return false;
    }
    finally {
        poolConnection.release();
    }
}
export function calculateTemporaryTotalQuantity(damageItems) {
    const totalAmount = damageItems.reduce((totalAmount, { quantity }) => totalAmount + quantity, 0);
    return totalAmount;
}
export async function getDamageById(damageId) {
    const getDamageQuery = `select id, total_amount, creator, created_at, note from ${MYSQL_DB}.damage where id=? and deleted_at is null`;
    const [damageRowDatas] = (await pool.query(getDamageQuery, [
        damageId,
    ]));
    if (damageRowDatas.length <= 0) {
        return null;
    }
    const details = await DamageDetailService.getDamageDetails(damageId);
    return convertUnderscorePropertiesToCamelCase({
        ...damageRowDatas[0],
        details,
    });
}
export async function deleteDamage(id, continueWithConnection) {
    const deleteDamageQuery = "update damage set deleted_at=? where id=?";
    const connection = continueWithConnection || (await pool.getConnection());
    const deletedDateTime = new Date();
    try {
        await connection.beginTransaction();
        await connection.query(deleteDamageQuery, [deletedDateTime, id]);
        await DamageDetailService.deleteDamageId(id, connection);
        await connection.commit();
        return true;
    }
    catch (error) {
        console.log(error);
        await connection.rollback();
        return false;
    }
    finally {
        connection.release();
    }
}
