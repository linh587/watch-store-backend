import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createUid } from '../utils/uid.js';
export async function getBanners() {
    const getBannersQuery = 'select id, title, link_to, image from banner';
    const [bannerRowDatas] = await pool.query(getBannersQuery);
    return bannerRowDatas.map(convertUnderscorePropertiesToCamelCase);
}
export async function getBanner(id) {
    const getBannerQuery = 'select id, title, link_to, image from banner where id=?';
    const [bannerRowDatas] = await pool.query(getBannerQuery, [id]);
    return convertUnderscorePropertiesToCamelCase(bannerRowDatas[0] || null);
}
export async function addBanner(information) {
    const bannerId = createUid(20);
    const { title, linkTo, image } = information;
    const addBannerQuery = 'insert into banner(`id`, `title`, `link_to`, `image`) values (?)';
    const [result] = await pool.query(addBannerQuery, [[bannerId, title, linkTo, image]]);
    return result.affectedRows > 0;
}
export async function updateBanner(id, information) {
    const { title, linkTo, image } = information;
    const updateBannerQuery = 'update banner set title=?, link_to=?, image=? where id=?';
    const [result] = await pool.query(updateBannerQuery, [title, linkTo, image, id]);
    return result.affectedRows > 0;
}
export async function deleteBanner(id) {
    const deleteBannerQuery = 'delete from banner where id=?';
    const [result] = await pool.query(deleteBannerQuery, [id]);
    return result.affectedRows > 0;
}
