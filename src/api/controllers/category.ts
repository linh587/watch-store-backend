import { Request, Response } from "express";
import * as CategorySevice from "../services/category.js";

export async function getCategories(req: Request, res: Response) {
    let filter: CategorySevice.GetCategoryFilters = {};
    if(req.query["s"]){
      req.query["s"] && (filter.searchString = req.query["s"] as string);
      //filter.searchString = req.query["s"] as string;
      const categories = await CategorySevice.getCategories(filter);
       res.json(categories);
    }else{
    const categories = await CategorySevice.getCategories();
    res.json(categories);
  }
  }

export async function getCategory(req: Request, res: Response) {
  const categoryId = req.params["categoryId"];
  const category = await CategorySevice.getCategory(categoryId);
  res.json(category);
}
