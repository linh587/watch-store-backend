import { escape, OkPacket, RowDataPacket } from "mysql2";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { createUid } from "../utils/uid.js";
import * as ProductService from "./product.js";

interface Category {
  id: string;
  name: string;
}

export interface GetCategoryFilters {
  searchString?: string; // for id, name
}

export async function getCategories(filters?: GetCategoryFilters) {
  
  let getCategoriesQuery =
    "select id, name from category where deleted_at is null";

    if (filters) {
      const filterSql = createFilterSql(filters);
      getCategoriesQuery += filterSql ? ` and ${filterSql}` : "";
    }

  const [categoryRowDatas] = (await pool.query(
    getCategoriesQuery
  )) as RowDataPacket[];
  return categoryRowDatas as Category[];
}


export async function getCategory(id: string) {
  const getCategoryQuery =
    "select id, name from category where deleted_at is null and id=?";
  const [categoryRowdatas] = (await pool.query(getCategoryQuery, [
    id,
  ])) as RowDataPacket[];
  return (
    (convertUnderscorePropertiesToCamelCase(
      categoryRowdatas[0] || null
    ) as Category) || null
  );
}

export async function addCategory(name: string) {
  const checkCategoryQuery =
    "SELECT COUNT(*) as count FROM category WHERE name = ?";
  const [insertResult] = await pool.query(checkCategoryQuery, [name]);

  const countResult = insertResult as { count: number }[];

  const categoryExists = countResult[0].count > 0;

  if (categoryExists) {
    return false;
  }

  const id = createUid();
  const addCategoryQuery = "insert into category(`id`, `name`) values(?)";
  const [result] = (await pool.query(addCategoryQuery, [
    [id, name],
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function updateCategory(id: string, name: string) {
  const updateCategoryQuery =
    "update category set name=? where id=? and deleted_at is null";
  const [result] = (await pool.query(updateCategoryQuery, [
    name,
    id,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function deleteCategory(id: string) {
  const deleteCategoryQuery =
    "update category set deleted_at=? where id=? and deleted_at is null";
  const poolConnection = await pool.getConnection();
  const deletedDateTime = new Date();

  try {
    await poolConnection.beginTransaction();
    await poolConnection.query(deleteCategoryQuery, [deletedDateTime, id]);
    const productsOfCategory = await ProductService.getProducts(
      {},
      { categoryId: id }
    );
    const productIdsOfCategory = productsOfCategory.map(
      (product) => product.id as string
    );
    await Promise.all(
      productIdsOfCategory.map((productId) => {
        return ProductService.deleteProduct(productId, poolConnection);
      })
    );
    await poolConnection.commit();
    return true;
  } catch (error) {
    console.log(error);
    await poolConnection.rollback();
    return false;
  } finally {
    poolConnection.release();
  }
}

function createFilterSql(filter: GetCategoryFilters) {
  let filterStatements: any = [];
  if (filter.searchString) {
    const subFilterStatements: any = [];
    subFilterStatements.push(
      `category.name like ${escape(`%${filter.searchString}%`)}`
    );
    filterStatements.push(`(${subFilterStatements.join(" or ")})`)
  }
  return filterStatements
}
