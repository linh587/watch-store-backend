import { escape } from "mysql2";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { createUid } from "../utils/uid.js";
export async function getSuppliers(filters) {
    let getSuppliersQuery = "select id, name, email, phone, address, note, status from supplier where deleted_at is null";
    if (filters) {
        const filterSql = createFilterSql(filters);
        getSuppliersQuery += filterSql ? ` and ${filterSql}` : "";
    }
    const [supplierRowDatas] = (await pool.query(getSuppliersQuery));
    return supplierRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getSupplier(id) {
    const getSupplierQuery = "select id, name, email, phone, address, note, status from supplier where id=? and deleted_at is null";
    const [supplierRowDatas] = (await pool.query(getSupplierQuery, [
        id,
    ]));
    return convertUnderscorePropertiesToCamelCase(supplierRowDatas[0] || null);
}
export async function addSupplier(information) {
    const id = createUid(20);
    const { name, email, phone, address, note, status } = information;
    const addSupplierQuery = "insert into supplier(`id`, `name`, `email`, `phone`, `address`, `note`, `status`) values (?)";
    const [result] = (await pool.query(addSupplierQuery, [
        [id, name, email, phone, address, note, status],
    ]));
    return result.affectedRows > 0;
}
export async function updateSupplier(id, information) {
    const { name, email, phone, address, note, status } = information;
    const updateSupplierQuery = "update supplier set name=?, email=?, phone=?, address=?, note=?, status=? where id=? and deleted_at is null";
    const [result] = (await pool.query(updateSupplierQuery, [
        name,
        email,
        phone,
        address,
        note,
        status,
        id,
    ]));
    return result.affectedRows > 0;
}
export async function deleteSupplier(id) {
    const deleteSupplierQuery = "update supplier set deleted_at=? where id=? and deleted_at is null";
    const [result] = (await pool.query(deleteSupplierQuery, [
        new Date(),
        id,
    ]));
    return result.affectedRows > 0;
}
export async function search(text) {
    const searchQuery = "select id, name, email, phone, address, note, status from supplier where (deleted_at is null) and (name like ? or address like ?)";
    const [supplierRowDatas] = (await pool.query(searchQuery, [
        `%${text}%`,
        `%${text}%`,
    ]));
    return supplierRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
function createFilterSql(filter) {
    let filterStatements = [];
    // for name, email, sdt, address
    if (filter.searchString) {
        const subFilterStatements = [];
        subFilterStatements.push(`supplier.name like ${escape(`%${filter.searchString}%`)}`);
        subFilterStatements.push(`supplier.email like ${escape(`%${filter.searchString}%`)}`);
        subFilterStatements.push(`supplier.phone like ${escape(`%${filter.searchString}%`)}`);
        subFilterStatements.push(`supplier.address like ${escape(`%${filter.searchString}%`)}`);
        filterStatements.push(`(${subFilterStatements.join(" or ")})`);
    }
    return filterStatements.join(" and ");
}
