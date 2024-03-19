import pool from '../db.js';
export async function getProductPriceIds(couponCode) {
    const getProductPriceIdsQuery = `select product_price_id from coupon_on_product where coupon_code=?`;
    const [couponOnProductRowDatas] = await pool.query(getProductPriceIdsQuery, [couponCode]);
    return couponOnProductRowDatas.map(couponOnProductRowData => String(couponOnProductRowData?.['product_price_id'] || ''));
}
export async function addProductPrices(couponCode, productPriceIds, connection) {
    const addProductPricesQuery = 'insert into coupon_on_product(`coupon_code`, `product_price_id`) values ?';
    const [result] = await connection.query(addProductPricesQuery, [productPriceIds.map(productPriceId => [couponCode, productPriceId])]);
    return result.affectedRows > 0;
}
export async function updateProductPrices(couponCode, productPriceIds, connection) {
    const deleteCouponOnProductQuery = 'delete from coupon_on_product where coupon_code=?';
    const addCouponOnProductQuery = 'insert into coupon_on_product(`coupon_code`, `product_price_id`) values ?';
    await connection.query(deleteCouponOnProductQuery, [couponCode]);
    await connection.query(addCouponOnProductQuery, [productPriceIds.map(productPriceId => [couponCode, productPriceId])]);
    return true;
}
export async function deleteProductPrices(couponCode, connection) {
    const deleteProductPricesQuery = 'delete from coupon_on_product where coupon_code=?';
    const [result] = await connection.query(deleteProductPricesQuery, [couponCode]);
    return result.affectedRows > 0;
}
export function matchCondition(coupon, order) {
    const matchedProductPriceIdsInOrder = getMatchedProductPriceIds(coupon, order);
    return matchedProductPriceIdsInOrder.length > 0;
}
export function getMatchedProductPriceIds(coupon, order) {
    const productPriceIdsOfOrder = order.details.map(({ productPriceId }) => productPriceId);
    return productPriceIdsOfOrder.filter(productPriceIdOfOrder => coupon.productPriceIds.includes(productPriceIdOfOrder));
}
export async function getRelationCouponCodes(productPriceIds) {
    const getRelationCouponCodeQuery = 'select coupon_code from coupon_on_product where product_price_id in ? group by coupon_code';
    const [couponOnProductRowDatas] = await pool.query(getRelationCouponCodeQuery, [[productPriceIds]]);
    return couponOnProductRowDatas.map(rowData => String(rowData['coupon_code']) || '').filter(couponCode => couponCode !== '');
}
