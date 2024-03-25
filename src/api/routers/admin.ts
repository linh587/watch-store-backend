import { Router } from "express";
import * as AdminController from "../controllers/admin.js";
import { validateStoreAdminPermision } from "../middlewares/authorization.js";
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
  validateStoreAdminPermision,
  AdminValidate.addCategory,
  AdminController.addCategory
);
router.put(
  "/category/:categoryId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminValidate.updateCategory,
  AdminController.updateCategory
);
router.delete(
  "/category/:categoryId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deleteCategory
);

router.post(
  "/product-size",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminValidate.addProductSize,
  AdminController.addProductSize
);
router.put(
  "/product-size/:productSizeId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminValidate.updateProductSize,
  AdminController.updateProductSize
);
router.delete(
  "/product-size/:productSizeId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deleteProductSize
);

router.post(
  "/product",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminValidate.addProduct,
  AdminController.addProduct
);
router.put(
  "/product/:productId",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminValidate.updateProduct,
  AdminController.updateProduct
);
router.delete(
  "/product/:productId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deleteProduct
);

router.post(
  "/branch/",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminValidate.addBranch,
  AdminController.addBranch
);
router.put(
  "/branch/:branchId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminValidate.updateBranch,
  AdminController.updateBranch
);
router.delete(
  "/branch/:branchId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deleteBranch
);

router.get(
  "/staff-account",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.getStaffAccounts
);
router.post(
  "/staff-account",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminValidate.addStaffAccount,
  AdminController.addStaffAccount
);
router.patch(
  "/staff-account/:staffAccountId/reset-password/",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.resetStaffAccountPassword
);
router.patch(
  "/staff-account/:staffAccountId/branch/",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.updateBranchForStaff
);
router.delete(
  "/staff-account/:staffAccountId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deleteStaffAccount
);

router.post(
  "/news",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminValidate.addNews,
  AdminController.addNews
);
router.put(
  "/news/:newsId",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminValidate.updateNews,
  AdminController.updateNews
);
router.delete(
  "/news/:newsId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deleteNews
);

router.post(
  "/coupon",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminValidate.addCoupon,
  AdminController.addCoupon
);
router.put(
  "/coupon/:couponCode",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminValidate.updateCoupon,
  AdminController.updateCoupon
);
router.delete(
  "/coupon/:couponCode",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deleteCoupon
);

router.post(
  "/promotion",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminValidate.addPromotion,
  AdminController.addPromotion
);
router.put(
  "/promotion/:promotionId",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminValidate.updatePromotion,
  AdminController.updatePromotion
);
router.delete(
  "/promotion/:promotionId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deletePromotion
);

router.post(
  "/banner",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminValidate.addBanner,
  AdminController.addBanner
);
router.put(
  "/banner/:bannerId",
  preventFirstLogin,
  validateStoreAdminPermision,
  extractFormData,
  AdminController.updateBanner,
  AdminController.updateBanner
);
router.delete(
  "/banner/:bannerId",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.deleteBanner
);

router.get(
  "/user-account",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.getUserAccounts
);
router.patch(
  "/user-account/:userAccountId/lock",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.lockUserAccount
);
router.patch(
  "/user-account/:userAccountId/unlock",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.unlockUserAccount
);

router.get(
  "/rating",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.getAllRatings
);
router.patch(
  "/rating/:userAccountId/:productId/lock",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.lockRating
);
router.patch(
  "/rating/:userAccountId/:productId/unlock",
  preventFirstLogin,
  validateStoreAdminPermision,
  AdminController.unlockRating
);

export default router;
