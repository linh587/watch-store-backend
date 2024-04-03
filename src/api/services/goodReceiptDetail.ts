import { OkPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { TemporaryGoodRecieptDetail } from "./goodReceipt.js";

export interface GoodReceiptDetail {
  receiptId: string;
  productId: string;
  quantity: number;
  sizeId: string;
  price: number;
  note?: string;
}

export async function getGoodReceiptDetails(
  receiptId: string,
  continueWithConnection?: PoolConnection
) {
  const connection = continueWithConnection || pool;
  const getGoodReceiptDetailsQuery =
    "select receipt_id, product_id, quantity, size_id, price, note from good_receipt_detail where receipt_id=?";
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
    "insert into good_receipt_detail(`receipt_id`, `product_id`, `quantity`, `size_id`, `price`, `note`) VALUES (?)";

  const updateQuantityQuery =
    "update product_price\
  set quantity = product_price.quantity + ?\
  where product_price.product_id= ? \
  and product_price.product_size_id= ?";

  const goodReceiptDetailRowDatas = details.map((detail) => [
    goodReceiptId,
    detail.productId,
    detail.quantity,
    detail.sizeId,
    detail.price,
    detail.note,
  ]);

  for (const detail of goodReceiptDetailRowDatas) {
    await connection.query(addGoodReceiptDetailsQuery, [detail]);
    await connection.query(updateQuantityQuery, [
      detail[2],
      detail[1],
      detail[3],
    ]);
  }
  return true;
}

export async function addGoodReceiptDetails1(
  goodReceiptId: string,
  details: TemporaryGoodRecieptDetail[],
  connection: PoolConnection
) {
  const addGoodReceiptDetailsQuery =
    "insert into good_receipt_detail(`receipt_id`, `product_id`, `quantity`, `size_id`, `price`, `note`) VALUES ?";
  const goodReceiptDetailRowDatas = details.map((detail) => [
    goodReceiptId,
    detail.productId,
    detail.quantity,
    detail.sizeId,
    detail.price,
    detail.note,
  ]);

  const [result] = (await connection.query(addGoodReceiptDetailsQuery, [
    goodReceiptDetailRowDatas,
  ])) as OkPacket[];
  if (result.affectedRows > 0) {
    const updateQuantityQuery =
      "update product_price\
    set quantity = product_price.quantity + ?\
    where product_price.product_id= ? \
    and product_price.product_size_id= ?";
    const quantityRowData = details.map((details) => [details.quantity]);
    const productIdRowData = details.map((details) => [details.productId]);
    const sizeIdRowData = details.map((details) => [details.sizeId]);
    await connection.query(updateQuantityQuery, [
      quantityRowData,
      productIdRowData,
      sizeIdRowData,
    ]);
  }
  return result.affectedRows > 0;
}

export async function updateGoodReceiptDetails(
  goodReceiptId: string,
  details: TemporaryGoodRecieptDetail[],
  connection: PoolConnection
) {
  const updateGoodReceiptDetailsQuery =
    "UPDATE good_receipt_detail SET quantity = ?, size_id=?, price = ?, note = ? WHERE receipt_id = ? AND product_id = ?";

  const updateOperations = details.map(async (detail) => {
    const values = [
      detail.quantity,
      detail.sizeId,
      detail.price,
      detail.note,
      goodReceiptId,
      detail.productId,
    ];
    await connection.query(updateGoodReceiptDetailsQuery, values);
  });

  await Promise.all(updateOperations);
}

export async function deleteReceiptDetailByReceipId(
  receipId: string,
  connection: PoolConnection
) {
  const deleteReceiptDetailByReceipIdQuery =
    "update good_receipt_detail set deleted_at=? where receipt_id=?";
  const [result] = (await connection.query(deleteReceiptDetailByReceipIdQuery, [
    new Date(),
    receipId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}
