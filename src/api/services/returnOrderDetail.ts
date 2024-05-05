import { OkPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { TemporaryReturnOrderDetail } from "./returnOrder.js";

export interface ReturnOrderDetail {
  returnOrderId: string;
  productId: string;
  sizeId: string;
  price: number;
  quantity: number;
  reason?: string;
}

const MYSQL_DB = process.env.MYSQL_DB || "watch_db";

export async function getReturnOrderDetails(
  returnOrderId: string,
  continueWithConnection?: PoolConnection
) {
  const connection = continueWithConnection || pool;
  const getReturnOrderDetailsQuery =
    "select return_order_id, product_id, size_id, price_id, quantity, reason from return_order_details where return_order_id=?";
  const [returOrderDetailRowDatas] = (await connection.query(
    getReturnOrderDetailsQuery,
    [returnOrderId]
  )) as RowDataPacket[][];
  return returOrderDetailRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as ReturnOrderDetail[];
}

export async function addReturnOrderDetails(
  returnOrderId: string,
  orderId: string,
  details: TemporaryReturnOrderDetail[],
  connection: PoolConnection
) {
  const addReturnOrderDetailsQuery =
    "insert into return_order_details(`return_order_id`, `product_id`, `size_id`, `price_id`, `quantity`, `reason`) VALUES (?)";

  const updateQuantityQuery =
    "update product_price\
  set quantity = product_price.quantity + ?\
  where product_price.product_id= ? \
  and product_price.product_size_id= ?";

  // const returnOrderDetailRowDatas = details.map((detail) => [
  //   returnOrderId,
  //   detail.productId,
  //   detail.sizeId,
  //   detail.price,
  //   detail.quantity,
  //   detail.reason,
  // ]);

  // for (const detail of returnOrderDetailRowDatas) {
  //   await connection.query(addReturnOrderDetailsQuery, [detail]);
  //   await connection.query(updateQuantityQuery, [
  //     detail[4],
  //     detail[1],
  //     detail[2],
  //   ]);
  //   // Kiểm tra sản phẩm có tồn tại trong đơn hàng đã mua hay không
  //   const existsInOrder = await checkExistsProductInOrder(detail[1], orderId);
  //   if (!existsInOrder) {
  //     throw new Error(`Sản phẩm với ID ${detail[1]} không tồn tại trong đơn hàng đã mua.`);
  //   }
  // }
  for (const detail of details) {
    const { productId, sizeId, price, quantity, reason } = detail;

    await connection.query(addReturnOrderDetailsQuery, [
      [returnOrderId, productId, sizeId, price, quantity, reason],
    ]);

    await connection.query(updateQuantityQuery, [quantity, productId, sizeId]);

    // Kiểm tra sản phẩm có tồn tại trong đơn hàng đã mua hay không
    const existsInOrder = await checkExistsProductInOrder(productId, orderId);
    if (!existsInOrder) {
      throw new Error(
        `Sản phẩm với ID ${productId} không tồn tại trong đơn hàng đã mua.`
      );
    }
  }
  return true;
}

export async function updateReturnOrderDetails(
  returnOrderId: string,
  details: TemporaryReturnOrderDetail[],
  connection: PoolConnection
) {
  const updateReturnOrderDetailsQuery =
    "UPDATE return_order_details SET quantity = ?, size_id=?, price_id = ?, reason = ? WHERE return_order_id = ? AND product_id = ?";

  const updateOperations = details.map(async (detail) => {
    const values = [
      detail.quantity,
      detail.sizeId,
      detail.price,
      detail.reason,
      returnOrderId,
      detail.productId,
    ];
    await connection.query(updateReturnOrderDetailsQuery, values);
  });

  await Promise.all(updateOperations);
}

export async function deleteReturOrderById(
  returnOrderId: string,
  connection: PoolConnection
) {
  const deleteReceiptDetailByReceipIdQuery =
    "update return_order_details set deleted_at=? where return_order_id=?";
  const [result] = (await connection.query(deleteReceiptDetailByReceipIdQuery, [
    new Date(),
    returnOrderId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}
export async function checkExistsProductInOrder(
  productId?: string,
  orderId?: string
) {
  let checkExistsPhoneQuery = `select ${MYSQL_DB}.order.id as orderID, ${MYSQL_DB}.order_detail.product_price_id as productPriceInOrder,\ 
		${MYSQL_DB}.order_detail.price_at_purchase as productPriceInOrder,\ 
    ${MYSQL_DB}.order_detail.quality as qualityproductInOrder\
    from ${MYSQL_DB}.order, ${MYSQL_DB}.product_price, ${MYSQL_DB}.order_detail WHERE ${MYSQL_DB}.order.id=order_detail.order_id\ 
    and order_detail.product_price_id=product_price.id and ${MYSQL_DB}.order.id =? and ${MYSQL_DB}.order_detail.product_price_id = ?;`;

  const [result] = (await pool.query(checkExistsPhoneQuery, [
    orderId,
    productId,
  ])) as RowDataPacket[][];
  return result.length > 0;
}
