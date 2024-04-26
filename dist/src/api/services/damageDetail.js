import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
export async function getDamageDetails(damageId, continueWithConnection) {
    const connection = continueWithConnection || pool;
    const getDamageDetailsQuery = "select damage_id, product_id, size_id, quantity, description from damage_detail where damage_id=?";
    const [DamageDetailRowDatas] = (await connection.query(getDamageDetailsQuery, [damageId]));
    return DamageDetailRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function addDamageDetails(damageId, details, connection) {
    const addDamagesQuery = "insert into damage_detail(`damage_id`, `product_id`, `size_id`,`quantity`, `description`) VALUES (?)";
    const updateQuantityQuery = "update product_price\
  set quantity = product_price.quantity - ?\
  where product_price.product_id= ? \
  and product_price.product_size_id= ?";
    const damageDetailRowDatas = details.map((detail) => [
        damageId,
        detail.productId,
        detail.sizeId,
        detail.quantity,
        detail.description,
    ]);
    for (const detail of damageDetailRowDatas) {
        await connection.query(addDamagesQuery, [detail]);
        await connection.query(updateQuantityQuery, [
            detail[3],
            detail[1],
            detail[2],
        ]);
    }
    return true;
}
export async function updateDamageDetails(damageId, details, connection) {
    const updateDamagesQuery = "UPDATE damage_detail SET quantity = ?, size_id=?, descript = ? WHERE damage_id = ? AND product_id = ?";
    const updateOperations = details.map(async (detail) => {
        const values = [
            detail.quantity,
            detail.sizeId,
            detail.description,
            damageId,
            detail.productId,
        ];
        await connection.query(updateDamagesQuery, values);
    });
    await Promise.all(updateOperations);
}
export async function deleteDamageId(damageId, connection) {
    const deleteDamageIdQuery = "update damage_detail set deleted_at=? where damage_id=?";
    const [result] = (await connection.query(deleteDamageIdQuery, [
        new Date(),
        damageId,
    ]));
    return result.affectedRows > 0;
}
