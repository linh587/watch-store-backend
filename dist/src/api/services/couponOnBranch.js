import pool from '../db.js';
export async function getBranchIds(couponCode) {
    const getBranchesQuery = `select branch_id from coupon_on_branch where coupon_code=?`;
    const [couponOnBranchRowDatas] = await pool.query(getBranchesQuery, [couponCode]);
    return couponOnBranchRowDatas.map((couponOnBranchRowData) => String(couponOnBranchRowData?.['branch_id'] || ''));
}
export async function addBranches(couponCode, branchIds, connection) {
    const addBranchesQuery = 'insert into coupon_on_branch(`coupon_code`, `branch_id`) values ?';
    const [result] = await connection.query(addBranchesQuery, [branchIds.map(branchId => [couponCode, branchId])]);
    return result.affectedRows > 0;
}
export async function updateBranches(couponCode, branchIds, connection) {
    const deleteBranchesQuery = 'delete from coupon_on_branch where coupon_code=?';
    const addBranchesQuery = 'insert into coupon_on_branch(`coupon_code`, `branch_id`) values ?';
    await connection.query(deleteBranchesQuery, [couponCode]);
    await connection.query(addBranchesQuery, [branchIds.map(branchId => [couponCode, branchId])]);
    return true;
}
export async function deleteBranches(couponCode, connection) {
    const deleteBranchesQuery = 'delete from coupon_on_branch where coupon_code=?';
    const [result] = await connection.query(deleteBranchesQuery, [couponCode]);
    return result.affectedRows > 0;
}
export function matchCondition(coupon, order) {
    return coupon.branchIds.includes(order.branchId);
}
export async function getRelationCouponCodes(branchId) {
    const getRelationCouponCodeQuery = 'select coupon_code from coupon_on_branch where branch_id=?';
    const [couponOnBranchRowDatas] = await pool.query(getRelationCouponCodeQuery, [branchId]);
    return couponOnBranchRowDatas.map(rowData => String(rowData['coupon_code']) || '').filter(couponCode => couponCode !== '');
}
