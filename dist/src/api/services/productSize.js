import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createUid } from '../utils/uid.js';
export async function getProductSizes() {
    const getProductSizesQuery = 'select id, name from product_size where deleted_at is null';
    const [productSizeRowDatas] = await pool.query(getProductSizesQuery);
    return productSizeRowDatas;
}
export async function getProductSize(id, options) {
    let getProductSizeQuery = 'select id, name from product_size where id=?';
    if (!options || !options.includeDeleted) {
        getProductSizeQuery += ' and deleted_at is null';
    }
    const [productSizeRowDatas] = await pool.query(getProductSizeQuery, [id]);
    return convertUnderscorePropertiesToCamelCase(productSizeRowDatas[0] || null);
}
export async function addProductSize(name) {
    const id = createUid(20);
    const addProductSizeQuery = 'insert into product_size(`id`, `name`) values(?)';
    const [result] = await pool.query(addProductSizeQuery, [[id, name]]);
    return result.affectedRows > 0;
}
export async function updateProductSize(id, name) {
    const updateProductSizeQuery = 'update product_size set name=? where id=? and deleted_at is null';
    const [result] = await pool.query(updateProductSizeQuery, [name, id]);
    return result.affectedRows > 0;
}
export async function deleteProductSize(id) {
    const deleteProductSizeQuery = 'update product_size set deleted_at=? where id=? and deleted_at is null';
    const [result] = await pool.query(deleteProductSizeQuery, [new Date(), id]);
    return result.affectedRows > 0;
}
