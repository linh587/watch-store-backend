import { ITEM_COUNT_PER_PAGE } from "../config.js";
import * as PromotionService from "../services/promotion.js";
export async function getPromotions(req, res) {
    const options = {};
    if (req.query["sort"]) {
        const sortType = String(req.query["sort"] || "");
        if (PromotionService.SORT_TYPES.includes(sortType)) {
            options.sort = sortType;
        }
    }
    const promotions = await PromotionService.getPromotions(options);
    res.json({
        hasNextPage: promotions.length === ITEM_COUNT_PER_PAGE,
        data: promotions,
    });
}
export async function getPromotion(req, res) {
    const id = String(req.params["id"]) || "";
    const promotion = await PromotionService.getPromotion(id);
    res.json(promotion);
}
export async function searchPromotionByTitle(req, res) {
    const title = req.params["title"];
    const page = req.query["page"];
    const pageNumber = Number(page);
    let limit;
    if (page && Number.isSafeInteger(pageNumber) && pageNumber > 0) {
        limit = {
            amount: ITEM_COUNT_PER_PAGE,
            offset: ITEM_COUNT_PER_PAGE * (pageNumber - 1),
        };
    }
    const promotions = await PromotionService.searchPromotionByTitle(title, limit);
    res.json({
        hasNextPage: promotions.length === ITEM_COUNT_PER_PAGE,
        data: promotions,
    });
}
