import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
export async function confirmOrder(confirmInformation, connection) {
    const { orderId, action, accountId } = confirmInformation;
    const confirmOrderQuery = "insert into order_confirm(`account_id`, `order_id`, `action`, `time`) values (?)";
    const [result] = (await connection.query(confirmOrderQuery, [
        [accountId, orderId, action, new Date()],
    ]));
    return result.affectedRows > 0;
}
export async function getConfirmsByOrder(orderId) {
    const getConfirmByOrderQuery = "select account_id, order_id, action, time where order_id=?";
    const [confirmRowDatas] = (await pool.query(getConfirmByOrderQuery, [
        orderId,
    ]));
    return confirmRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
