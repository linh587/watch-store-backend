import * as ProductSizeService from '../services/productSize.js';
export async function getProductSizes(req, res) {
    const productSizes = await ProductSizeService.getProductSizes();
    res.json(productSizes);
}
export async function getProductSize(req, res) {
    const id = String(req.params['id']) || '';
    const options = {};
    if (req.query['includeDeleted'] === 'true') {
        options.includeDeleted = true;
    }
    const size = await ProductSizeService.getProductSize(id, options);
    res.json(size);
}
