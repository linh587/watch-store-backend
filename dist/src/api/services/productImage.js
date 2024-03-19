import pool from '../db.js';
export async function getProductImages(productId, continueWithConnection) {
    const connection = continueWithConnection || pool;
    const getProductImagesQuery = 'select image from product_image where product_id=?';
    const [imageRowDatas] = await connection.query(getProductImagesQuery, [productId]);
    const images = imageRowDatas.map(({ image }) => image);
    return images;
}
export async function addProductImages(productId, images, connection) {
    const addProductImagesQuery = 'insert into product_image(`product_id`, `image`) values ?';
    const [result] = await connection.query(addProductImagesQuery, [images.map(image => [productId, image])]);
    return result.affectedRows > 0;
}
export async function updateProductImages(productId, images, connection) {
    await deleteProductImages(productId, connection);
    if (images.length > 0) {
        await addProductImages(productId, images, connection);
    }
    return true;
}
export async function deleteProductImages(productId, connection) {
    const deleteProductImagesQuery = 'delete from product_image where product_id=?';
    const [result] = await connection.query(deleteProductImagesQuery, [productId]);
    return result.affectedRows > 0;
}
