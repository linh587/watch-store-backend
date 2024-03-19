import * as ProductPriceService from '../services/productPrice.js';
export async function getProductPrices(req, res) {
    const productPrices = await ProductPriceService.getProductPrices();
    res.json(productPrices);
}
export async function getProductPrice(req, res) {
    const id = String(req.params['id']) || '';
    const options = {};
    req.query['includeDeleted'] && (options.includeDeleted = req.query['includeDeleted'] === 'true');
    const productPrice = await ProductPriceService.getProductPrice(id, options);
    res.json(productPrice);
}
