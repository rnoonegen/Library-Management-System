const express = require("express");
const { asyncHandler } = require("../middleware");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { loginSchema, changePasswordSchema } = require("../schemas/authSchemas");
const {
  idParamSchema,
  roleParamSchema,
  paginationQuerySchema,
  transactionQuerySchema,
} = require("../schemas/commonSchemas");
const {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
} = require("../schemas/userSchemas");
const {
  submitBorrowRequestSchema,
  submitExtensionRequestSchema,
  reviewBorrowRequestSchema,
  reviewExtensionRequestSchema,
} = require("../schemas/requestSchemas");
const { createBookSchema, updateBookSchema, bookQuerySchema, bookTypeCountQuerySchema } = require("../schemas/bookSchemas");
const {
  submitPurchaseOrderSchema,
  reviewPurchaseOrderSchema,
} = require("../schemas/purchaseOrderSchemas");
const {
  borrowBookSchema,
  updateTransactionSchema,
} = require("../schemas/transactionSchemas");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const requestController = require("../controllers/requestController");
const notificationController = require("../controllers/notificationController");
const healthController = require("../controllers/healthController");
const bookController = require("../controllers/bookController");
const transactionController = require("../controllers/transactionController");
const dashboardController = require("../controllers/dashboardController");
const purchaseOrderController = require("../controllers/purchaseOrderController");

const router = express.Router();

router.get("/health", healthController.healthCheck);

router.post(
  "/auth/login",
  validate(loginSchema),
  asyncHandler(authController.login),
);
router.post("/auth/refresh", asyncHandler(authController.refresh));
router.post("/auth/logout", asyncHandler(authController.logout));
router.get("/auth/me", authenticate, asyncHandler(authController.me));
router.post(
  "/auth/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
);

const admin = [authenticate, authorize("admin")];
const standardUser = [authenticate, authorize("teacher", "student")];
const anyUser = [authenticate, authorize("admin", "teacher", "student")];

router.get(
  "/admin/users/lookup",
  ...admin,
  asyncHandler(userController.listActiveUsers),
);
router.get(
  "/admin/users/next/:role",
  ...admin,
  validate(roleParamSchema),
  asyncHandler(userController.nextCode),
);
router.get(
  "/admin/users",
  ...admin,
  validate(paginationQuerySchema),
  asyncHandler(userController.listUsers),
);
router.get(
  "/admin/users/:id/borrows",
  ...admin,
  validate(idParamSchema),
  asyncHandler(userController.getUserBorrows),
);
router.post(
  "/admin/users",
  ...admin,
  validate(createUserSchema),
  asyncHandler(userController.createUser),
);
router.put(
  "/admin/users/:id",
  ...admin,
  validate(idParamSchema),
  validate(updateUserSchema),
  asyncHandler(userController.updateUser),
);
router.delete(
  "/admin/users/:id",
  ...admin,
  validate(idParamSchema),
  asyncHandler(userController.deleteUser),
);

router.put(
  "/profile",
  ...standardUser,
  validate(updateProfileSchema),
  asyncHandler(userController.updateProfile),
);

router.post(
  "/borrow-requests",
  ...standardUser,
  validate(submitBorrowRequestSchema),
  asyncHandler(requestController.submitBorrowRequest),
);
router.get(
  "/borrow-requests/mine",
  ...standardUser,
  asyncHandler(requestController.myBorrowRequests),
);
router.delete(
  "/borrow-requests/:id",
  ...standardUser,
  validate(idParamSchema),
  asyncHandler(requestController.cancelBorrowRequest),
);
router.get(
  "/admin/borrow-requests/summary",
  ...admin,
  asyncHandler(requestController.holdQueueSummary),
);
router.get(
  "/admin/borrow-requests",
  ...admin,
  validate(paginationQuerySchema),
  asyncHandler(requestController.listBorrowRequests),
);
router.patch(
  "/admin/borrow-requests/:id",
  ...admin,
  validate(idParamSchema),
  validate(reviewBorrowRequestSchema),
  asyncHandler(requestController.reviewBorrowRequest),
);

router.get("/notifications", ...anyUser, asyncHandler(notificationController.listMine));
router.get(
  "/notifications/unread-count",
  ...anyUser,
  asyncHandler(notificationController.unreadCount),
);
router.patch(
  "/notifications/read-all",
  ...anyUser,
  asyncHandler(notificationController.markAllRead),
);
router.patch(
  "/notifications/:id/read",
  ...anyUser,
  validate(idParamSchema),
  asyncHandler(notificationController.markRead),
);

router.post(
  "/extension-requests",
  ...standardUser,
  validate(submitExtensionRequestSchema),
  asyncHandler(requestController.submitExtensionRequest),
);
router.get(
  "/extension-requests/mine",
  ...standardUser,
  asyncHandler(requestController.myExtensionRequests),
);
router.get(
  "/admin/extension-requests",
  ...admin,
  validate(paginationQuerySchema),
  asyncHandler(requestController.listExtensionRequests),
);
router.patch(
  "/admin/extension-requests/:id",
  ...admin,
  validate(idParamSchema),
  validate(reviewExtensionRequestSchema),
  asyncHandler(requestController.reviewExtensionRequest),
);

router.get("/borrows/mine", ...standardUser, asyncHandler(requestController.myBorrows));

router.post(
  "/purchase-orders",
  ...standardUser,
  validate(submitPurchaseOrderSchema),
  asyncHandler(purchaseOrderController.submitPurchaseOrder),
);
router.get(
  "/purchase-orders/mine",
  ...standardUser,
  asyncHandler(purchaseOrderController.myPurchaseOrders),
);
router.delete(
  "/purchase-orders/:id",
  ...standardUser,
  validate(idParamSchema),
  asyncHandler(purchaseOrderController.cancelPurchaseOrder),
);
router.get(
  "/admin/purchase-orders",
  ...admin,
  validate(paginationQuerySchema),
  asyncHandler(purchaseOrderController.listPurchaseOrders),
);
router.patch(
  "/admin/purchase-orders/:id",
  ...admin,
  validate(idParamSchema),
  validate(reviewPurchaseOrderSchema),
  asyncHandler(purchaseOrderController.reviewPurchaseOrder),
);

router.get(
  "/books/available",
  ...anyUser,
  asyncHandler(bookController.listAvailableBooks),
);
router.get(
  "/books/type-counts",
  ...anyUser,
  validate(bookTypeCountQuerySchema),
  asyncHandler(bookController.listBookTypeCounts),
);
router.get(
  "/books",
  ...anyUser,
  validate(bookQuerySchema),
  asyncHandler(bookController.listBooks),
);
router.get(
  "/books/:id",
  ...anyUser,
  validate(idParamSchema),
  asyncHandler(bookController.getBook),
);
router.post(
  "/books",
  ...admin,
  validate(createBookSchema),
  asyncHandler(bookController.createBook),
);
router.put(
  "/books/:id",
  ...admin,
  validate(updateBookSchema),
  asyncHandler(bookController.updateBook),
);
router.delete(
  "/books/:id",
  ...admin,
  validate(idParamSchema),
  asyncHandler(bookController.deleteBook),
);

router.get(
  "/transactions",
  ...admin,
  validate(transactionQuerySchema),
  asyncHandler(transactionController.listTransactions),
);
router.post(
  "/transactions/borrow",
  ...admin,
  validate(borrowBookSchema),
  asyncHandler(transactionController.borrowBook),
);
router.post(
  "/transactions/:id/pay",
  ...admin,
  validate(idParamSchema),
  asyncHandler(transactionController.recordPayment),
);
router.post(
  "/transactions/:id/return",
  ...admin,
  validate(idParamSchema),
  asyncHandler(transactionController.returnBook),
);
router.put(
  "/transactions/:id",
  ...admin,
  validate(updateTransactionSchema),
  asyncHandler(transactionController.updateTransaction),
);
router.delete(
  "/transactions/:id",
  ...admin,
  validate(idParamSchema),
  asyncHandler(transactionController.deleteTransaction),
);

router.get("/dashboard/stats", ...admin, asyncHandler(dashboardController.getStats));

module.exports = router;
