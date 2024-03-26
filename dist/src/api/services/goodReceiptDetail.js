import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
export async function getGoodReceiptDetails(receiptId, continueWithConnection) {
    const connection = continueWithConnection || pool;
    const getGoodReceiptDetailsQuery = "select receipt_id, product_id, quantity, price, note from good_receipt_detail where receipt_id=?";
    const [goodReceiptDetailRowDatas] = (await connection.query(getGoodReceiptDetailsQuery, [receiptId]));
    return goodReceiptDetailRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function addGoodReceiptDetails(goodReceiptId, details, connection) {
    const addGoodReceiptDetailsQuery = "insert into good_receipt_detail(`receipt_id`, `product_id`, `quantity`, `price`, `note`) VALUES ?";
    const goodReceiptDetailRowDatas = details.map((detail) => [
        goodReceiptId,
        detail.productId,
        detail.quantity,
        detail.price,
        detail.note,
    ]);
    const [result] = (await connection.query(addGoodReceiptDetailsQuery, [
        goodReceiptDetailRowDatas,
    ]));
    return result.affectedRows > 0;
}
export async function updateGoodReceiptDetails(goodReceiptId, details, connection) {
    const updateGoodReceiptDetailsQuery = "UPDATE good_receipt_detail SET quantity = ?, price = ?, note = ?, updated_at = ? WHERE receipt_id = ? AND product_id = ?";
    const updateOperations = details.map(async (detail) => {
        const values = [
            detail.quantity,
            detail.price,
            detail.note,
            detail.updatedAt,
            goodReceiptId,
            detail.productId,
        ];
        await connection.query(updateGoodReceiptDetailsQuery, values);
    });
    await Promise.all(updateOperations);
}
