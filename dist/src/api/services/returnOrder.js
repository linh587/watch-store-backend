import dotenv from "dotenv";
import pool from "../db.js";
import { createUid } from "../utils/uid.js";
import * as ReturnOrdertDetailService from "./returnOrderDetail.js";
import * as ProductService from "./product.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
const MYSQL_DB = process.env.MYSQL_DB || "watch_db";
const SORT_TYPES = ["newest", "oldest"];
dotenv.config();
function createSortSql(sort) {
    switch (sort) {
        case "newest":
            return "order by request_date desc";
        case "oldest":
            return "order by request_date asc";
        default:
            return "";
    }
}
export async function getAllReturnOrders(options) {
    let getAllReturnOrdersQuery = `select id, order_id, request_date, total_product, status, creator, updated_at from ${MYSQL_DB}.return_order where deleted_at is null`;
    if (options) {
        if (options.sort) {
            getAllReturnOrdersQuery += " " + createSortSql(options.sort);
        }
    }
    const [orderRowDatas] = (await pool.query(getAllReturnOrdersQuery));
    return orderRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function createReturnOrder(information) {
    const returnOrderId = createUid(20);
    const { orderId, requestDate, status, creator, updatedAt, details } = information;
    if (details.length <= 0) {
        return "";
    }
    const temporaryReturnOrderDetails = (await Promise.all(details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productPriceId);
        if (!productId) {
            return null;
        }
        return { ...detail };
    }))).flatMap((detail) => (detail ? [detail] : []));
    const totalAmount = calculateTemporaryTotalPrice(temporaryReturnOrderDetails);
    const createReturnOrderQuery = "insert into return_order(`id`, `order_id`, `request_date`,`total_product`, `status`, `creator`, `updated_at`) values (?)";
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(createReturnOrderQuery, [
            [returnOrderId, orderId, requestDate, totalAmount, status, creator, updatedAt],
        ]);
        await ReturnOrdertDetailService.addReturnOrderDetails(returnOrderId, orderId, temporaryReturnOrderDetails, poolConnection);
        await poolConnection.commit();
        return returnOrderId;
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
export async function updateStatusReturnOrder(returnOrderId, information) {
    const { status, creator, updatedAt } = information;
    const updateReturnOrderQuery = "UPDATE " +
        MYSQL_DB +
        ".return_order SET status=?, creator=?, updated_at=? WHERE id=?";
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(updateReturnOrderQuery, [
            status,
            creator,
            updatedAt,
            returnOrderId,
        ]);
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
export async function updateReturnOrder(returnOrderId, information) {
    const { orderId, requestDate, status, creator, updatedAt, details } = information;
    if (details.length <= 0) {
        return false;
    }
    const temporaryReturnOrderDetails = (await Promise.all(details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productPriceId);
        if (!productId) {
            return null;
        }
        return { ...detail };
    }))).flatMap((detail) => (detail ? [detail] : []));
    const totalAmount = calculateTemporaryTotalPrice(temporaryReturnOrderDetails);
    const updateReturnOrderQuery = "UPDATE " +
        MYSQL_DB +
        ".return_order SET reques_date=?, status = ?, creator=?, updated_at = ?, total_product = ? WHERE id = ?";
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(updateReturnOrderQuery, [
            requestDate,
            status,
            creator,
            updatedAt,
            totalAmount,
            returnOrderId
        ]);
        await ReturnOrdertDetailService.updateReturnOrderDetails(returnOrderId, temporaryReturnOrderDetails, poolConnection);
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
export function calculateTemporaryTotalPrice(returnOrderItems) {
    const totalAmount = returnOrderItems.reduce((totalAmount, { quantity }) => totalAmount + quantity, 0);
    return totalAmount;
}
export async function getReturnOrderById(returnOrderId) {
    const getReturnOrderQuery = `select id, order_id, request_date, status, creator, updated_at, total_product from ${MYSQL_DB}.return_order where id=? and deleted_at is null`;
    const [returnOrderRowDatas] = (await pool.query(getReturnOrderQuery, [
        returnOrderId,
    ]));
    if (returnOrderRowDatas.length <= 0) {
        return null;
    }
    const details = await ReturnOrdertDetailService.getReturnOrderDetails(returnOrderId);
    return convertUnderscorePropertiesToCamelCase({
        ...returnOrderRowDatas[0],
        details,
    });
}
export async function deleteReturnOrder(id, continueWithConnection) {
    const deleteReceiptQuery = "update return_order set deleted_at=? where id=?";
    const connection = continueWithConnection || (await pool.getConnection());
    const deletedDateTime = new Date();
    try {
        await connection.beginTransaction();
        await connection.query(deleteReceiptQuery, [deletedDateTime, id]);
        await ReturnOrdertDetailService.deleteReturOrderById(id, connection);
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
