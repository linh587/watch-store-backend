import { escape } from "mysql2";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { createUid } from "../utils/uid.js";
import * as ProductService from "./product.js";
export async function getCategories(filters) {
    let getCategoriesQuery = "select id, name from category where deleted_at is null";
    if (filters) {
        const filterSql = createFilterSql(filters);
        getCategoriesQuery += filterSql ? ` and ${filterSql}` : "";
    }
    const [categoryRowDatas] = (await pool.query(getCategoriesQuery));
    return categoryRowDatas;
}
export async function getCategory(id) {
    const getCategoryQuery = "select id, name from category where deleted_at is null and id=?";
    const [categoryRowdatas] = (await pool.query(getCategoryQuery, [
        id,
    ]));
    return (convertUnderscorePropertiesToCamelCase(categoryRowdatas[0] || null) || null);
}
export async function addCategory(name) {
    const checkCategoryQuery = "SELECT COUNT(*) as count FROM category WHERE name = ?";
    const [insertResult] = await pool.query(checkCategoryQuery, [name]);
    const countResult = insertResult;
    const categoryExists = countResult[0].count > 0;
    if (categoryExists) {
        return false;
    }
    const id = createUid();
    const addCategoryQuery = "insert into category(`id`, `name`) values(?)";
    const [result] = (await pool.query(addCategoryQuery, [
        [id, name],
    ]));
    return result.affectedRows > 0;
}
export async function updateCategory(id, name) {
    const updateCategoryQuery = "update category set name=? where id=? and deleted_at is null";
    const [result] = (await pool.query(updateCategoryQuery, [
        name,
        id,
    ]));
    return result.affectedRows > 0;
}
export async function deleteCategory(id) {
    const deleteCategoryQuery = "update category set deleted_at=? where id=? and deleted_at is null";
    const poolConnection = await pool.getConnection();
    const deletedDateTime = new Date();
    try {
        await poolConnection.beginTransaction();
        await poolConnection.query(deleteCategoryQuery, [deletedDateTime, id]);
        const productsOfCategory = await ProductService.getProducts({}, { categoryId: id });
        const productIdsOfCategory = productsOfCategory.map((product) => product.id);
        await Promise.all(productIdsOfCategory.map((productId) => {
            return ProductService.deleteProduct(productId, poolConnection);
        }));
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
function createFilterSql(filter) {
    let filterStatements = [];
    if (filter.searchString) {
        const subFilterStatements = [];
        subFilterStatements.push(`category.name like ${escape(`%${filter.searchString}%`)}`);
        filterStatements.push(`(${subFilterStatements.join(" or ")})`);
    }
    return filterStatements;
}
