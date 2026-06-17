const bookRepository = require("../repositories/bookRepository");
const borrowRequestRepository = require("../repositories/borrowRequestRepository");
const extensionRequestRepository = require("../repositories/extensionRequestRepository");
const transactionRepository = require("../repositories/transactionRepository");
const { withTransaction } = require("../config/connection");
const { AppError } = require("../middleware");
const { enrichTransaction } = require("../utils/fineUtils");

const LOAN_DAYS = 14;

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

async function submitBorrowRequest(userId, bookId) {
  if (!bookId) throw new AppError("book_id is required", 400);

  const book = await bookRepository.findById(bookId);
  if (!book) throw new AppError("Book not found", 404);
  if (book.qty < 1) throw new AppError("No copies available", 400);

  const pending = await borrowRequestRepository.findPendingByUserAndBook(
    userId,
    bookId,
  );
  if (pending) {
    throw new AppError("You already have a pending request for this book", 400);
  }

  const id = await borrowRequestRepository.create({ userId, bookId });
  return borrowRequestRepository.findById(id);
}

async function getMyBorrowRequests(userId) {
  return borrowRequestRepository.findByUserId(userId);
}

async function listBorrowRequests(status) {
  return borrowRequestRepository.findAll({ status });
}

async function reviewBorrowRequest(id, adminId, { action, adminNote }) {
  if (!["approve", "reject"].includes(action)) {
    throw new AppError("action must be approve or reject", 400);
  }

  const request = await borrowRequestRepository.findById(id);
  if (!request) throw new AppError("Request not found", 404);
  if (request.status !== "pending") {
    throw new AppError("Request has already been reviewed", 400);
  }

  if (action === "reject") {
    await borrowRequestRepository.review(id, {
      status: "rejected",
      adminNote,
      reviewedBy: adminId,
    });
    return borrowRequestRepository.findById(id);
  }

  const book = await bookRepository.findById(request.book_id);
  if (!book || book.qty < 1) {
    throw new AppError("No copies available", 400);
  }

  const borrowDate = new Date().toISOString().split("T")[0];
  const dueDate = addDays(borrowDate, LOAN_DAYS);

  return withTransaction(async (client) => {
    const borrowId = await transactionRepository.create(
      {
        book_id: request.book_id,
        user_id: request.user_id,
        borrow_date: borrowDate,
        due_date: dueDate,
        status: "borrowed",
        daily_fine_amount: 1,
      },
      client,
    );
    await bookRepository.decrementQty(request.book_id, client);
    await borrowRequestRepository.review(
      id,
      {
        status: "approved",
        adminNote,
        reviewedBy: adminId,
        borrowId,
      },
      client,
    );
    return borrowRequestRepository.findById(id);
  });
}

async function submitExtensionRequest(userId, { borrowId, requestedDueDate, reason }) {
  if (!borrowId || !requestedDueDate) {
    throw new AppError("borrowId and requestedDueDate are required", 400);
  }

  const borrow = await transactionRepository.findById(borrowId);
  if (!borrow) throw new AppError("Borrow record not found", 404);
  if (borrow.user_id !== userId) {
    throw new AppError("Access denied", 403);
  }
  if (borrow.status === "returned") {
    throw new AppError("Cannot extend a returned loan", 400);
  }
  if (new Date(requestedDueDate) <= new Date(borrow.due_date)) {
    throw new AppError("New due date must be after current due date", 400);
  }

  const pending = await extensionRequestRepository.findPendingByBorrowId(borrowId);
  if (pending) {
    throw new AppError("A pending extension request already exists", 400);
  }

  const id = await extensionRequestRepository.create({
    borrowId,
    userId,
    currentDueDate: borrow.due_date,
    requestedDueDate,
    reason,
  });
  return extensionRequestRepository.findById(id);
}

async function getMyExtensionRequests(userId) {
  return extensionRequestRepository.findByUserId(userId);
}

async function listExtensionRequests(status) {
  return extensionRequestRepository.findAll({ status });
}

async function reviewExtensionRequest(id, adminId, { action, adminNote }) {
  if (!["approve", "reject"].includes(action)) {
    throw new AppError("action must be approve or reject", 400);
  }

  const request = await extensionRequestRepository.findById(id);
  if (!request) throw new AppError("Request not found", 404);
  if (request.status !== "pending") {
    throw new AppError("Request has already been reviewed", 400);
  }

  if (action === "reject") {
    await extensionRequestRepository.review(id, {
      status: "rejected",
      adminNote,
      reviewedBy: adminId,
    });
    return extensionRequestRepository.findById(id);
  }

  const borrow = await transactionRepository.findById(request.borrow_id);
  if (!borrow) throw new AppError("Borrow record not found", 404);

  await transactionRepository.update(request.borrow_id, {
    borrow_date: borrow.borrow_date,
    due_date: request.requested_due_date,
    daily_fine_amount: borrow.daily_fine_amount,
  });

  await extensionRequestRepository.review(id, {
    status: "approved",
    adminNote,
    reviewedBy: adminId,
  });
  return extensionRequestRepository.findById(id);
}

async function getMyBorrows(userId) {
  const rows = await transactionRepository.findByUserId(userId);
  return rows.map((row) => enrichTransaction(row));
}

module.exports = {
  submitBorrowRequest,
  getMyBorrowRequests,
  listBorrowRequests,
  reviewBorrowRequest,
  submitExtensionRequest,
  getMyExtensionRequests,
  listExtensionRequests,
  reviewExtensionRequest,
  getMyBorrows,
};
