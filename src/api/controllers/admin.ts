import { Response, Request } from "express";
import { LimitOptions, ITEM_COUNT_PER_PAGE } from "../config.js";
import { AdminRequest } from "../middlewares/authorization.js";
import { FormDataRequest } from "../middlewares/formDataExtract.js";
import * as AdminService from "../services/adminAccount.js";
import * as CategoryService from "../services/category.js";
import * as CouponService from "../services/coupon.js";
import * as NewsService from "../services/news.js";
import * as ProductService from "../services/product.js";
import * as ProductPriceService from "../services/productPrice.js";
import * as ProductSizeService from "../services/productSize.js";
import * as PromotionService from "../services/promotion.js";
import * as RatingService from "../services/rating.js";
import * as StaffService from "../services/staffAccount.js";
import * as UserAccountService from "../services/userAccount.js";
import * as NotificationService from "../services/notification.js";
import * as SupplierService from "../services/supplier.js";
import * as GoodReceiptService from "../services/goodReceipt.js";
import * as DamageService from "../services/damage.js";
import * as ReturnServie from "../services/returnOrder.js";
import { deleteImage, uploadImage } from "../utils/storageImage.js";
import { getSocketIO } from "../../socketIO.js";
import * as OrderService from "../services/order.js";

export async function getInformation(req: AdminRequest, res: Response) {
  const { id } = req;
  if (id) {
    const information = await AdminService.getInformation(id);
    if (information) {
      res.json(information);
    } else {
      res.status(400).json("Not found this admin");
    }
  } else {
    res.status(401).json("Unknow error");
  }
}

export async function updatePassword(req: AdminRequest, res: Response) {
  const username = req.username;
  const { oldPassword = "", newPassword = "" } = req.body;
  if (!username) {
    res.status(401).json("Unknow error");
    return;
  }

  const success = await AdminService.updatePassword(
    username,
    oldPassword,
    newPassword
  );
  if (success) {
    res.json("Update successful");
  } else {
    res.status(400).json("Update failure");
  }
}

export async function addCategory(req: AdminRequest, res: Response) {
  const categoryName = String(req.body["name"] || "");
  const success = await CategoryService.addCategory(categoryName);

  if (success) {
    res.json("Add category successful");
  } else {
    res.status(400).json("Add category failure");
  }
}
export async function updateCategory(req: AdminRequest, res: Response) {
  const categoryName = req.body["name"];
  const categoryId = req.params["categoryId"];
  const success = await CategoryService.updateCategory(
    categoryId,
    categoryName
  );

  if (success) {
    res.json("Update category successful");
  } else {
    res.status(400).json("Update category failure");
  }
}
export async function deleteCategory(req: AdminRequest, res: Response) {
  const categoryId = req.params["categoryId"];
  const success = await CategoryService.deleteCategory(categoryId);

  if (success) {
    res.json("Delete category successful");
  } else {
    res.status(400).json("Delete category failure");
  }
}

export async function addSupplier(req: AdminRequest, res: Response) {
  const information = req.body as SupplierService.InformationToCreateSupplier;
  const success = await SupplierService.addSupplier(information);
  if (success) {
    res.json("Add supplier successful");
  } else {
    res.status(400).json("Add supplier failure");
  }
}

export async function updateSupplier(req: AdminRequest, res: Response) {
  const information = req.body as SupplierService.InformationToUpdateSupplier;
  const supplierId = req.params["supplierId"];

  const success = await SupplierService.updateSupplier(supplierId, information);

  if (success) {
    res.json("Update supplier successful");
  } else {
    res.status(400).json("Update supplier failure");
  }
}

export async function deleteSupplier(req: AdminRequest, res: Response) {
  const supplierId = req.params["supplierId"];
  const success = await SupplierService.deleteSupplier(supplierId);

  if (success) {
    res.json("Delete supplier successful");
  } else {
    res.status(400).json("Delete supplier failure");
  }
}

export async function getSuppliers(req: Request, res: Response) {
  let filter: SupplierService.GetSupplierFilters = {};
  if (req.query["s"]) {
    req.query["s"] && (filter.searchString = req.query["s"] as string);
    const suppliers = await SupplierService.getSuppliers(filter);
    res.json(suppliers);
  } else {
    const suppliers = await SupplierService.getSuppliers();
    res.json(suppliers);
  }
}

export async function getSupplier(req: Request, res: Response) {
  const id = req.params["id"] || "";
  if (!id) {
    res.status(400).json("Miss id");
    return;
  }

  const supplier = await SupplierService.getSupplier(id);
  res.json(supplier);
}

export async function createGoodReceipt(req: Request, res: Response) {
  const information: GoodReceiptService.InfomationToCreateGoodReciept =
    req.body["receipt"];

  const supplierBeGoodReceipt = await SupplierService.getSupplier(information.supplierId);
  if (!supplierBeGoodReceipt) {
    res.status(400).json(`Supplier #${information.supplierId} not found`);
    return;
  }

  const receiptId = await GoodReceiptService.createGoodReciept({
    ...information,
  });

  if (receiptId) {
    res.json(receiptId);
  } else {
    res.status(400).json("Error when create good receipt");
  }
}

export async function updateGoodReceipt(req: Request, res: Response) {
  const { goodReceiptId } = req.params;
  const updatedInformation: GoodReceiptService.InformationToUpdateGoodReceipt =
    req.body["receipt"];

  // Kiểm tra xem phiếu nhập có tồn tại không
  const existingGoodReceipt = await GoodReceiptService.getGoodReceiptById(
    goodReceiptId
  );
  if (!existingGoodReceipt) {
    res.status(404).json(`Good receipt with ID ${goodReceiptId} not found`);
    return;
  }

  // Thực hiện cập nhật thông tin phiếu nhập
  const isSuccess = await GoodReceiptService.updateGoodReceipt(
    goodReceiptId,
    updatedInformation
  );

  if (isSuccess) {
    res.json({ message: "Good receipt updated successfully" });
  } else {
    res.status(400).json("Error when updating good receipt");
  }
}

export async function deleteGoodReceipt(req: Request, res: Response) {
  const receiptId = req.params["goodReceiptId"];
  const success = await GoodReceiptService.deleteReceipt(receiptId);

  if (success) {
    res.json("Delete receipt successful");
  } else {
    res.status(400).json("Delete receipt failure");
  }
}

export async function getAllGoodReceipts(req: Request, res: Response) {
  const options: GoodReceiptService.GetGoodReceiptOptions = {};

  if (req.query["sort"]) {
    const sortType = String(
      req.query["sort"] || ""
    ) as GoodReceiptService.SortType;
    if (OrderService.SORT_TYPES.includes(sortType)) {
      options.sort = sortType;
    }
  }

  const goodReceipts = await GoodReceiptService.getAllGoodReceipts(options);

  res.json({
    data: goodReceipts,
  });
}

export async function getGoodReceipt(req: Request, res: Response) {
  const goodReceiptId = req.params["goodReceiptId"];
  const goodReceipt = await GoodReceiptService.getGoodReceiptById(
    goodReceiptId
  );
  res.json(goodReceipt);
}

export async function createReturnOrder(req: Request, res: Response) {
  const information: ReturnServie.InfomationToCreateReturnOrder =
    req.body["return"];
    
  const returnOrderId = await ReturnServie.createReturnOrder({
    ...information,
  });

  if (returnOrderId) {
    res.json(returnOrderId);
  } else {
    res.status(400).json("Error when create return order");
  }
}
export async function getAllReturnOrders(req: Request, res: Response) {
  const options: ReturnServie.GetReturnOrderOptions = {};

  if (req.query["sort"]) {
    const sortType = String(
      req.query["sort"] || ""
    ) as ReturnServie.SortType;
    if (OrderService.SORT_TYPES.includes(sortType)) {
      options.sort = sortType;
    }
  }

  const returns = await ReturnServie.getAllReturnOrders(options);
  res.json({
    data: returns,
  });
}

export async function getReturnOrder(req: Request, res: Response) {
  const returnOrderId = req.params["returnOrderId"];
  const returnOrder = await ReturnServie.getReturnOrderById(
    returnOrderId
  );
  res.json(returnOrder);
}

export async function updateStatusReturn(req: Request, res: Response) {
  const { returnOrderId } = req.params;
  const updatedInformation: ReturnServie.InformationToUpdateStatusReturnOrder =
    req.body["return"];

  // Kiểm tra xem phiếu nhập có tồn tại không
  const existingGoodReceipt = await ReturnServie.getReturnOrderById(
    returnOrderId
  );
  if (!existingGoodReceipt) {
    res.status(404).json(`Good receipt with ID ${returnOrderId} not found`);
    return;
  }

  // Thực hiện cập nhật thông tin phiếu nhập
  const isSuccess = await ReturnServie.updateStatusReturnOrder(
    returnOrderId,
    updatedInformation
  );

  if (isSuccess) {
    res.json({ message: "Return Order updated successfully" });
  } else {
    res.status(400).json("Error when updating Return Order");
  }
}
export async function deleteReturnOrder(req: Request, res: Response) {
  const returnOrderId = req.params["returnOrderId"];
  const success = await ReturnServie.deleteReturnOrder(returnOrderId);

  if (success) {
    res.json("Delete Return Order successful");
  } else {
    res.status(400).json("Delete Return Order failure");
  }
}

export async function getAllDamages(req: Request, res: Response) {
  const options: GoodReceiptService.GetGoodReceiptOptions = {};

  if (req.query["sort"]) {
    const sortType = String(
      req.query["sort"] || ""
    ) as GoodReceiptService.SortType;
    if (OrderService.SORT_TYPES.includes(sortType)) {
      options.sort = sortType;
    }
  }

  const damages = await DamageService.getAllDamages(options);
  res.json({
    data: damages,
  });
}

export async function getDamage(req: Request, res: Response) {
  const damageId = req.params["damageId"];
  const damage = await DamageService.getDamageById(damageId);
  res.json(damage);
}

export async function createDamage(req: Request, res: Response) {
  const information: DamageService.InfomationToCreateDamage =
    req.body["damage"];
  const damageId = await DamageService.createDamage(information);
  if (damageId) {
    res.json(damageId);
  } else {
    res.status(400).json("Error when created damage");
  }
}

export async function updateDamage(req: Request, res: Response) {
  const { damageId } = req.params;
  const updatedInformation: DamageService.InformationToUpdateDamage =
    req.body["damage"];

  const existingGoodReceipt = await DamageService.getDamageById(damageId);
  if (!existingGoodReceipt) {
    res.status(404).json(`Damage with ID ${damageId} not found`);
    return;
  }

  const isSuccess = await DamageService.updateDamage(
    damageId,
    updatedInformation
  );

  if (isSuccess) {
    res.json({ message: "Damage updated successfully" });
  } else {
    res.status(400).json("Error when updating damage");
  }
}

export async function deleteDamage(req: Request, res: Response) {
  const damageId = req.params["damageId"];
  const success = await DamageService.deleteDamage(damageId);

  if (success) {
    res.json("Delete damage successful");
  } else {
    res.status(400).json("Delete damage failure");
  }
}

export async function addProductSize(req: AdminRequest, res: Response) {
  const productSizeName = String(req.body["name"]);
  const success = await ProductSizeService.addProductSize(productSizeName);

  if (success) {
    res.json("Add product size successful");
  } else {
    res.status(400).json("Add product size failure");
  }
}

export async function updateProductSize(req: AdminRequest, res: Response) {
  const productSizeName = req.body["name"];
  const productSizeId = req.params["productSizeId"];

  const success = await ProductSizeService.updateProductSize(
    productSizeId,
    productSizeName
  );

  if (success) {
    res.json("Update product size successful");
  } else {
    res.status(400).json("Update product size failure");
  }
}

export async function deleteProductSize(req: AdminRequest, res: Response) {
  const productSizeId = req.params["productSizeId"];
  const success = await ProductSizeService.deleteProductSize(productSizeId);

  if (success) {
    res.json("Delete product size successful");
  } else {
    res.status(400).json("Delete product size failure");
  }
}

export async function addProduct(
  req: FormDataRequest<AdminRequest>,
  res: Response
) {
  if (!req.fields || !req.files || !req.files.coverImageFile) {
    res.status(400).json("Unknown error");
    return;
  }

  const information = req.fields as ProductService.InformationToCreateProduct;

  const priceInformationJsons = Array.isArray(req.fields.priceInformationJsons)
    ? req.fields.priceInformationJsons
    : [req.fields.priceInformationJsons];

  if (priceInformationJsons.includes("")) {
    res.status(400).json("Miss price size combine list");
    return;
  }

  const priceInformations = priceInformationJsons.map(
    (json) =>
      JSON.parse(json) as ProductPriceService.InformationToCreateProductPrice
  );
  const coverImageFile = Array.isArray(req.files.coverImageFile)
    ? req.files.coverImageFile[0]
    : req.files.coverImageFile;
  const imageFiles = req.files.imageFiles
    ? Array.isArray(req.files.imageFiles)
      ? req.files.imageFiles
      : [req.files.imageFiles]
    : [];

  information.coverImage = await uploadImage(coverImageFile.filepath);
  const images = await Promise.all(
    imageFiles.map((file) => uploadImage(file.filepath))
  );
  const success = await ProductService.addProduct(
    information,
    priceInformations,
    images
  );

  if (success) {
    res.json("Add product successful");
  } else {
    res.status(400).json("Add product failure");
  }
}

export async function updateProduct(
  req: FormDataRequest<AdminRequest>,
  res: Response
) {
  if (!req.fields) {
    res.status(400).json("Unknown error");
    return;
  }
  const productId = req.params["productId"];
  const oldProduct = await ProductService.getProduct(productId, {
    images: true,
  });
  if (!oldProduct) {
    res.status(400).json("Not found product");
    return;
  }

  const information = req.fields as ProductService.InformationToUpdateProduct;
  const images = req.fields.images
    ? Array.isArray(req.fields.images)
      ? req.fields.images
      : [req.fields.images]
    : [];
  const priceInformationJsons = Array.isArray(req.fields.priceInformationJsons)
    ? req.fields.priceInformationJsons
    : [req.fields.priceInformationJsons];

  const priceInformations = priceInformationJsons.map(
    (json) =>
      JSON.parse(json) as ProductPriceService.InformationToUpdateProductPrice
  );
  if (req.files) {
    if (req.files.coverImageFile) {
      const coverImageFile = Array.isArray(req.files.coverImageFile)
        ? req.files.coverImageFile[0]
        : req.files.coverImageFile;
      information.coverImage = await uploadImage(coverImageFile.filepath);
    }

    if (req.files.imageFiles) {
      const imageFiles = Array.isArray(req.files.imageFiles)
        ? req.files.imageFiles
        : [req.files.imageFiles];
      const newImages = await Promise.all(
        imageFiles.map((file) => uploadImage(file.filepath))
      );
      images.push(...newImages);
    }
  }

  const oldProductImages = oldProduct.images || [];
  const unusedImages =
    oldProduct.coverImage !== information.coverImage
      ? [oldProduct.coverImage]
      : [];

  unusedImages.push(
    ...oldProductImages.filter((oldImage) => !images.includes(oldImage))
  );

  await Promise.all(unusedImages.map(deleteImage));

  const success = await ProductService.updateProduct(
    productId,
    information,
    priceInformations,
    images
  );

  if (success) {
    res.json("Update product successful");
  } else {
    res.status(400).json("Update product failure");
  }
}

export async function deleteProduct(req: AdminRequest, res: Response) {
  const productId = req.params["productId"];
  const success = await ProductService.deleteProduct(productId);

  if (success) {
    res.json("Delete product successful");
  } else {
    res.status(400).json("Delete product failure");
  }
}

export async function getStaffAccounts(req: AdminRequest, res: Response) {
  const page = req.query["page"];
  const pageNumber = Number(page);
  let limit: LimitOptions | undefined;
  let filter: UserAccountService.GetCustomerFilters = {};

  if (req.query["s"]) {
    req.query["s"] && (filter.searchString = req.query["s"] as string);
  }
  if (page && Number.isSafeInteger(pageNumber) && pageNumber > 0) {
    limit = {
      amount: ITEM_COUNT_PER_PAGE,
      offset: ITEM_COUNT_PER_PAGE * (pageNumber - 1),
    };
  }

  const staffAccounts = await StaffService.getStaffAccounts(limit, filter);

  res.json({
    hasNextPage: staffAccounts.length === ITEM_COUNT_PER_PAGE,
    data: staffAccounts,
  });
}

export async function addStaffAccount(
  req: FormDataRequest<AdminRequest>,
  res: Response
) {
  if (!req.fields) {
    res.status(400).json("Unknown error");
    return;
  }

  const information =
    req.fields as StaffService.InformationToCreateStaffAccount;
  if (req.files && req.files.avatarFile) {
    const avatarFile = Array.isArray(req.files.avatarFile)
      ? req.files.avatarFile[0]
      : req.files.avatarFile;

    information.avatar = await uploadImage(avatarFile.filepath);
  }

  const success = await StaffService.addStaffAccount(information);

  if (success) {
    res.json("Add successful");
  } else {
    res.status(400).json("Add failure");
  }
}

export async function deleteStaffAccount(req: AdminRequest, res: Response) {
  const staffAccountId = req.params["staffAccountId"];
  const success = await StaffService.deleteAccount(staffAccountId);
  if (success) {
    res.json("Delete successful");
  } else {
    res.status(400).json("Delete failure");
  }
}

export async function resetStaffAccountPassword(
  req: AdminRequest,
  res: Response
) {
  const staffAccountId = req.params["staffAccountId"];
  const success = await StaffService.resetPassword(staffAccountId);
  if (success) {
    res.json("Reset password successful");
  } else {
    res.status(400).json("Reset password failure");
  }
}

export async function addNews(
  req: FormDataRequest<AdminRequest>,
  res: Response
) {
  if (!req.fields || !req.files || !req.files.coverImageFile) {
    res.status(400).json("Unknown error");
    return;
  }

  const information = req.fields as NewsService.InformationToCreateNews;
  const coverImageFile = Array.isArray(req.files.coverImageFile)
    ? req.files.coverImageFile[0]
    : req.files.coverImageFile;

  information.coverImage = await uploadImage(coverImageFile.filepath);
  const success = await NewsService.addNews(information);

  if (success) {
    res.json("Add news successful");
  } else {
    res.status(400).json("Add news failure");
  }
}

export async function updateNews(
  req: FormDataRequest<AdminRequest>,
  res: Response
) {
  if (!req.fields) {
    res.status(400).json("Unknown error");
    return;
  }

  const newsId = req.params["newsId"];
  const information = req.fields as NewsService.InformationToUpdateNews;
  if (req.files && req.files.coverImageFile) {
    const coverImageFile = Array.isArray(req.files.coverImageFile)
      ? req.files.coverImageFile[0]
      : req.files.coverImageFile;
    information.coverImage = await uploadImage(coverImageFile.filepath);
  }

  const success = await NewsService.updateNews(newsId, information);

  if (success) {
    res.json("Update news successful");
  } else {
    res.status(400).json("Update news failure");
  }
}

export async function deleteNews(req: AdminRequest, res: Response) {
  const newsId = req.params["newsId"];
  const success = await NewsService.deleteNews(newsId);
  if (success) {
    res.json("Delete news successful");
  } else {
    res.status(400).json("Delete news failure");
  }
}

export async function addCoupon(req: AdminRequest, res: Response) {
  const information = req.body as CouponService.InformationToCreateCoupon;
  const success = await CouponService.addCoupon(information);
  if (success) {
    res.json("Add coupon successful");
  } else {
    res.status(400).json("Add coupon failure");
  }
}

export async function updateCoupon(req: AdminRequest, res: Response) {
  const couponCode = req.params["couponCode"];
  const information = req.body as CouponService.InformationToUpdateCoupon;
  const success = await CouponService.updateCoupon(couponCode, information);
  if (success) {
    res.json("Update coupon successful");
  } else {
    res.status(400).json("Update coupon failure");
  }
}

export async function deleteCoupon(req: AdminRequest, res: Response) {
  const couponCode = req.params["couponCode"];
  const success = await CouponService.deleteCoupon(couponCode);
  if (success) {
    res.json("Delete coupon successful");
  } else {
    res.status(400).json("Delete coupon failure");
  }
}

export async function addPromotion(
  req: FormDataRequest<AdminRequest>,
  res: Response
) {
  if (!req.fields || !req.files || !req.files.coverImageFile) {
    res.status(400).json("Unknown error");
    return;
  }

  const information =
    req.fields as PromotionService.InformationToCreatePromotion;
  const coverImageFile = Array.isArray(req.files.coverImageFile)
    ? req.files.coverImageFile[0]
    : req.files.coverImageFile;

  information.coverImage = await uploadImage(coverImageFile.filepath);

  const success = await PromotionService.addPromotion(information);

  if (success) {
    res.json("Add promotion successful");
  } else {
    res.status(400).json("Add promotion failure");
  }
}

export async function updatePromotion(
  req: FormDataRequest<AdminRequest>,
  res: Response
) {
  if (!req.fields) {
    res.status(400).json("Unknown error");
    return;
  }

  const promotionId = req.params["promotionId"];
  const information =
    req.fields as PromotionService.InformationToUpdatePromotion;
  if (req.files && req.files.coverImageFile) {
    const coverImageFile = Array.isArray(req.files.coverImageFile)
      ? req.files.coverImageFile[0]
      : req.files.coverImageFile;

    information.coverImage = await uploadImage(coverImageFile.filepath);
  }

  const success = await PromotionService.updatePromotion(
    promotionId,
    information
  );

  if (success) {
    res.json("Update promotion successful");
  } else {
    res.status(400).json("Update promotion failure");
  }
}

export async function deletePromotion(req: AdminRequest, res: Response) {
  const promotionId = req.params["promotionId"];
  const success = await PromotionService.deletePromotion(promotionId);
  if (success) {
    res.json("Delete news successful");
  } else {
    res.status(400).json("Delete news failure");
  }
}

export async function getUserAccounts(req: AdminRequest, res: Response) {
  const page = req.query["page"];
  const pageNumber = Number(page);
  let limit: LimitOptions | undefined;
  let filter: UserAccountService.GetCustomerFilters = {};

  if (req.query["s"]) {
    req.query["s"] && (filter.searchString = req.query["s"] as string);
  }

  if (page && Number.isSafeInteger(pageNumber) && pageNumber > 0) {
    limit = {
      amount: ITEM_COUNT_PER_PAGE,
      offset: ITEM_COUNT_PER_PAGE * (pageNumber - 1),
    };
  }
  const userAccounts = await UserAccountService.getUserAccounts(limit, filter);
  res.json({
    hasNextPage: userAccounts.length === ITEM_COUNT_PER_PAGE,
    data: userAccounts,
  });
}

export async function lockUserAccount(req: AdminRequest, res: Response) {
  const userAccountId = req.params["userAccountId"];
  const success = await UserAccountService.lockAccount(userAccountId);
  if (success) {
    const notificationContent =
      "Tài khoản của bạn đã bị khóa tính năng đặt hàng";
    const pushNotificationResult = await NotificationService.addNotification({
      content: notificationContent,
      userAccountId,
    });
    if (pushNotificationResult) {
      const socketIO = getSocketIO();
      socketIO.to(userAccountId).emit("newNotification");
    }

    res.json("Locked user successful");
  } else {
    res.status(400).json("Locked user failure");
  }
}

export async function unlockUserAccount(req: AdminRequest, res: Response) {
  const userAccountId = req.params["userAccountId"];
  const success = await UserAccountService.unlockAccount(userAccountId);
  if (success) {
    const notificationContent =
      "Tài khoản của bạn đã được mở khóa tính năng đặt hàng";
    const pushNotificationResult = await NotificationService.addNotification({
      content: notificationContent,
      userAccountId,
    });
    if (pushNotificationResult) {
      const socketIO = getSocketIO();
      socketIO.to(userAccountId).emit("newNotification");
    }
    res.json("Unlocked user successful");
  } else {
    res.status(400).json("Unlocked user failure");
  }
}

export async function getAllRatings(req: AdminRequest, res: Response) {
  const options: RatingService.GetRatingOptions = {};
  const filters: RatingService.RatingFilters = {};

  if (req.query["sort"]) {
    const sortType = String(req.query["sort"] || "") as RatingService.SortType;
    if (RatingService.SORT_TYPES.includes(sortType)) {
      options.sort = sortType;
    }
  }

  if (req.query["status"]) {
    const status = String(req.query["status"]) as RatingService.RatingStatus;
    filters.status = status;
  }

  if (req.query["star"]) {
    const star = Number(req.query["star"]);
    if (Number.isSafeInteger(star)) {
      filters.star = star;
    }
  }

  if (req.query["q"]) {
    filters.searchString = String(req.query["q"]);
  }

  if (req.query["page"]) {
    const page = Number(req.query["page"]);
    if (Number.isSafeInteger(page) && page > 0) {
      options.limit = {
        amount: ITEM_COUNT_PER_PAGE,
        offset: ITEM_COUNT_PER_PAGE * (page - 1),
      };
    }
  }

  const ratings = await RatingService.getAllRatings(options, filters);
  res.json({
    hasNextPage: ratings.length === ITEM_COUNT_PER_PAGE,
    data: ratings,
  });
}

export async function lockRating(req: AdminRequest, res: Response) {
  const userAccountId = req.params["userAccountId"];
  const productId = req.params["productId"];
  const success = await RatingService.lockRating(userAccountId, productId);
  if (success) {
    res.json("Locked user successful");
  } else {
    res.status(400).json("Locked user failure");
  }
}

export async function unlockRating(req: AdminRequest, res: Response) {
  const userAccountId = req.params["userAccountId"];
  const productId = req.params["productId"];
  const success = await RatingService.unlockRating(userAccountId, productId);
  if (success) {
    res.json("Unlocked user successful");
  } else {
    res.status(400).json("Unlocked user failure");
  }
}

export async function getAllOrders(req: Request, res: Response) {
  const options: OrderService.GetOrderOptions = {};
  const filters: OrderService.OrderFilters = {};

  if (req.query["sort"]) {
    const sortType = String(req.query["sort"] || "") as OrderService.SortType;
    if (OrderService.SORT_TYPES.includes(sortType)) {
      options.sort = sortType;
    }
  }

  if (req.query["createdFrom"]) {
    const createdFrom = new Date(String(req.query["createdFrom"]));
    if (!isNaN(createdFrom.getTime())) {
      filters.createdFrom = createdFrom;
    }
  }

  if (req.query["createdTo"]) {
    const createdTo = new Date(String(req.query["createdTo"]));
    if (!isNaN(createdTo.getTime())) {
      filters.createdTo = createdTo;
    }
  }

  if (req.query["status"]) {
    filters.status = String(req.query["status"]);
  }

  if (req.query["q"]) {
    filters.searchString = String(req.query["q"]);
  }

  if (req.query["page"]) {
    const page = Number(req.query["page"]);
    if (Number.isSafeInteger(page) && page > 0) {
      options.limit = {
        amount: ITEM_COUNT_PER_PAGE,
        offset: ITEM_COUNT_PER_PAGE * (page - 1),
      };
    }
  }

  const orders = await OrderService.getAllOrders(options, filters);

  res.json({
    hasNextPage: orders.length === ITEM_COUNT_PER_PAGE,
    data: orders,
  });
}
