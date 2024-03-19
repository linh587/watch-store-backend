import { ITEM_COUNT_PER_PAGE } from '../config.js';
import * as ProductService from '../services/product.js';
export async function getProducts(req, res) {
    let options = {};
    let filter = {};
    const includedProperties = String(req.query['includes'] || '').split(',');
    const sortType = String(req.query['sort'] || '');
    if (includedProperties.includes('images')) {
        options.include = { ...options.include, images: true };
    }
    if (includedProperties.includes('priceAndSize')) {
        options.include = { ...options.include, priceAndSize: true };
    }
    if (ProductService.SORT_TYPES.includes(sortType)) {
        options.sort = sortType;
    }
    req.query['s'] && (filter.searchString = req.query['s']);
    req.query['status'] && (filter.status = req.query['status']);
    req.query['fromDate'] && (filter.fromDate = new Date(req.query['fromDate']));
    req.query['toDate'] && (filter.toDate = new Date(req.query['toDate']));
    req.query['categoryId'] && (filter.categoryId = req.query['categoryId']);
    const page = req.query['page'];
    const pageNumber = Number(page);
    if (page && Number.isSafeInteger(pageNumber) && pageNumber > 0) {
        options.limit = { amount: ITEM_COUNT_PER_PAGE, offset: ITEM_COUNT_PER_PAGE * (pageNumber - 1) };
    }
    const products = await ProductService.getProducts(options, filter);
    res.json({ hasNextPage: products.length === ITEM_COUNT_PER_PAGE, data: products });
}
export async function getProduct(req, res) {
    let include = {};
    const includedProperties = String(req.query['includes'] || '').split(',');
    if (includedProperties.includes('images')) {
        include = { ...include, images: true };
    }
    if (includedProperties.includes('priceAndSize')) {
        include = { ...include, priceAndSize: true };
    }
    const productId = req.params['id'] || '';
    const product = await ProductService.getProduct(productId, include);
    res.json(product);
}
