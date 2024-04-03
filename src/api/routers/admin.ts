import { Router } from "express";
import * as AdminController from "../controllers/admin.js";
import { extractFormData } from "../middlewares/formDataExtract.js";
import AdminValidate from "../validations/admin.js";

const router = Router();

router.get("/all-orders", AdminController.getAllOrders);

router.get("/information", AdminController.getInformation);

router.post("/good-receipt", AdminController.createGoodReceipt);

router.get("/good-receipt", AdminController.getAllGoodReceipts);

router.get("/good-receipt/:goodReceiptId", AdminController.getGoodReceipt);

router.put("/good-receipt/:goodReceiptId", AdminController.updateGoodReceipt);
router.delete(
  "/good-receipt/:goodReceiptId",
  AdminController.deleteGoodReceipt
);

router.post(
  "/supplier",
  AdminValidate.addSupplier,
  AdminController.addSupplier
);

router.put(
  "/supplier/:supplierId",
  AdminValidate.updateSupplier,
  AdminController.updateSupplier
);

router.delete("/supplier/:supplierId", AdminController.deleteSupplier);

router.get("/supplier", AdminController.getSuppliers);

router.get("/supplier/:id", AdminController.getSupplier);

router.put(
  "/password/",
  AdminValidate.updatePassword,
  AdminController.updatePassword
);

router.post(
  "/category",
  AdminValidate.addCategory,
  AdminController.addCategory
);
router.put(
  "/category/:categoryId",
  AdminValidate.updateCategory,
  AdminController.updateCategory
);
router.delete("/category/:categoryId", AdminController.deleteCategory);

router.post(
  "/product-size",
  AdminValidate.addProductSize,
  AdminController.addProductSize
);
router.put(
  "/product-size/:productSizeId",
  AdminValidate.updateProductSize,
  AdminController.updateProductSize
);
router.delete(
  "/product-size/:productSizeId",
  AdminController.deleteProductSize
);

router.post(
  "/product",
  extractFormData,
  AdminValidate.addProduct,
  AdminController.addProduct
);
router.put(
  "/product/:productId",
  extractFormData,
  AdminValidate.updateProduct,
  AdminController.updateProduct
);
router.delete("/product/:productId", AdminController.deleteProduct);

router.post("/branch/", AdminValidate.addBranch, AdminController.addBranch);
router.put(
  "/branch/:branchId",
  AdminValidate.updateBranch,
  AdminController.updateBranch
);
router.delete("/branch/:branchId", AdminController.deleteBranch);

router.get("/staff-account", AdminController.getStaffAccounts);
router.post(
  "/staff-account",
  extractFormData,
  AdminValidate.addStaffAccount,
  AdminController.addStaffAccount
);
router.patch(
  "/staff-account/:staffAccountId/reset-password/",
  AdminController.resetStaffAccountPassword
);
router.patch(
  "/staff-account/:staffAccountId/branch/",
  AdminController.updateBranchForStaff
);
router.delete(
  "/staff-account/:staffAccountId",
  AdminController.deleteStaffAccount
);

router.post(
  "/news",
  extractFormData,
  AdminValidate.addNews,
  AdminController.addNews
);
router.put(
  "/news/:newsId",
  extractFormData,
  AdminValidate.updateNews,
  AdminController.updateNews
);
router.delete("/news/:newsId", AdminController.deleteNews);

router.post("/coupon", AdminValidate.addCoupon, AdminController.addCoupon);
router.put(
  "/coupon/:couponCode",
  AdminValidate.updateCoupon,
  AdminController.updateCoupon
);
router.delete("/coupon/:couponCode", AdminController.deleteCoupon);

router.post(
  "/promotion",
  extractFormData,
  AdminValidate.addPromotion,
  AdminController.addPromotion
);
router.put(
  "/promotion/:promotionId",
  extractFormData,
  AdminValidate.updatePromotion,
  AdminController.updatePromotion
);
router.delete("/promotion/:promotionId", AdminController.deletePromotion);

router.post(
  "/banner",
  extractFormData,
  AdminValidate.addBanner,
  AdminController.addBanner
);
router.put(
  "/banner/:bannerId",
  extractFormData,
  AdminController.updateBanner,
  AdminController.updateBanner
);
router.delete("/banner/:bannerId", AdminController.deleteBanner);

router.get("/user-account", AdminController.getUserAccounts);
router.patch(
  "/user-account/:userAccountId/lock",
  AdminController.lockUserAccount
);
router.patch(
  "/user-account/:userAccountId/unlock",
  AdminController.unlockUserAccount
);

router.get("/rating", AdminController.getAllRatings);
router.patch(
  "/rating/:userAccountId/:productId/lock",
  AdminController.lockRating
);
router.patch(
  "/rating/:userAccountId/:productId/unlock",
  AdminController.unlockRating
);

export default router;
