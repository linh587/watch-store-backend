import {escape, OkPacket, RowDataPacket } from "mysql2";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { createUid } from "../utils/uid.js";

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  note?: string;
  status?: string;
}

export interface GetSupplierFilters {
  searchString?: string; // for name, email, sdt, address
}


export type InformationToCreateSupplier = Omit<Supplier, "id">;
export type InformationToUpdateSupplier = Omit<Supplier, "id">;

export async function getSuppliers(filters?: GetSupplierFilters) {
  let getSuppliersQuery =
    "select id, name, email, phone, address, note, status from supplier where deleted_at is null";

    if (filters) {
      const filterSql = createFilterSql(filters);
      getSuppliersQuery += filterSql ? ` and ${filterSql}` : "";
    }
  const [supplierRowDatas] = (await pool.query(
    getSuppliersQuery
  )) as RowDataPacket[][];
  return supplierRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as Supplier[];
}

export async function getSupplier(id: string) {
  const getSupplierQuery =
    "select id, name, email, phone, address, note, status from supplier where id=? and deleted_at is null";
  const [supplierRowDatas] = (await pool.query(getSupplierQuery, [
    id,
  ])) as RowDataPacket[][];
  return convertUnderscorePropertiesToCamelCase(
    supplierRowDatas[0] || null
  ) as Supplier | null;
}

export async function addSupplier(information: InformationToCreateSupplier) {
  const id = createUid(20);
  const { name, email, phone, address, note, status } = information;
  const addSupplierQuery =
    "insert into supplier(`id`, `name`, `email`, `phone`, `address`, `note`, `status`) values (?)";
  const [result] = (await pool.query(addSupplierQuery, [
    [id, name, email, phone, address, note, status],
  ])) as OkPacket[];

  return result.affectedRows > 0;
}

export async function updateSupplier(
  id: string,
  information: InformationToUpdateSupplier
) {
  const { name, email, phone, address, note, status } = information;
  const updateSupplierQuery =
    "update supplier set name=?, email=?, phone=?, address=?, note=?, status=? where id=? and deleted_at is null";
  const [result] = (await pool.query(updateSupplierQuery, [
    name,
    email,
    phone,
    address,
    note,
    status,
    id,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function deleteSupplier(id: string) {
  const deleteSupplierQuery =
    "update supplier set deleted_at=? where id=? and deleted_at is null";
  const [result] = (await pool.query(deleteSupplierQuery, [
    new Date(),
    id,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function search(text: string) {
  const searchQuery =
    "select id, name, email, phone, address, note, status from supplier where (deleted_at is null) and (name like ? or address like ?)";
  const [supplierRowDatas] = (await pool.query(searchQuery, [
    `%${text}%`,
    `%${text}%`,
  ])) as RowDataPacket[][];
  return supplierRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as Supplier[];
}
function createFilterSql(filter: GetSupplierFilters) {
  let filterStatements: any = [];
// for name, email, sdt, address
  if (filter.searchString) {
    const subFilterStatements: any = [];
    subFilterStatements.push(
      `supplier.name like ${escape(`%${filter.searchString}%`)}`
    );
    subFilterStatements.push(
      `supplier.email like ${escape(`%${filter.searchString}%`)}`
    );
    subFilterStatements.push(
      `supplier.phone like ${escape(`%${filter.searchString}%`)}`
    );
    subFilterStatements.push(
      `supplier.address like ${escape(`%${filter.searchString}%`)}`
    );
    filterStatements.push(`(${subFilterStatements.join(" or ")})`);
  }

  return filterStatements.join(" and ");
}