const express = require("express");
const { asyncHandler } = require("../middleware");
const healthController = require("../controllers/healthController");
const bookController = require("../controllers/bookController");
const memberController = require("../controllers/memberController");
const transactionController = require("../controllers/transactionController");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get("/health", healthController.healthCheck);

router.get("/books", asyncHandler(bookController.listBooks));
router.get("/books/:id", asyncHandler(bookController.getBook));
router.post("/books", asyncHandler(bookController.createBook));
router.put("/books/:id", asyncHandler(bookController.updateBook));
router.delete("/books/:id", asyncHandler(bookController.deleteBook));

router.get("/members", asyncHandler(memberController.listMembers));
router.get("/members/:id", asyncHandler(memberController.getMember));
router.post("/members", asyncHandler(memberController.createMember));
router.put("/members/:id", asyncHandler(memberController.updateMember));
router.delete("/members/:id", asyncHandler(memberController.deleteMember));

router.get(
  "/transactions",
  asyncHandler(transactionController.listTransactions),
);
router.post(
  "/transactions/borrow",
  asyncHandler(transactionController.borrowBook),
);
router.post(
  "/transactions/:id/pay",
  asyncHandler(transactionController.recordPayment),
);
router.post(
  "/transactions/:id/return",
  asyncHandler(transactionController.returnBook),
);
router.put(
  "/transactions/:id",
  asyncHandler(transactionController.updateTransaction),
);
router.delete(
  "/transactions/:id",
  asyncHandler(transactionController.deleteTransaction),
);

router.get("/dashboard/stats", asyncHandler(dashboardController.getStats));

module.exports = router;
