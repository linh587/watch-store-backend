import { OkPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { TemporaryGoodRecieptDetail } from "./goodReceipt.js";

export interface GoodReceiptDetail {
  receiptId: string;
  productId: string;
  quantity: number;
  price: number;
  note?: string;
}

export async function getGoodReceiptDetails(
  receiptId: string,
  continueWithConnection?: PoolConnection
) {
  const connection = continueWithConnection || pool;
  const getGoodReceiptDetailsQuery =
    "select receipt_id, product_id, quantity, price, note from good_receipt_detail where receipt_id=?";
  const [goodReceiptDetailRowDatas] = (await connection.query(
    getGoodReceiptDetailsQuery,
    [receiptId]
  )) as RowDataPacket[][];
  return goodReceiptDetailRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as GoodReceiptDetail[];
}

export async function addGoodReceiptDetails(
  goodReceiptId: string,
  details: TemporaryGoodRecieptDetail[],
  connection: PoolConnection
) {
  const addGoodReceiptDetailsQuery =
    "insert into good_receipt_detail(`receipt_id`, `product_id`, `quantity`, `price`, `note`) VALUES ?";
  const goodReceiptDetailRowDatas = details.map((detail) => [
    goodReceiptId,
    detail.productId,
    detail.quantity,
    detail.price,
    detail.note,
  ]);

  const [result] = (await connection.query(addGoodReceiptDetailsQuery, [
    goodReceiptDetailRowDatas,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function updateGoodReceiptDetails(
  goodReceiptId: string,
  details: TemporaryGoodRecieptDetail[],
  connection: PoolConnection
) {
  const updateGoodReceiptDetailsQuery =
    "UPDATE good_receipt_detail SET quantity = ?, price = ?, note = ?, updated_at = ? WHERE receipt_id = ? AND product_id = ?";

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
