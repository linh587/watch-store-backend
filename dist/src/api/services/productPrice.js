import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { createUid } from "../utils/uid.js";
export async function getProductPrices() {
    const getProductPricesQuery = "select product_price.id, product_id, product_size_id, product_price.price, quantity, product.name as productName, product.cover_image as productCoverImage, product_size.name as productSizeName\
    from product_price\
    inner join product on product_price.product_id = product.id\
    inner join product_size on product_price.product_size_id = product_size.id\
    where product_price.deleted_at is null";
    const [productPriceRowDatas] = (await pool.query(getProductPricesQuery));
    return productPriceRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getProductPrice(id, options) {
    let getProductPriceQuery = "select product_price.id, product_id, product_size_id, product_price.price, quantity, product.name as productName, product.cover_image as productCoverImage, product_size.name as productSizeName\
    from product_price\
    inner join product on product_price.product_id = product.id\
    inner join product_size on product_price.product_size_id = product_size.id\
    where product_price.id=?";
    if (!options || !options.includeDeleted) {
        getProductPriceQuery += `and product_price.deleted_at is null`;
    }
    const [productPriceRowDatas] = (await pool.query(getProductPriceQuery, [
        id,
    ]));
    return convertUnderscorePropertiesToCamelCase(productPriceRowDatas[0] || null);
}
export async function getProductPricesByProductId(productId, continueWithConnection) {
    const connection = continueWithConnection || pool;
    const getProductPricesByProductIdQuery = "select id, product_id, product_size_id, price, quantity from product_price where deleted_at is null and product_id=?";
    const [productPriceRowDatas] = (await connection.query(getProductPricesByProductIdQuery, [productId]));
    return productPriceRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function addProductPrices(productId, informations, connection) {
    const productPriceRowDatas = informations.map((information) => {
        const productPriceId = createUid(20);
        if (information.quantity == null) {
            information.quantity = 0;
        }
        const { productSizeId, price, quantity } = information;
        const createdAt = new Date();
        const priceRowData = [
            productPriceId,
            productId,
            productSizeId,
            price,
            quantity,
            createdAt,
        ];
        return priceRowData;
    });
    const addProductPricesQuery = "insert into product_price(`id`, `product_id`, `product_size_id`, `price`, `quantity`, `created_at`) values ?";
    const [result] = (await connection.query(addProductPricesQuery, [
        productPriceRowDatas,
    ]));
    return result.affectedRows > 0;
}
export async function updateProductPrices(productId, informations, connection) {
    const productPriceRowDatas = informations.map((information) => {
        const { productSizeId, price } = information;
        const productPriceId = information.productPriceId || createUid(20);
        const createdAt = new Date();
        const deletedAt = null;
        const priceRowData = [
            productPriceId,
            productId,
            productSizeId,
            price,
            createdAt,
            deletedAt,
        ];
        return priceRowData;
    });
    const productPriceIdsNeedUpdate = informations.flatMap(({ productPriceId }) => productPriceId ? [productPriceId] : []);
    const deleteUnusedProductPricesQuery = "update product_price set deleted_at=? where id not in ? and product_id=?";
    const deleteAllProductPricesQuery = "update product_price set deleted_at=? where product_id=?";
    const replaceProductPricesQuery = "replace into product_price(`id`, `product_id`, `product_size_id`, `price`, `created_at`, `deleted_at`) values ?";
    if (productPriceIdsNeedUpdate.length > 0) {
        await connection.query(deleteUnusedProductPricesQuery, [
            new Date(),
            [productPriceIdsNeedUpdate],
            productId,
        ]);
    }
    else {
        await connection.query(deleteAllProductPricesQuery, [
            new Date(),
            productId,
        ]);
    }
    await connection.query(replaceProductPricesQuery, [productPriceRowDatas]);
    return true;
}
export async function deleteProductPricesByProductId(productId, connection) {
    const deleteProductPricesByProductIdQuery = "update product_price set deleted_at=? where product_id=?";
    const [result] = (await connection.query(deleteProductPricesByProductIdQuery, [new Date(), productId]));
    return result.affectedRows > 0;
}
