import dotenv from "dotenv";
import pool from "../db.js";
import { createUid } from "../utils/uid.js";
import * as GoodReceiptDetailService from "./goodReceiptDetail.js";
import * as ProductService from "./product.js";
import { RowDataPacket } from "mysql2";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { PoolConnection } from "mysql2/promise";

const MYSQL_DB = process.env.MYSQL_DB || "watch_db";

export interface GoodReceipt {
  id: string;
  totalAmount: number;
  deliver: string;
  deliveryDate: Date;
  creator?: string;
  note?: string;
  supplierId: string;
  details: GoodReceiptDetailService.GoodReceiptDetail[];
}

export interface InfomationToCreateGoodReciept {
  deliver: string;
  deliveryDate: Date;
  creator: string;
  note: string;
  supplierId: string;
  details: Omit<TemporaryGoodRecieptDetail, "product">[];
}

export interface InformationToUpdateGoodReceipt {
  deliver: string;
  deliveryDate: Date;
  creator: string;
  note: string;
  supplierId: string;
  details: Omit<TemporaryGoodRecieptDetail, "product">[];
}

export interface TemporaryGoodReciept {
  supplierId: string;
  details: TemporaryGoodRecieptDetail[];
}

export interface TemporaryGoodRecieptDetail {
  productId: string;
  quantity: number;
  sizeId: string;
  price: number;
  note?: string;
}

const SORT_TYPES = ["newest", "oldest"] as const;

export interface GetGoodReceiptOptions {
  sort?: (typeof SORT_TYPES)[number];
}

dotenv.config();

export type SortType = (typeof SORT_TYPES)[number];

function createSortSql(sort: SortType) {
  switch (sort) {
    case "newest":
      return "order by delivery_date desc";
    case "oldest":
      return "order by delivery_date asc";
    default:
      return "";
  }
}

export async function getAllGoodReceipts(options?: GetGoodReceiptOptions) {
  let getAllGoodReceiptsQuery = `select id, total_amount, deliver, delivery_date, creator, note, supplier_id from ${MYSQL_DB}.good_receipt where deleted_at is null`;

  if (options) {
    if (options.sort) {
      getAllGoodReceiptsQuery += " " + createSortSql(options.sort);
    }
  }

  const [orderRowDatas] = (await pool.query(
    getAllGoodReceiptsQuery
  )) as RowDataPacket[][];
  return orderRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as GoodReceipt[];
}

export async function createGoodReciept(
  information: InfomationToCreateGoodReciept
) {
  const goodReceiptId = createUid(20);

  const { deliver, deliveryDate, creator, note, supplierId, details } =
    information;

  if (details.length <= 0) {
    return "";
  }

  const temporaryGoodRecieptDetails = (
    await Promise.all(
      details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productId);
        if (!productId) {
          return null;
        }
        return { ...detail };
      })
    )
  ).flatMap((detail) => (detail ? [detail] : []));

  const totalAmount = calculateTemporaryTotalPrice(temporaryGoodRecieptDetails);

  const createGoodRecieptQuery =
    "insert into " +
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
    await GoodReceiptDetailService.addGoodReceiptDetails(
      goodReceiptId,
      temporaryGoodRecieptDetails,
      poolConnection
    );
    await poolConnection.commit();
    return goodReceiptId;
  } catch (error) {
    await poolConnection.rollback();
    console.log(error);
    return "";
  } finally {
    poolConnection.release();
  }
}

export async function updateGoodReceipt(
  goodReceiptId: string,
  information: InformationToUpdateGoodReceipt
) {
  const { deliver, deliveryDate, creator, note, supplierId, details } =
    information;

  if (details.length <= 0) {
    return false;
  }

  const temporaryGoodReceiptDetails = (
    await Promise.all(
      details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productId);
        if (!productId) {
          return null;
        }
        return { ...detail };
      })
    )
  ).flatMap((detail) => (detail ? [detail] : []));

  const totalAmount = calculateTemporaryTotalPrice(temporaryGoodReceiptDetails);

  const updateGoodReceiptQuery =
    "UPDATE " +
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
    await GoodReceiptDetailService.updateGoodReceiptDetails(
      goodReceiptId,
      temporaryGoodReceiptDetails,
      poolConnection
    );
    await poolConnection.commit();
    return true;
  } catch (error) {
    await poolConnection.rollback();
    console.log(error);
    return false;
  } finally {
    poolConnection.release();
  }
}

export function calculateTemporaryTotalPrice(
  goodReceiptItems: TemporaryGoodRecieptDetail[]
) {
  const totalAmount = goodReceiptItems
    .map(({ price, quantity }) => price * quantity)
    .reduce((totalAmount, price) => totalAmount + price, 0);

  return totalAmount;
}

export async function getGoodReceiptById(receiptId: string) {
  const getGoodReceiptQuery = `select id, total_amount, deliver, delivery_date, creator, note, supplier_id from ${MYSQL_DB}.good_receipt where id=? and deleted_at is null`;
  const [goodReceiptRowDatas] = (await pool.query(getGoodReceiptQuery, [
    receiptId,
  ])) as RowDataPacket[][];
  if (goodReceiptRowDatas.length <= 0) {
    return null;
  }

  const details = await GoodReceiptDetailService.getGoodReceiptDetails(
    receiptId
  );

  return convertUnderscorePropertiesToCamelCase({
    ...goodReceiptRowDatas[0],
    details,
  }) as GoodReceipt;
}

export async function deleteReceipt(
  id: string,
  continueWithConnection?: PoolConnection
) {
  const deleteReceiptQuery = "update good_receipt set deleted_at=? where id=?";
  const connection = continueWithConnection || (await pool.getConnection());
  const deletedDateTime = new Date();
  try {
    await connection.beginTransaction();
    await connection.query(deleteReceiptQuery, [deletedDateTime, id]);
    await GoodReceiptDetailService.deleteReceiptDetailByReceipId(
      id,
      connection
    );
    await connection.commit();
    return true;
  } catch (error) {
    console.log(error);
    await connection.rollback();
    return false;
  } finally {
    connection.release();
  }
}
