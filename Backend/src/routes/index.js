const express = require("express");
const { asyncHandler } = require("../middleware");
const { authenticate, authorize } = require("../middleware/auth");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const requestController = require("../controllers/requestController");
const healthController = require("../controllers/healthController");
const bookController = require("../controllers/bookController");
const transactionController = require("../controllers/transactionController");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get("/health", healthController.healthCheck);

router.post("/auth/login", asyncHandler(authController.login));
router.get("/auth/me", authenticate, asyncHandler(authController.me));
router.post(
  "/auth/change-password",
  authenticate,
  asyncHandler(authController.changePassword),
);

const admin = [authenticate, authorize("admin")];
const standardUser = [authenticate, authorize("teacher", "student")];
const anyUser = [authenticate, authorize("admin", "teacher", "student")];

router.get("/admin/users/next/:role", ...admin, asyncHandler(userController.nextCode));
router.get("/admin/users", ...admin, asyncHandler(userController.listUsers));
router.post("/admin/users", ...admin, asyncHandler(userController.createUser));
router.put("/admin/users/:id", ...admin, asyncHandler(userController.updateUser));
router.delete("/admin/users/:id", ...admin, asyncHandler(userController.deleteUser));

router.put("/profile", ...standardUser, asyncHandler(userController.updateProfile));

router.post("/borrow-requests", ...standardUser, asyncHandler(requestController.submitBorrowRequest));
router.get("/borrow-requests/mine", ...standardUser, asyncHandler(requestController.myBorrowRequests));
router.get("/admin/borrow-requests", ...admin, asyncHandler(requestController.listBorrowRequests));
router.patch(
  "/admin/borrow-requests/:id",
  ...admin,
  asyncHandler(requestController.reviewBorrowRequest),
);

router.post("/extension-requests", ...standardUser, asyncHandler(requestController.submitExtensionRequest));
router.get("/extension-requests/mine", ...standardUser, asyncHandler(requestController.myExtensionRequests));
router.get("/admin/extension-requests", ...admin, asyncHandler(requestController.listExtensionRequests));
router.patch(
  "/admin/extension-requests/:id",
  ...admin,
  asyncHandler(requestController.reviewExtensionRequest),
);

router.get("/borrows/mine", ...standardUser, asyncHandler(requestController.myBorrows));

router.get("/books", ...anyUser, asyncHandler(bookController.listBooks));
router.get("/books/:id", ...anyUser, asyncHandler(bookController.getBook));
router.post("/books", ...admin, asyncHandler(bookController.createBook));
router.put("/books/:id", ...admin, asyncHandler(bookController.updateBook));
router.delete("/books/:id", ...admin, asyncHandler(bookController.deleteBook));

router.get("/transactions", ...admin, asyncHandler(transactionController.listTransactions));
router.post("/transactions/borrow", ...admin, asyncHandler(transactionController.borrowBook));
router.post("/transactions/:id/pay", ...admin, asyncHandler(transactionController.recordPayment));
router.post("/transactions/:id/return", ...admin, asyncHandler(transactionController.returnBook));
router.put("/transactions/:id", ...admin, asyncHandler(transactionController.updateTransaction));
router.delete("/transactions/:id", ...admin, asyncHandler(transactionController.deleteTransaction));

router.get("/dashboard/stats", ...admin, asyncHandler(dashboardController.getStats));

module.exports = router;
