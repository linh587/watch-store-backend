import * as CategorySevice from "../services/category.js";
export async function getCategories(req, res) {
    const categories = await CategorySevice.getCategories();
    res.json(categories);
}
export async function getCategory(req, res) {
    const categoryId = req.params["categoryId"];
    const category = await CategorySevice.getCategory(categoryId);
    res.json(category);
}
