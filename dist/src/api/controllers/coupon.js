import { ITEM_COUNT_PER_PAGE } from '../config.js';
import * as CouponService from '../services/coupon.js';
import * as ProductPriceService from '../services/productPrice.js';
export async function getCoupons(req, res) {
    const page = req.query['page'];
    const pageNumber = Number(page);
    let limit;
    if (page && Number.isSafeInteger(pageNumber) && pageNumber > 0) {
        limit = { amount: ITEM_COUNT_PER_PAGE, offset: ITEM_COUNT_PER_PAGE * (pageNumber - 1) };
    }
    const coupons = await CouponService.getCoupons(limit);
    res.json({ hasNextPage: coupons.length === ITEM_COUNT_PER_PAGE, data: coupons });
}
export async function getCoupon(req, res) {
    const couponCode = req.params['couponCode'];
    const coupon = await CouponService.getCoupon(couponCode);
    res.json(coupon);
}
export async function searchCoupon(req, res) {
    const text = req.params['text'];
    const coupons = await CouponService.search(text);
    res.json(coupons);
}
export async function calculateAmountOfDecreaseMoney(req, res) {
    const couponCode = req.body['couponCode'];
    const order = req.body['order'];
    const coupon = await CouponService.getCoupon(couponCode);
    const orderDetailsBeMappingPrice = await Promise.all(order.details.map(async (detail) => {
        const productPrice = await ProductPriceService.getProductPrice(detail.productPriceId);
        const price = Number(productPrice?.price) || 0;
        return { ...detail, price };
    }));
    if (coupon) {
        const decreasePrice = CouponService.calculateDecreaseMoneyForOrder(coupon, { ...order, details: orderDetailsBeMappingPrice });
        res.json(decreasePrice);
    }
    else {
        res.status(400).json('Not found coupon');
    }
}
export async function findRelationCoupons(req, res) {
    const order = req.body['order'];
    const orderDetailsBeMappingPrice = await Promise.all(order.details.map(async (detail) => {
        const productPrice = await ProductPriceService.getProductPrice(detail.productPriceId);
        const price = Number(productPrice?.price) || 0;
        return { ...detail, price };
    }));
    const relationCoupons = await CouponService.findRelationCoupons({ ...order, details: orderDetailsBeMappingPrice });
    res.json(relationCoupons);
}
