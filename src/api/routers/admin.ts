import { Router } from "express";
import * as AdminController from "../controllers/admin.js";
import { extractFormData } from "../middlewares/formDataExtract.js";
import { preventFirstLogin } from "../middlewares/requiredChangePassword.js";
import AdminValidate from "../validations/admin.js";

const router = Router();

router.get("/information", AdminController.getInformation);

router.post("/good-receipt", AdminController.createGoodReceipt);

router.get("/good-receipt", AdminController.getAllGoodReceipts);

router.get("/good-receipt/:goodReceiptId", AdminController.getGoodReceipt);

router.put("/good-receipt/:goodReceiptId", AdminController.updateGoodReceipt);

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
  preventFirstLogin,
  AdminValidate.addCategory,
  AdminController.addCategory
);
router.put(
  "/category/:categoryId",
  preventFirstLogin,
  AdminValidate.updateCategory,
  AdminController.updateCategory
);
router.delete(
  "/category/:categoryId",
  preventFirstLogin,
  AdminController.deleteCategory
);

router.post(
  "/product-size",
  preventFirstLogin,
  AdminValidate.addProductSize,
  AdminController.addProductSize
);
router.put(
  "/product-size/:productSizeId",
  preventFirstLogin,
  AdminValidate.updateProductSize,
  AdminController.updateProductSize
);
router.delete(
  "/product-size/:productSizeId",
  preventFirstLogin,
  AdminController.deleteProductSize
);

router.post(
  "/product",
  preventFirstLogin,
  extractFormData,
  AdminValidate.addProduct,
  AdminController.addProduct
);
router.put(
  "/product/:productId",
  preventFirstLogin,
  extractFormData,
  AdminValidate.updateProduct,
  AdminController.updateProduct
);
router.delete(
  "/product/:productId",
  preventFirstLogin,
  AdminController.deleteProduct
);

router.post(
  "/branch/",
  preventFirstLogin,
  AdminValidate.addBranch,
  AdminController.addBranch
);
router.put(
  "/branch/:branchId",
  preventFirstLogin,
  AdminValidate.updateBranch,
  AdminController.updateBranch
);
router.delete(
  "/branch/:branchId",
  preventFirstLogin,
  AdminController.deleteBranch
);

router.get(
  "/staff-account",
  preventFirstLogin,
  AdminController.getStaffAccounts
);
router.post(
  "/staff-account",
  preventFirstLogin,
  extractFormData,
  AdminValidate.addStaffAccount,
  AdminController.addStaffAccount
);
router.patch(
  "/staff-account/:staffAccountId/reset-password/",
  preventFirstLogin,
  AdminController.resetStaffAccountPassword
);
router.patch(
  "/staff-account/:staffAccountId/branch/",
  preventFirstLogin,
  AdminController.updateBranchForStaff
);
router.delete(
  "/staff-account/:staffAccountId",
  preventFirstLogin,
  AdminController.deleteStaffAccount
);

router.post(
  "/news",
  preventFirstLogin,
  extractFormData,
  AdminValidate.addNews,
  AdminController.addNews
);
router.put(
  "/news/:newsId",
  preventFirstLogin,
  extractFormData,
  AdminValidate.updateNews,
  AdminController.updateNews
);
router.delete("/news/:newsId", preventFirstLogin, AdminController.deleteNews);

router.post(
  "/coupon",
  preventFirstLogin,
  AdminValidate.addCoupon,
  AdminController.addCoupon
);
router.put(
  "/coupon/:couponCode",
  preventFirstLogin,
  AdminValidate.updateCoupon,
  AdminController.updateCoupon
);
router.delete(
  "/coupon/:couponCode",
  preventFirstLogin,
  AdminController.deleteCoupon
);

router.post(
  "/promotion",
  preventFirstLogin,
  extractFormData,
  AdminValidate.addPromotion,
  AdminController.addPromotion
);
router.put(
  "/promotion/:promotionId",
  preventFirstLogin,
  extractFormData,
  AdminValidate.updatePromotion,
  AdminController.updatePromotion
);
router.delete(
  "/promotion/:promotionId",
  preventFirstLogin,
  AdminController.deletePromotion
);

router.post(
  "/banner",
  preventFirstLogin,
  extractFormData,
  AdminValidate.addBanner,
  AdminController.addBanner
);
router.put(
  "/banner/:bannerId",
  preventFirstLogin,
  extractFormData,
  AdminController.updateBanner,
  AdminController.updateBanner
);
router.delete(
  "/banner/:bannerId",
  preventFirstLogin,
  AdminController.deleteBanner
);

router.get("/user-account", preventFirstLogin, AdminController.getUserAccounts);
router.patch(
  "/user-account/:userAccountId/lock",
  preventFirstLogin,
  AdminController.lockUserAccount
);
router.patch(
  "/user-account/:userAccountId/unlock",
  preventFirstLogin,
  AdminController.unlockUserAccount
);

router.get("/rating", preventFirstLogin, AdminController.getAllRatings);
router.patch(
  "/rating/:userAccountId/:productId/lock",
  preventFirstLogin,
  AdminController.lockRating
);
router.patch(
  "/rating/:userAccountId/:productId/unlock",
  preventFirstLogin,
  AdminController.unlockRating
);

export default router;
