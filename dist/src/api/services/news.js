import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createLimitSql } from '../utils/misc.js';
import { createUid } from '../utils/uid.js';
export async function getNewsList(limit) {
    let getNewsListQuery = 'select id, title, content, cover_image, created_at, updated_at from news where deleted_at is null';
    if (limit) {
        getNewsListQuery += ' ' + createLimitSql(limit);
    }
    const [newsRowDatas] = await pool.query(getNewsListQuery);
    return newsRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getNews(id) {
    const getNewsQuery = 'select id, title, content, cover_image, created_at, updated_at from news where id=? and deleted_at is null';
    const [newsRowDatas] = await pool.query(getNewsQuery, [id]);
    return convertUnderscorePropertiesToCamelCase(newsRowDatas[0] || null);
}
export async function addNews(information) {
    const id = createUid(20);
    const { title, content, coverImage } = information;
    const addNewsQuery = 'insert into news(`id`, `title`, `content`, `cover_image`, `created_at`) values (?)';
    const [result] = await pool.query(addNewsQuery, [[id, title, content, coverImage, new Date()]]);
    return result.affectedRows > 0;
}
export async function updateNews(id, news) {
    const { title, content, coverImage } = news;
    const updateNewsQuery = 'update news set title=?, content=?, cover_image=?, updated_at=? where id=? and deleted_at is null';
    const [result] = await pool.query(updateNewsQuery, [title, content, coverImage, new Date(), id]);
    return result.affectedRows > 0;
}
export async function deleteNews(id) {
    const deleteNewsQuery = 'update news set deleted_at=? where id=? and deleted_at is null';
    const [result] = await pool.query(deleteNewsQuery, [new Date(), id]);
    return result.affectedRows > 0;
}
export async function searchNewsByTitle(title, limit) {
    let searchNewsByTitleQuery = 'select id, title, content, cover_image, created_at, updated_at from news where title like ? and deleted_at is null';
    if (limit) {
        searchNewsByTitleQuery += ' ' + createLimitSql(limit);
    }
    const [newsRowDatas] = await pool.query(searchNewsByTitleQuery, [`%${title}%`]);
    return newsRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
