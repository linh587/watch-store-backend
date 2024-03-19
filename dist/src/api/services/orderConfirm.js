import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
export async function confirmOrder(confirmInformation, connection) {
    const { staffAccountId, orderId, action } = confirmInformation;
    const confirmOrderQuery = 'insert into order_confirm(`staff_account_id`, `order_id`, `action`, `time`) values (?)';
    const [result] = await connection.query(confirmOrderQuery, [[staffAccountId, orderId, action, new Date()]]);
    return result.affectedRows > 0;
}
export async function getConfirmsByOrder(orderId) {
    const getConfirmByOrderQuery = 'select staff_account_id, order_id, action, time where order_id=?';
    const [confirmRowDatas] = await pool.query(getConfirmByOrderQuery, [orderId]);
    return confirmRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function isDeliveryStaffOfOrder(staffAccountId, orderId) {
    const isDeliveryStaffOfOrderQuery = `select count(*) as delivery_staff_count from order_confirm where staff_account_id=? and order_id=? and action='delivery'`;
    const [rowDatas] = await pool.query(isDeliveryStaffOfOrderQuery, [staffAccountId, orderId]);
    return Number(rowDatas?.[0]?.['delivery_staff_count']) > 0;
}
