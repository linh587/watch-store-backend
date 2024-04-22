import { OkPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";

interface OrderConfirm {
  orderId: string;
  action: OrderConfirmAction;
  time: Date | string;
}

type OrderConfirmAction = "verify" | "delivery" | "verifyReceived" | "cancel";

export async function confirmOrder(
  confirmInformation: Omit<OrderConfirm, "time">,
  connection: PoolConnection
) {
  const { orderId, action } = confirmInformation;
  const confirmOrderQuery =
    "insert into order_confirm(`order_id`, `action`, `time`) values (?)";
  const [result] = (await connection.query(confirmOrderQuery, [
    [orderId, action, new Date()],
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function getConfirmsByOrder(orderId: string) {
  const getConfirmByOrderQuery =
    "select order_id, action, time where order_id=?";
  const [confirmRowDatas] = (await pool.query(getConfirmByOrderQuery, [
    orderId,
  ])) as RowDataPacket[][];
  return confirmRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as OrderConfirm[];
}

// export async function isDeliveryStaffOfOrder(orderId: string) {
//   const isDeliveryStaffOfOrderQuery = `select count(*) as delivery_staff_count from order_confirm where staff_account_id=? and order_id=? and action='delivery'`;
//   const [rowDatas] = (await pool.query(isDeliveryStaffOfOrderQuery, [
//     orderId,
//   ])) as RowDataPacket[][];
//   return Number(rowDatas?.[0]?.["delivery_staff_count"]) > 0;
// }
