import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createLimitSql } from '../utils/misc.js';
import { createUid } from '../utils/uid.js';
export async function getNotifications(userAccountId, limit) {
    let getNotificationsQuery = 'select id, content, seen, created_at, link_to from notification where user_account_id=? order by created_at desc';
    if (limit) {
        getNotificationsQuery += ' ' + createLimitSql(limit);
    }
    const [notificationRowDatas] = await pool.query(getNotificationsQuery, [userAccountId]);
    return notificationRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function addNotification(information) {
    const { content, linkTo, userAccountId } = information;
    const notificationId = createUid(20);
    const addNotificationQuery = 'insert into notification(`id`, `content`, `seen`, `created_at`, `link_to`, `user_account_id`) values (?)';
    const [result] = await pool.query(addNotificationQuery, [[notificationId, content, false, new Date(), linkTo, userAccountId]]);
    return result.affectedRows > 0;
}
export async function markIsSeen(notificationIds) {
    if (notificationIds.length <= 0) {
        return false;
    }
    const markIsSeenQuery = 'update notification set seen=true where id in ?';
    const [result] = await pool.query(markIsSeenQuery, [[notificationIds]]);
    return result.affectedRows > 0;
}
