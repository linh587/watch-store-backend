import { escape } from 'mysql2/promise';
import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createLimitSql } from '../utils/misc.js';
import * as OrderDetailService from './orderDetail.js';
const RATING_STATUS = {
    lock: 'lock',
    unavailable: 'unavailable'
};
export const SORT_TYPES = ['newest', 'oldest'];
export async function getAllRatings(options, filters) {
    let getAllRatingsQuery = 'select product_id, user_account_id, star, content, status, created_at, updated_at, user_account.name as user_name, user_account.avatar as user_avatar from rating inner join user_account on rating.user_account_id = user_account.id';
    if (filters) {
        const filterSql = createFilterSql(filters);
        if (filterSql) {
            getAllRatingsQuery += ` where ${filterSql}`;
        }
    }
    if (options) {
        if (options.sort && SORT_TYPES.includes(options.sort)) {
            getAllRatingsQuery += ' ' + createSortSql(options.sort);
        }
        if (options.limit) {
            getAllRatingsQuery += ' ' + createLimitSql(options.limit);
        }
    }
    const [ratingRowDatas] = await pool.query(getAllRatingsQuery);
    return ratingRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getRatings(productId, options, filters) {
    let getRatingsQuery = 'select product_id, user_account_id, star, content, status, created_at, updated_at, user_account.name as user_name, user_account.avatar as user_avatar from rating inner join user_account on rating.user_account_id = user_account.id where product_id=? and status is null';
    if (filters) {
        const filterSql = createFilterSql(filters);
        if (filterSql) {
            getRatingsQuery += ` and ${filterSql}`;
        }
    }
    if (options) {
        if (options.sort) {
            getRatingsQuery += ' ' + createSortSql(options.sort);
        }
        if (options.limit) {
            getRatingsQuery += ' ' + createLimitSql(options.limit);
        }
    }
    const [ratingRowDatas] = await pool.query(getRatingsQuery, [productId]);
    return ratingRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getOwnRating(userAccountId, productId) {
    const getOwnRatingQuery = 'select product_id, user_account_id, star, content, status, created_at, updated_at, user_account.name as user_name, user_account.avatar as user_avatar from rating inner join user_account on rating.user_account_id = user_account.id where product_id=? and user_account_id=? and status is null';
    const [ratingRowDatas] = await pool.query(getOwnRatingQuery, [productId, userAccountId]);
    return convertUnderscorePropertiesToCamelCase(ratingRowDatas[0] || null);
}
export async function getAverageStar(productId) {
    const getAverageStarQuery = 'select avg(star) as average_star from rating where product_id=? and status is null';
    const [rowDatas] = await pool.query(getAverageStarQuery, [productId]);
    const averageStar = Number(rowDatas?.[0]?.['average_star']) || null;
    return averageStar;
}
export async function addRating(userAccountId, information) {
    const { productId, star, content } = information;
    const addRatingQuery = 'insert into rating(`product_id`, `user_account_id`, `star`, `content`, `created_at`) values (?)';
    if (!await canRating(userAccountId, productId)) {
        return false;
    }
    try {
        const [result] = await pool.query(addRatingQuery, [[productId, userAccountId, star, content, new Date()]]);
        return result.affectedRows > 0;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}
export async function updateRating(userAccountId, productId, information) {
    const { star, content } = information;
    const updateRatingQuery = 'update rating set star=?, content=?, updated_at=? where product_id=? and user_account_id=?';
    const [result] = await pool.query(updateRatingQuery, [star, content, new Date(), productId, userAccountId]);
    return result.affectedRows > 0;
}
export async function deleteRating(userAccountId, productId) {
    const deleteRatingQuery = 'delete from rating where product_id=? and user_account_id=?';
    const [result] = await pool.query(deleteRatingQuery, [productId, userAccountId]);
    return result.affectedRows > 0;
}
export async function canRating(userAccountId, productId) {
    const userBounghtProduct = await OrderDetailService.boughtProduct(userAccountId, productId);
    return userBounghtProduct;
}
export async function lockRating(userAccountId, productId) {
    const lockRatingQuery = 'update rating set status=? where user_account_id=? and product_id=? and status is null';
    const [result] = await pool.query(lockRatingQuery, [RATING_STATUS.lock, userAccountId, productId]);
    return result.affectedRows > 0;
}
export async function unlockRating(userAccountId, productId) {
    const unlockRatingQuery = 'update rating set status=null where user_account_id=? and product_id=? and status=?';
    const [result] = await pool.query(unlockRatingQuery, [userAccountId, productId, RATING_STATUS.lock]);
    return result.affectedRows > 0;
}
export async function setUnavailableRating(userAccountId, connection) {
    const setUnavailableRatingQuery = 'update rating set status= where user_account_id=? and status is null';
    const [result] = await connection.query(setUnavailableRatingQuery, [RATING_STATUS.unavailable, userAccountId]);
    return result.affectedRows > 0;
}
function createSortSql(sort) {
    switch (sort) {
        case 'newest':
            return 'order by created_at desc';
        case 'oldest':
            return 'order by created_at asc';
        default:
            return '';
    }
}
function createFilterSql(filters) {
    const filterConditions = [];
    if (filters.star) {
        filterConditions.push(`star=${escape(filters.star)}`);
    }
    if (filters.status) {
        filterConditions.push(`rating.status=${escape(filters.status)}`);
    }
    if (filters.searchString) {
        const searchStringConditions = [];
        searchStringConditions.push(`rating.content like ${escape(`%${filters.searchString}%`)}`);
        searchStringConditions.push(`user_account.name like ${escape(`%${filters.searchString}%`)}`);
        filterConditions.push(`(${searchStringConditions.join(' or ')})`);
    }
    return filterConditions.join(' and ');
}
