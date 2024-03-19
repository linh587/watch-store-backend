import { ITEM_COUNT_PER_PAGE } from '../config.js';
import * as NewsService from '../services/news.js';
export async function getNewsList(req, res) {
    const page = req.query['page'];
    const pageNumber = Number(page);
    let getLimit;
    if (page && Number.isSafeInteger(pageNumber) && pageNumber > 0) {
        getLimit = { amount: ITEM_COUNT_PER_PAGE, offset: ITEM_COUNT_PER_PAGE * (pageNumber - 1) };
    }
    const newsList = await NewsService.getNewsList(getLimit);
    res.json({ hasNextPage: newsList.length === ITEM_COUNT_PER_PAGE, data: newsList });
}
export async function getNews(req, res) {
    const id = req.params['id'];
    const news = await NewsService.getNews(id);
    res.json(news || null);
}
export async function searchNewsByTitle(req, res) {
    const title = req.params['title'];
    const page = req.query['page'];
    const pageNumber = Number(page);
    let getLimit;
    if (page && Number.isSafeInteger(pageNumber) && pageNumber > 0) {
        getLimit = { amount: ITEM_COUNT_PER_PAGE, offset: ITEM_COUNT_PER_PAGE * (pageNumber - 1) };
    }
    const newsList = await NewsService.searchNewsByTitle(title, getLimit);
    res.json({ hasNextPage: newsList.length === ITEM_COUNT_PER_PAGE, data: newsList });
}
