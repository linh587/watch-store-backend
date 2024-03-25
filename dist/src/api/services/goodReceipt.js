import dotenv from "dotenv";
import pool from "../db.js";
import { createUid } from "../utils/uid.js";
import * as GoodReceiptDetailService from "./goodReceiptDetail.js";
import * as ProductService from "./product.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
const MYSQL_DB = process.env.MYSQL_DB || "watch_db";
dotenv.config();
export async function getAllGoodReceipts() {
    let getAllGoodReceiptsQuery = `select id, total_amount, deliver, delivery_date, creator, note, supplier_id from ${MYSQL_DB}.good_receipt`;
    const [goodReceiptRowDatas] = (await pool.query(getAllGoodReceiptsQuery));
    return goodReceiptRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function createGoodReciept(information) {
    const goodReceiptId = createUid(20);
    const { deliver, deliveryDate, creator, note, supplierId, details } = information;
    if (details.length <= 0) {
        return "";
    }
    const temporaryGoodRecieptDetails = (await Promise.all(details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productId);
        if (!productId) {
            return null;
        }
        return { ...detail };
    }))).flatMap((detail) => (detail ? [detail] : []));
    const totalAmount = calculateTemporaryTotalPrice(temporaryGoodRecieptDetails);
    const createGoodRecieptQuery = "insert into " +
        MYSQL_DB +
        ".good_receipt(`id`, `deliver`, `delivery_date`, `creator`, `note`, `total_amount`, `supplier_id`) values (?)";
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(createGoodRecieptQuery, [
            [
                goodReceiptId,
                deliver,
                deliveryDate,
                creator,
                note,
                totalAmount,
                supplierId,
            ],
        ]);
        await GoodReceiptDetailService.addGoodReceiptDetails(goodReceiptId, temporaryGoodRecieptDetails, poolConnection);
        await poolConnection.commit();
        return goodReceiptId;
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
export async function updateGoodReceipt(goodReceiptId, information) {
    const { deliver, deliveryDate, creator, note, supplierId, details } = information;
    if (details.length <= 0) {
        return false;
    }
    const temporaryGoodReceiptDetails = (await Promise.all(details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productId);
        if (!productId) {
            return null;
        }
        return { ...detail };
    }))).flatMap((detail) => (detail ? [detail] : []));
    const totalAmount = calculateTemporaryTotalPrice(temporaryGoodReceiptDetails);
    const updateGoodReceiptQuery = "UPDATE " +
        MYSQL_DB +
        ".good_receipt SET deliver = ?, delivery_date = ?, creator = ?, note = ?, total_amount = ?, supplier_id = ? WHERE id = ?";
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(updateGoodReceiptQuery, [
            deliver,
            deliveryDate,
            creator,
            note,
            totalAmount,
            supplierId,
            goodReceiptId,
        ]);
        await GoodReceiptDetailService.updateGoodReceiptDetails(goodReceiptId, temporaryGoodReceiptDetails, poolConnection);
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
export function calculateTemporaryTotalPrice(goodReceiptItems) {
    const totalAmount = goodReceiptItems
        .map(({ price, quantity }) => price * quantity)
        .reduce((totalAmount, price) => totalAmount + price, 0);
    return totalAmount;
}
export async function getGoodReceiptById(receiptId) {
    const getGoodReceiptQuery = `select id, total_amount, deliver, delivery_date, creator, note, supplier_id from ${MYSQL_DB}.good_receipt where id=?`;
    const [goodReceiptRowDatas] = (await pool.query(getGoodReceiptQuery, [
        receiptId,
    ]));
    if (goodReceiptRowDatas.length <= 0) {
        return null;
    }
    const details = await GoodReceiptDetailService.getGoodReceiptDetails(receiptId);
    return convertUnderscorePropertiesToCamelCase({
        ...goodReceiptRowDatas[0],
        details,
    });
}
