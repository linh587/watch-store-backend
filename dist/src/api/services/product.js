import { escape } from 'mysql2';
import pool from '../db.js';
import { convertUnderscorePropertiesToCamelCase } from '../utils/dataMapping.js';
import { createLimitSql } from '../utils/misc.js';
import { createUid } from '../utils/uid.js';
import * as ProductImageService from './productImage.js';
import * as ProductPriceService from './productPrice.js';
import * as ProductSizeService from './productSize.js';
export const SORT_TYPES = ['highPopular', 'highRating', 'newest', 'oldest'];
export const DEFAULT_COUNT_BE_GOT_ITEM = 10;
export const PRODUCT_STATUS = ['hide', 'show'];
export async function getProducts(options, filters) {
    let getProductIdsQuery = 'select product.id, avg(rating.star) as avg_star, sum(order_detail.quality) as bought_count from ace_coffee_db.product \
        inner join product_price on product.id = product_price.product_id \
        inner join category on product.category_id = category.id \
        left join rating on product.id = rating.product_id \
        left join order_detail on product_price.id = order_detail.product_price_id \
        where product.deleted_at is null and product_price.deleted_at is null';
    if (filters) {
        const filterSql = createFilterSql(filters);
        getProductIdsQuery += filterSql ? ` and ${filterSql}` : '';
    }
    getProductIdsQuery += ' group by product.id';
    if (options) {
        if (options.sort && SORT_TYPES.includes(options.sort)) {
            switch (options.sort) {
                case 'highPopular':
                    getProductIdsQuery += ' order by bought_count desc';
                    break;
                case 'highRating':
                    getProductIdsQuery += ' order by avg_star desc';
                    break;
                case 'newest':
                    getProductIdsQuery += ' order by product.created_at desc';
                    break;
                case 'oldest':
                    getProductIdsQuery += ' order by product.created_at asc';
                    break;
                default:
                    break;
            }
        }
        if (options.limit) {
            getProductIdsQuery += ' ' + createLimitSql(options.limit);
        }
    }
    const [productRowDatas] = await pool.query(getProductIdsQuery);
    const productIds = productRowDatas.map(({ id }) => String(id || ''));
    const productsWithOptions = await Promise.all(productIds.map(productId => getProduct(productId, options?.include)));
    return productsWithOptions.flatMap(product => product ? [product] : []);
}
export async function getProduct(id, include) {
    const getProductsQuery = `select product.id as id, product.name as name, description, status, created_at, category_id, category.name as category_name, cover_image \
        from product inner join category on product.category_id = category.id where product.id=? and product.deleted_at is null`;
    const [productRowDatas] = await pool.query(getProductsQuery, [id]);
    const product = convertUnderscorePropertiesToCamelCase(productRowDatas[0] || null);
    if (!product)
        return null;
    if (include?.images) {
        const images = await ProductImageService.getProductImages(id);
        product.images = images;
    }
    if (include?.priceAndSize) {
        const productPrices = await ProductPriceService.getProductPricesByProductId(id);
        const priceSizeCombines = (await Promise.all(productPrices.map(async (productPrice) => {
            const productSize = await ProductSizeService.getProductSize(productPrice.productSizeId);
            if (!productSize)
                return null;
            return {
                productPriceId: productPrice.id,
                productSizeId: productPrice.productSizeId,
                price: productPrice.price,
                productSizeName: productSize.name,
            };
        }))).flatMap(priceSizeCombine => priceSizeCombine ? [priceSizeCombine] : []);
        product.priceSizeCombines = priceSizeCombines;
    }
    return product;
}
export async function addProduct(information, priceInformations, images) {
    const productId = createUid(20);
    const { name, description, categoryId, coverImage, status } = information;
    const addProductQuery = 'insert into product(`id`, `name`, `description`, `status`, `created_at`, `category_id`, `cover_image`) values (?)';
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.query(addProductQuery, [[productId, name, description, status, new Date(), categoryId, coverImage]]);
        await ProductPriceService.addProductPrices(productId, priceInformations, poolConnection);
        if (images.length > 0) {
            await ProductImageService.addProductImages(productId, images, poolConnection);
        }
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
export async function updateProduct(id, productInformation, priceInformations, images) {
    const { name, description, categoryId, status, coverImage } = productInformation;
    const updateProductQuery = 'update product set name=?, description=?, category_id=?, cover_image=?, status=? where id=? and deleted_at is null';
    const poolConnection = await pool.getConnection();
    try {
        await poolConnection.query(updateProductQuery, [name, description, categoryId, coverImage, status, id]);
        await ProductPriceService.updateProductPrices(id, priceInformations, poolConnection);
        await ProductImageService.updateProductImages(id, images, poolConnection);
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
export async function deleteProduct(id, continueWithConnection) {
    const deleteProductQuery = 'update product set deleted_at=? where id=?';
    const connection = continueWithConnection || await pool.getConnection();
    const deletedDateTime = new Date();
    try {
        await connection.beginTransaction();
        await connection.query(deleteProductQuery, [deletedDateTime, id]);
        await ProductPriceService.deleteProductPricesByProductId(id, connection);
        await connection.commit();
        return true;
    }
    catch (error) {
        console.log(error);
        await connection.rollback();
        return false;
    }
    finally {
        connection.release();
    }
}
function createFilterSql(filter) {
    let filterStatements = [];
    if (filter.status && filter.status !== 'all') {
        filterStatements.push(`product.status=${escape(filter.status)}`);
    }
    if (filter.categoryId) {
        filterStatements.push(`product.category_id=${escape(filter.categoryId)}`);
    }
    if (filter.fromDate) {
        filterStatements.push(`product.created_at >= ${escape(filter.fromDate)}`);
    }
    if (filter.toDate) {
        filterStatements.push(`product.created_at <= ${escape(filter.toDate)}`);
    }
    if (filter.searchString) {
        const subFilterStatements = [];
        subFilterStatements.push(`product.name like ${escape(`%${filter.searchString}%`)}`);
        subFilterStatements.push(`product.id like ${escape(`%${filter.searchString}%`)}`);
        subFilterStatements.push(`product.description like ${escape(`%${filter.searchString}%`)}`);
        subFilterStatements.push(`category.name like ${escape(`%${filter.searchString}%`)}`);
        filterStatements.push(`(${subFilterStatements.join(' or ')})`);
    }
    return filterStatements.join(' and ');
}
