import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
const MYSQL_DB = process.env.MYSQL_DB || "watch_db";
export async function getReturnOrderDetails(returnOrderId, continueWithConnection) {
    const connection = continueWithConnection || pool;
    const getReturnOrderDetailsQuery = "select return_order_id, product_price_id, price_purchase, quantity, reason, return_type from return_order_details where return_order_id=?";
    const [returOrderDetailRowDatas] = (await connection.query(getReturnOrderDetailsQuery, [returnOrderId]));
    return returOrderDetailRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function addReturnOrderDetails(returnOrderId, orderId, details, connection) {
    const addReturnOrderDetailsQuery = "insert into return_order_details(`return_order_id`, `product_price_id`, `price_purchase`, `quantity`, `reason`, `return_type`) VALUES (?)";
    // const updateQuantityQuery =
    //   "update product_price\
    // set quantity = product_price.quantity + ?\
    // where product_price.product_id= ? \
    // and product_price.product_size_id= ?";
    // const returnOrderDetailRowDatas = details.map((detail) => [
    //   returnOrderId,
    //   detail.productId,
    //   detail.sizeId,
    //   detail.price,
    //   detail.quantity,
    //   detail.reason,
    // ]);
    // for (const detail of returnOrderDetailRowDatas) {
    //   await connection.query(addReturnOrderDetailsQuery, [detail]);
    //   await connection.query(updateQuantityQuery, [
    //     detail[4],
    //     detail[1],
    //     detail[2],
    //   ]);
    //   // Kiểm tra sản phẩm có tồn tại trong đơn hàng đã mua hay không
    //   const existsInOrder = await checkExistsProductInOrder(detail[1], orderId);
    //   if (!existsInOrder) {
    //     throw new Error(`Sản phẩm với ID ${detail[1]} không tồn tại trong đơn hàng đã mua.`);
    //   }
    // }
    for (const detail of details) {
        const { productPriceId, pricePurchase, quantity, reason, returnType } = detail;
        await connection.query(addReturnOrderDetailsQuery, [
            [returnOrderId, productPriceId, pricePurchase, quantity, reason, returnType],
        ]);
        //await connection.query(updateQuantityQuery, [quantity, productId, sizeId]);
        // Kiểm tra sản phẩm có tồn tại trong đơn hàng đã mua hay không
        const existsInOrder = await checkExistsProductInOrder(productPriceId, orderId);
        if (!existsInOrder) {
            throw new Error(`Sản phẩm với ID ${productPriceId} không tồn tại trong đơn hàng đã mua.`);
        }
    }
    return true;
}
export async function updateReturnOrderDetails(returnOrderId, details, connection) {
    const updateReturnOrderDetailsQuery = "UPDATE return_order_details SET quantity = ?, price_purchase = ?, reason = ?, return_type =? WHERE return_order_id = ? AND product_price_id = ?";
    const updateOperations = details.map(async (detail) => {
        const values = [
            detail.quantity,
            detail.pricePurchase,
            detail.reason,
            detail.returnType,
            returnOrderId,
            detail.productPriceId,
        ];
        await connection.query(updateReturnOrderDetailsQuery, values);
    });
    await Promise.all(updateOperations);
}
export async function deleteReturOrderById(returnOrderId, connection) {
    const deleteReceiptDetailByReceipIdQuery = "update return_order_details set deleted_at=? where return_order_id=?";
    const [result] = (await connection.query(deleteReceiptDetailByReceipIdQuery, [
        new Date(),
        returnOrderId,
    ]));
    return result.affectedRows > 0;
}
export async function checkExistsProductInOrder(productId, orderId) {
    let checkExistsPhoneQuery = `select ${MYSQL_DB}.order.id as orderID, ${MYSQL_DB}.order_detail.product_price_id as productPriceInOrder,\ 
		${MYSQL_DB}.order_detail.price_at_purchase as productPriceInOrder,\ 
    ${MYSQL_DB}.order_detail.quality as qualityproductInOrder\
    from ${MYSQL_DB}.order, ${MYSQL_DB}.product_price, ${MYSQL_DB}.order_detail WHERE ${MYSQL_DB}.order.id=order_detail.order_id\ 
    and order_detail.product_price_id=product_price.id and ${MYSQL_DB}.order.id =? and ${MYSQL_DB}.order_detail.product_price_id = ?;`;
    const [result] = (await pool.query(checkExistsPhoneQuery, [
        orderId,
        productId,
    ]));
    return result.length > 0;
}
