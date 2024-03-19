import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createUid } from '../utils/uid.js';
const DEFAULT_OPEN_TIME = '07:00:00';
const DEFAULT_CLOSE_TIME = '20:00:00';
export async function getBranches() {
    const getBranchesQuery = 'select id, name, phone, address, opened_at, closed_at, longitude, latitude from branch where deleted_at is null';
    const [branchRowDatas] = await pool.query(getBranchesQuery);
    return branchRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getBranch(id) {
    const getBranchQuery = 'select id, name, phone, address, opened_at, closed_at, longitude, latitude from branch where id=? and deleted_at is null';
    const [branchRowDatas] = await pool.query(getBranchQuery, [id]);
    return convertUnderscorePropertiesToCamelCase(branchRowDatas[0] || null);
}
export async function addBranch(information) {
    const id = createUid(20);
    const { name, phone, address, openedAt = DEFAULT_OPEN_TIME, closedAt = DEFAULT_CLOSE_TIME, longitude, latitude } = information;
    const addBranchQuery = 'insert into branch(`id`, `name`, `phone`, `address`, `opened_at`, `closed_at`, `longitude`, `latitude`) values (?)';
    const [result] = await pool.query(addBranchQuery, [[id, name, phone, address, openedAt, closedAt, longitude, latitude]]);
    return result.affectedRows > 0;
}
export async function updateBranch(id, information) {
    const { name, phone, address, openedAt = DEFAULT_OPEN_TIME, closedAt = DEFAULT_CLOSE_TIME, longitude, latitude } = information;
    const updateBranchQuery = 'update branch set name=?, phone=?, address=?, opened_at=?, closed_at=?, longitude=?, latitude=? where id=? and deleted_at is null';
    const [result] = await pool.query(updateBranchQuery, [name, phone, address, openedAt, closedAt, longitude, latitude, id]);
    return result.affectedRows > 0;
}
export async function deleteBranch(id) {
    const deleteBranchQuery = 'update branch set deleted_at=? where id=? and deleted_at is null';
    const [result] = await pool.query(deleteBranchQuery, [new Date(), id]);
    return result.affectedRows > 0;
}
export async function search(text) {
    const searchQuery = 'select id, name, phone, address, opened_at, closed_at, longitude, latitude from branch where (deleted_at is null) and (name like ? or address like ?)';
    const [branchRowDatas] = await pool.query(searchQuery, [`%${text}%`, `%${text}%`]);
    return branchRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
