import dotenv from "dotenv";
import pool from "../db.js";
import { createUid } from "../utils/uid.js";
import * as ReturnOrdertDetailService from "./returnOrderDetail.js";
import * as ProductService from "./product.js";
import { RowDataPacket } from "mysql2";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";

const MYSQL_DB = process.env.MYSQL_DB || "watch_db";

export interface ReturnOrder {
  id: string;
  orderId: string;
  totalProduct: number;
  requestDate: Date; //ngày yêu cầu
  status: string;
  updatedAt: Date; //ngày thay đổi trạng thái
  deletedAt: Date;
  details: ReturnOrdertDetailService.ReturnOrderDetail[];
}

export interface InfomationToCreateReturnOrder {
  orderId: string;
  //totalProduct: number;
  requestDate: Date; //ngày yêu cầu
  status: string;
  updatedAt: Date; //ngày thay đổi trạng thái
  deletedAt: Date;
  details: Omit<TemporaryReturnOrderDetail, "product">[];
}

export interface InformationToUpdateReturnOrder {
  orderId: string;
  //totalProduct: number;
  requestDate: Date; //ngày yêu cầu
  status: string;
  updatedAt: Date; //ngày thay đổi trạng thái
  deletedAt: Date;
  details: Omit<TemporaryReturnOrderDetail, "product">[];
}

export interface TemporaryReturnOrder {
  orderId: string;
  details: TemporaryReturnOrderDetail[];
}

export interface TemporaryReturnOrderDetail {
  productId: string;
  quantity: number;
  sizeId: string;
  price: number;
  reason?: string;
}

const SORT_TYPES = ["newest", "oldest"] as const;

export interface GetReturnOrderOptions {
  sort?: (typeof SORT_TYPES)[number];
}

dotenv.config();

export type SortType = (typeof SORT_TYPES)[number];

function createSortSql(sort: SortType) {
  switch (sort) {
    case "newest":
      return "order by request_date desc";
    case "oldest":
      return "order by request_date asc";
    default:
      return "";
  }
}

export async function getAllReturnOrders(options?: GetReturnOrderOptions) {
  let getAllReturnOrdersQuery = `select id, order_id, request_date, created_at, updated_at, status, total_product from ${MYSQL_DB}.return_order`;

  if (options) {
    if (options.sort) {
      getAllReturnOrdersQuery += " " + createSortSql(options.sort);
    }
  }

  const [orderRowDatas] = (await pool.query(
    getAllReturnOrdersQuery
  )) as RowDataPacket[][];
  return orderRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as ReturnOrder[];
}

export async function createReturnOrder(
  information: InfomationToCreateReturnOrder
) {
  const returnOrderId = createUid(20);

  const { orderId, requestDate, status, updatedAt, details } = information;

  if (details.length <= 0) {
    return "";
  }

  const temporaryReturnOrderDetails = (
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

  const totalAmount = calculateTemporaryTotalPrice(temporaryReturnOrderDetails);

  const createReturnOrderQuery =
    "insert into return_order(`id`, `order_id`, `request_date`, `status`, `updated_at`, `total_product`) values (?)";
  const poolConnection = await pool.getConnection();
  try {
    await poolConnection.beginTransaction();
    await poolConnection.query(createReturnOrderQuery, [
      [returnOrderId, orderId, requestDate, status, updatedAt, totalAmount],
    ]);
    await ReturnOrdertDetailService.addReturnOrderDetails(
      returnOrderId,
      orderId,
      temporaryReturnOrderDetails,
      poolConnection
    );
    await poolConnection.commit();
    return returnOrderId;
  } catch (error) {
    await poolConnection.rollback();
    console.log(error);
    return "";
  } finally {
    poolConnection.release();
  }
}

export async function updateReturnOrder(
  returnOrderId: string,
  information: InformationToUpdateReturnOrder
) {
  const { orderId, requestDate, status, updatedAt, details } = information;

  if (details.length <= 0) {
    return false;
  }

  const temporaryReturnOrderDetails = (
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

  const totalAmount = calculateTemporaryTotalPrice(temporaryReturnOrderDetails);

  const updateReturnOrderQuery =
    "UPDATE " +
    MYSQL_DB +
    ".return_order SET status = ?, updated_at = ?, total_product = ? WHERE id = ?";
  const poolConnection = await pool.getConnection();
  try {
    await poolConnection.beginTransaction();
    await poolConnection.query(updateReturnOrderQuery, [
      returnOrderId,
      orderId,
      requestDate,
      status,
      updatedAt,
      totalAmount,
    ]);
    await ReturnOrdertDetailService.updateReturnOrderDetails(
      returnOrderId,
      temporaryReturnOrderDetails,
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
  returnOrderItems: TemporaryReturnOrderDetail[]
) {
  const totalAmount = returnOrderItems.reduce(
    (totalAmount, { quantity }) => totalAmount + quantity,
    0
  );
  return totalAmount;
}

export async function getReturnOrderById(returnOrderId: string) {
  const getReturnOrderQuery = `select id, order_id, request_date, status, updated_at, total_product from ${MYSQL_DB}.return_order where id=?`;
  const [returnOrderRowDatas] = (await pool.query(getReturnOrderQuery, [
    returnOrderId,
  ])) as RowDataPacket[][];
  if (returnOrderRowDatas.length <= 0) {
    return null;
  }

  const details = await ReturnOrdertDetailService.getReturnOrderDetails(
    returnOrderId
  );

  return convertUnderscorePropertiesToCamelCase({
    ...returnOrderRowDatas[0],
    details,
  }) as ReturnOrder;
}

// export async function deleteReturnOrder(
//   id: string,
//   continueWithConnection?: PoolConnection
// ) {
//   const deleteReceiptQuery = "update good_receipt set deleted_at=? where id=?";
//   const connection = continueWithConnection || (await pool.getConnection());
//   const deletedDateTime = new Date();
//   try {
//     await connection.beginTransaction();
//     await connection.query(deleteReceiptQuery, [deletedDateTime, id]);
//     await GoodReceiptDetailService.deleteReceiptDetailByReceipId(
//       id,
//       connection
//     );
//     await connection.commit();
//     return true;
//   } catch (error) {
//     console.log(error);
//     await connection.rollback();
//     return false;
//   } finally {
//     connection.release();
//   }
// }
