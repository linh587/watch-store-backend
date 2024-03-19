import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { ORDER_STATUS } from './order.js';
import * as ProductPriceService from './productPrice.js';
export async function getOrderDetails(orderId, continueWithConnection) {
    const connection = continueWithConnection || pool;
    const getOrderDetailsQuery = 'select order_id, product_price_id, quality, price_at_purchase from order_detail where order_id=?';
    const [orderDetailRowDatas] = await connection.query(getOrderDetailsQuery, [orderId]);
    return orderDetailRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function addOrderDetails(orderId, details, connection) {
    const addOrderDetailsQuery = 'insert into order_detail(`order_id`, `product_price_id`, `quality`, `price_at_purchase`) values ?';
    const orderDetailRowDatas = details.map(detail => [orderId, detail.productPriceId, detail.quality, detail.price]);
    const [result] = await connection.query(addOrderDetailsQuery, [orderDetailRowDatas]);
    return result.affectedRows > 0;
}
export async function boughtProduct(userAccountId, productId) {
    const productPricesOfProduct = await ProductPriceService.getProductPricesByProductId(productId);
    const productPriceIdsOfProduct = productPricesOfProduct
        .flatMap(productPrice => productPrice.id ? [String(productPrice.id)] : []);
    if (productPriceIdsOfProduct.length <= 0)
        return false;
    const countOrderDetailQuery = 'select count(*) as order_detail_count from order_detail \
        inner join ace_coffee_db.order on order_detail.order_id = ace_coffee_db.order.id \
        inner join user_account on ace_coffee_db.order.user_account_id =  user_account.id \
        where order_detail.product_price_id in ? and user_account.id =? and ace_coffee_db.order.status=?';
    const [rowDatas] = await pool.query(countOrderDetailQuery, [[productPriceIdsOfProduct], userAccountId, ORDER_STATUS.received]);
    return Boolean(rowDatas?.[0]?.['order_detail_count'] > 0);
}
