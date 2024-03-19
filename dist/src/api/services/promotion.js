import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createLimitSql } from '../utils/misc.js';
import { createUid } from '../utils/uid.js';
export async function getPromotions(limit) {
    let getPromotionsQuery = 'select id, title, content, cover_image, coupon_code, created_at, updated_at from promotion where deleted_at is null';
    if (limit) {
        getPromotionsQuery += ' ' + createLimitSql(limit);
    }
    const [promotionRowDatas] = await pool.query(getPromotionsQuery);
    return promotionRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getPromotion(id) {
    const getPromotionQuery = 'select id, title, content, cover_image, coupon_code, created_at, updated_at from promotion where deleted_at is null and id=?';
    const [promotionRowDatas] = await pool.query(getPromotionQuery, [id]);
    return convertUnderscorePropertiesToCamelCase(promotionRowDatas[0] || null);
}
export async function addPromotion(information) {
    const id = createUid(20);
    const { title, content, coverImage, couponCode } = information;
    const addPromotionQuery = 'insert into promotion(`id`, `title`, `content`, `cover_image`, `coupon_code`, `created_at`) values (?)';
    const [result] = await pool.query(addPromotionQuery, [[id, title, content, coverImage, couponCode, new Date()]]);
    return result.affectedRows > 0;
}
export async function updatePromotion(id, promotion) {
    const { title, content, coverImage, couponCode } = promotion;
    const updatePromotionQuery = 'update promotion set title=?, content=?, cover_image=?, coupon_code=?, updated_at=? where id=? and deleted_at is null';
    const [result] = await pool.query(updatePromotionQuery, [title, content, coverImage, couponCode, new Date(), id]);
    return result.affectedRows > 0;
}
export async function deletePromotion(id) {
    const deletePromotionQuery = 'update promotion set deleted_at=? where id=? and deleted_at is null';
    const [result] = await pool.query(deletePromotionQuery, [new Date(), id]);
    return result.affectedRows > 0;
}
export async function searchPromotionByTitle(title, limit) {
    let searchPromotionByTitleQuery = 'select id, title, content, cover_image, coupon_code, created_at, updated_at from promotion where title like ? and deleted_at is null';
    if (limit) {
        searchPromotionByTitleQuery += ' ' + createLimitSql(limit);
    }
    const [promotionRowDatas] = await pool.query(searchPromotionByTitleQuery, [`%${title}%`]);
    return promotionRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
