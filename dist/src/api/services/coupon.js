import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createLimitSql } from '../utils/misc.js';
import { createUid } from '../utils/uid.js';
import * as CouponOnBranchService from './couponOnBranch.js';
import * as CouponOnOrderService from './couponOnOrder.js';
import * as CouponOnProductService from './couponOnProduct.js';
import * as OrderService from './order.js';
export const LENGTH_OF_COUPON_CODE = 8;
export const APPLIED_SCOPES = ['branch', 'order', 'product'];
export const COUPON_UNIT = ['percent', 'money'];
export const COUPON_TYPE = ['order', 'product'];
export async function getCoupons(limit) {
    let getCouponsQuery = 'select coupon_code, type, begin_at, finish_at, decrease, unit, applied_scopes from coupon';
    if (limit) {
        getCouponsQuery += ' ' + createLimitSql(limit);
    }
    const [couponRowDatas] = await pool.query(getCouponsQuery);
    return couponRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function search(text) {
    const searchCouponQuery = 'select coupon_code, type, begin_at, finish_at, decrease, unit, applied_scopes from coupon where coupon_code like ?';
    const [couponRowDatas] = await pool.query(searchCouponQuery, [`%${text}%`]);
    return couponRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getCoupon(couponCode) {
    const getCouponQuery = 'select coupon_code, type, begin_at, finish_at, decrease, unit, applied_scopes from coupon where coupon_code=?';
    const [couponRowDatas] = await pool.query(getCouponQuery, [couponCode]);
    const coupon = convertUnderscorePropertiesToCamelCase(couponRowDatas[0] || null);
    if (coupon) {
        const appliedScopes = String(couponRowDatas[0]?.['applied_scopes'] || '').split('.');
        let couponScopes = {};
        if (appliedScopes.includes('branch')) {
            const branchIds = await CouponOnBranchService.getBranchIds(couponCode);
            couponScopes = { ...couponScopes, branchIds };
        }
        if (appliedScopes.includes('order')) {
            const orderCondition = await CouponOnOrderService.getOrderCondition(couponCode);
            couponScopes = { ...couponScopes, ...orderCondition };
        }
        if (appliedScopes.includes('product')) {
            const productPriceIds = await CouponOnProductService.getProductPriceIds(couponCode);
            couponScopes = { ...couponScopes, productPriceIds };
        }
        return { ...coupon, ...couponScopes };
    }
    return null;
}
export async function addCoupon(information) {
    const couponCode = String(information?.['couponCode'] || createUid(LENGTH_OF_COUPON_CODE).toUpperCase());
    const addCouponQuery = 'insert into coupon(`coupon_code`, `type`, `begin_at`, `finish_at`, `decrease`, `unit`, `applied_scopes`) values (?)';
    const { type, beginAt, finishAt, decrease, unit } = information;
    const appliedScopes = Array.isArray(information.appliedScopes)
        ? information.appliedScopes
        : String(information.appliedScopes || '').split('.');
    if (appliedScopes.some(scope => !APPLIED_SCOPES.includes(scope))) {
        return false;
    }
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(addCouponQuery, [[couponCode, type, new Date(beginAt), new Date(finishAt), decrease, unit, appliedScopes.join('.')]]);
        if (appliedScopes.includes('branch')) {
            const branchIds = information.branchIds;
            if (!Array.isArray(branchIds) || branchIds.length <= 0) {
                throw new Error('Require branch ids for coupon on branch');
            }
            await CouponOnBranchService.addBranches(couponCode, branchIds, poolConnection);
        }
        if (appliedScopes.includes('order')) {
            const totalPriceFrom = Number(information?.totalPriceFrom);
            const totalPriceTo = Number(information?.totalPriceTo);
            if (typeof totalPriceFrom !== 'number' || isNaN(totalPriceFrom)) {
                throw new Error('Require branch ids for coupon on branch');
            }
            await CouponOnOrderService.addOrderCondition(couponCode, { totalPriceFrom, totalPriceTo }, poolConnection);
        }
        if (appliedScopes.includes('product')) {
            const productPriceIds = information.productPriceIds;
            if (!Array.isArray(productPriceIds) || productPriceIds.length <= 0) {
                throw new Error('Require product price ids for coupon on product');
            }
            await CouponOnProductService.addProductPrices(couponCode, productPriceIds, poolConnection);
        }
        await poolConnection.commit();
        return true;
    }
    catch (error) {
        console.log(error);
        await poolConnection.rollback();
        return false;
    }
    finally {
        poolConnection.release();
    }
}
export async function updateCoupon(couponCode, information) {
    const oldCoupon = await getCoupon(couponCode);
    if (!oldCoupon || !validateCoupon(oldCoupon)) {
        return false;
    }
    const updateCouponQuery = 'update coupon set begin_at=?, finish_at=?, decrease=?, unit=?, type=?, applied_scopes=? where coupon_code=? and begin_at>?';
    const { beginAt, finishAt, decrease, unit, type } = information;
    const appliedScopes = Array.isArray(information.appliedScopes)
        ? information.appliedScopes
        : String(information.appliedScopes || '').split('.');
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(updateCouponQuery, [new Date(beginAt), new Date(finishAt), decrease, unit, type, appliedScopes.join('.'), couponCode, new Date()]);
        if (appliedScopes.includes('branch')) {
            const branchIds = information.branchIds;
            if (!Array.isArray(branchIds) || branchIds.length <= 0) {
                throw new Error('Require branch ids for coupon on branch');
            }
            await CouponOnBranchService.updateBranches(couponCode, branchIds, poolConnection);
        }
        else {
            await CouponOnBranchService.deleteBranches(couponCode, poolConnection);
        }
        if (appliedScopes.includes('order')) {
            const totalPriceFrom = Number(information.totalPriceFrom);
            const totalPriceTo = Number(information.totalPriceTo);
            if (typeof totalPriceFrom !== 'number' || isNaN(totalPriceFrom)) {
                throw new Error('Require branch ids for coupon on branch');
            }
            await CouponOnOrderService.updateOrderCondition(couponCode, { totalPriceFrom, totalPriceTo }, poolConnection);
        }
        else {
            await CouponOnOrderService.deleteOrderCondition(couponCode, poolConnection);
        }
        if (appliedScopes.includes('product')) {
            const productPriceIds = information.productPriceIds;
            if (!Array.isArray(productPriceIds) || productPriceIds.length <= 0) {
                throw new Error('Require product price ids for coupon on product');
            }
            await CouponOnProductService.updateProductPrices(couponCode, productPriceIds, poolConnection);
        }
        else {
            await CouponOnProductService.deleteProductPrices(couponCode, poolConnection);
        }
        await poolConnection.commit();
        return true;
    }
    catch (error) {
        await poolConnection.rollback();
        console.log(error);
        return false;
    }
    finally {
        poolConnection.release();
    }
}
export async function deleteCoupon(couponCode) {
    const deleteCouponQuery = 'delete from coupon where coupon_code=? and begin_at>?';
    const [result] = await pool.query(deleteCouponQuery, [couponCode, new Date()]);
    return result.affectedRows > 0;
}
export function isExpiredCoupon(coupon) {
    const finishTime = new Date(coupon.finishAt).getTime();
    if (finishTime < Date.now()) {
        return true;
    }
    return false;
}
export function validateCoupon(coupon) {
    if (!coupon) {
        return false;
    }
    return !isExpiredCoupon(coupon);
}
export function calculateDecreaseMoneyForOrder(coupon, order) {
    if (!validateCoupon(coupon)) {
        return 0;
    }
    if (!matchCondition(coupon, order)) {
        return 0;
    }
    if (coupon.type === 'order') {
        const totalPrice = OrderService.calculateTemporaryTotalPrice(order.details);
        return calculateDecreaseMoneyByUnit(totalPrice, coupon.decrease, coupon.unit);
    }
    if (coupon.type === 'product') {
        const productPriceIdsMatchedCondition = coupon.appliedScopes.includes('product')
            ? CouponOnProductService.getMatchedProductPriceIds(coupon, order)
            : order.details.map(({ productPriceId }) => productPriceId);
        const totalDecreasePrice = order.details
            .filter(({ productPriceId }) => productPriceIdsMatchedCondition.includes(productPriceId))
            .map(({ price, quality }) => calculateDecreaseMoneyByUnit(price, coupon.decrease, coupon.unit) * quality)
            .reduce((total, decreasePrice) => total + decreasePrice, 0);
        return totalDecreasePrice;
    }
    return 0;
}
function matchCondition(coupon, order) {
    const appliedScopes = Array.isArray(coupon.appliedScopes) ? coupon.appliedScopes : coupon.appliedScopes.split('.');
    if (appliedScopes.some(scope => !APPLIED_SCOPES.includes(scope))) {
        return false;
    }
    if (appliedScopes.includes('branch')) {
        if (!CouponOnBranchService.matchCondition(coupon, order)) {
            return false;
        }
    }
    if (appliedScopes.includes('order')) {
        if (!CouponOnOrderService.matchCondition(coupon, order)) {
            return false;
        }
    }
    if (appliedScopes.includes('product')) {
        if (!CouponOnProductService.matchCondition(coupon, order)) {
            return false;
        }
    }
    return true;
}
function calculateDecreaseMoneyByUnit(price, decrease, unit) {
    return unit === 'money' ? decrease : price * (decrease / 100);
}
export async function getRelationCouponCodes(order) {
    const totalPriceOfOrder = OrderService.calculateTemporaryTotalPrice(order.details);
    const productPriceIdsOfOrder = order.details.map(({ productPriceId }) => productPriceId);
    const relationCouponCodesOnBranch = await CouponOnBranchService.getRelationCouponCodes(order.branchId);
    const relationCouponCodesOnOrder = await CouponOnOrderService.getRelationCouponCodes(totalPriceOfOrder);
    const relationCouponCodesOnProduct = await CouponOnProductService.getRelationCouponCodes(productPriceIdsOfOrder);
    return Array.from(new Set([
        ...relationCouponCodesOnBranch,
        ...relationCouponCodesOnOrder,
        ...relationCouponCodesOnProduct
    ]));
}
export async function findRelationCoupons(order) {
    const relationCouponCodes = await getRelationCouponCodes(order);
    const relationCoupons = await Promise.all(relationCouponCodes.map(getCoupon));
    return relationCoupons
        .flatMap(coupon => coupon ? [coupon] : [])
        .filter(coupon => validateCoupon(coupon) && matchCondition(coupon, order));
}
