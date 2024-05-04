import { OkPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";

interface OrderConfirm {
  accountId?: string;
  orderId: string;
  action: OrderConfirmAction;
  time: Date | string;
}

type OrderConfirmAction =
  | "verify"
  | "delivery"
  | "verifyReceived"
  | "cancel"
  | "completed";

export async function confirmOrder(
  confirmInformation: Omit<OrderConfirm, "time">,
  connection: PoolConnection
) {
  const { orderId, action, accountId } = confirmInformation;
  const confirmOrderQuery =
    "insert into order_confirm(`account_id`, `order_id`, `action`, `time`) values (?)";
  const [result] = (await connection.query(confirmOrderQuery, [
    [accountId, orderId, action, new Date()],
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function getConfirmsByOrder(orderId: string) {
  const getConfirmByOrderQuery =
    "select account_id, order_id, action, time where order_id=?";
  const [confirmRowDatas] = (await pool.query(getConfirmByOrderQuery, [
    orderId,
  ])) as RowDataPacket[][];
  return confirmRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as OrderConfirm[];
}
