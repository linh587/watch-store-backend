import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import * as OrderService from './order.js';
export async function getOrderCondition(couponCode) {
    const getOrderConditionQuery = `select total_price_from, total_price_to from coupon_on_order where coupon_code=?`;
    const [couponOnOrderRowDatas] = await pool.query(getOrderConditionQuery, [couponCode]);
    return convertUnderscorePropertiesToCamelCase(couponOnOrderRowDatas[0] || null);
}
export async function addOrderCondition(couponCode, orderCondition, connection) {
    const { totalPriceFrom, totalPriceTo } = orderCondition;
    const addOrderConditionQuery = 'insert into coupon_on_order(`coupon_code`, `total_price_from`, `total_price_to`) values (?)';
    const [result] = await connection.query(addOrderConditionQuery, [[couponCode, totalPriceFrom, !!totalPriceTo ? totalPriceTo : null]]);
    return result.affectedRows > 0;
}
export async function updateOrderCondition(couponCode, orderCondition, connection) {
    const { totalPriceFrom, totalPriceTo } = orderCondition;
    const updateOrderConditionQuery = 'replace into coupon_on_order(`coupon_code`, `total_price_from`, `total_price_to`) values (?)';
    const [result] = await connection.query(updateOrderConditionQuery, [[couponCode, totalPriceFrom, !!totalPriceTo ? totalPriceTo : null]]);
    return result.affectedRows > 0;
}
export async function deleteOrderCondition(couponCode, connection) {
    const deleteOrderConditionQuery = 'delete from coupon_on_order where coupon_code=?';
    const [result] = await connection.query(deleteOrderConditionQuery, [couponCode]);
    return result.affectedRows > 0;
}
export function matchCondition(coupon, order) {
    const totalPrice = OrderService.calculateTemporaryTotalPrice(order.details);
    if (coupon.totalPriceFrom > totalPrice) {
        return false;
    }
    if (coupon.totalPriceTo && coupon.totalPriceTo < totalPrice) {
        return false;
    }
    return true;
}
export async function getRelationCouponCodes(totalPrice) {
    const getRelationCouponCodeQuery = 'select coupon_code from coupon_on_order where total_price_from<=? and (total_price_to is null or total_price_to>=?)';
    const [couponOnOrderRowDatas] = await pool.query(getRelationCouponCodeQuery, [totalPrice, totalPrice]);
    return couponOnOrderRowDatas.map(rowData => String(rowData['coupon_code']) || '').filter(couponCode => couponCode !== '');
}
