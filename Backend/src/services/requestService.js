const bookRepository = require("../repositories/bookRepository");
const borrowRequestRepository = require("../repositories/borrowRequestRepository");
const extensionRequestRepository = require("../repositories/extensionRequestRepository");
const transactionRepository = require("../repositories/transactionRepository");
const userRepository = require("../repositories/userRepository");
const notificationService = require("./notificationService");
const holdQueueService = require("./holdQueueService");
const { withTransaction } = require("../config/connection");
const { AppError } = require("../middleware");
const {
  enrichTransaction,
  isOverdue,
  getTodayDateOnly,
  formatDateOnly,
  addDays,
} = require("../utils/fineUtils");
const {
  MAX_ACTIVE_BORROWS,
  LOAN_DAYS,
  MAX_EXTENSIONS_PER_MONTH,
} = require("../constants/libraryRules");

async function ensureHoldQueuesSynced() {
  await holdQueueService.syncHoldQueues();
}

async function submitBorrowRequest(userId, bookId) {
  if (!bookId) throw new AppError("book_id is required", 400);

  await ensureHoldQueuesSynced();

  const activeCount = await transactionRepository.countActiveByUserId(userId);
  if (activeCount >= MAX_ACTIVE_BORROWS) {
    throw new AppError(
      `You already have the maximum of ${MAX_ACTIVE_BORROWS} active books`,
      400,
    );
  }

  const book = await bookRepository.findById(bookId);
  if (!book) throw new AppError("Book not found", 404);
  if (book.qty > 0) {
    throw new AppError("Book is available — visit the library to borrow it", 400);
  }

  const activeBorrow = await transactionRepository.findActiveBorrowByUserAndBook(
    userId,
    bookId,
  );
  if (activeBorrow) {
    throw new AppError("You already have this book borrowed", 400);
  }

  const existing = await borrowRequestRepository.findActiveByUserAndBook(userId, bookId);
  if (existing) {
    throw new AppError("You are already on the waitlist for this book", 400);
  }

  let id;
  try {
    id = await borrowRequestRepository.create({ userId, bookId });
  } catch (err) {
    if (err.code === "23505") {
      throw new AppError("You are already on the waitlist for this book", 400);
    }
    throw err;
  }

  const queuePosition = await borrowRequestRepository.countPendingHoldsByBook(bookId);
  const user = await userRepository.findById(userId);

  await notificationService.createNotification({
    userId,
    type: "hold_queued",
    title: "Added to waitlist",
    message: `You are #${queuePosition} in queue for "${book.title}".`,
    relatedId: id,
  });

  await notificationService.notifyAdmins({
    type: "admin_hold_request",
    title: "New waitlist entry",
    message: `${user?.name || "A user"} joined the waitlist for "${book.title}" (queue #${queuePosition}).`,
    relatedId: id,
  });

  return borrowRequestRepository.findById(id);
}

async function cancelBorrowRequest(userId, requestId) {
  const request = await borrowRequestRepository.findById(requestId);
  if (!request) throw new AppError("Request not found", 404);
  if (request.user_id !== userId) throw new AppError("Access denied", 403);
  if (request.status !== "pending") {
    throw new AppError("Only pending holds can be cancelled", 400);
  }

  await borrowRequestRepository.updateStatus(requestId, "cancelled");
  return borrowRequestRepository.findById(requestId);
}

async function getMyBorrowRequests(userId) {
  return borrowRequestRepository.findByUserId(userId);
}

async function listBorrowRequests(query = {}) {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const status = query.status || "active";
  const { requests, total } = await borrowRequestRepository.findPaginated(
    pageNum,
    limitNum,
    { status },
  );
  return {
    requests,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
  };
}

async function getHoldQueueSummary() {
  return borrowRequestRepository.findQueueSummary();
}

async function reviewBorrowRequest(id, adminId, { action, adminNote }) {
  if (!["fulfill", "cancel"].includes(action)) {
    throw new AppError("action must be fulfill or cancel", 400);
  }

  await ensureHoldQueuesSynced();

  const request = await borrowRequestRepository.findById(id);
  if (!request) throw new AppError("Request not found", 404);

  if (action === "cancel") {
    if (!["pending", "ready"].includes(request.status)) {
      throw new AppError("Only pending or ready holds can be cancelled", 400);
    }

    return withTransaction(async (client) => {
      if (request.status === "ready") {
        await bookRepository.incrementQty(request.book_id, client);
      }
      await borrowRequestRepository.updateStatus(
        id,
        "cancelled",
        { adminNote, reviewedBy: adminId },
        client,
      );
      await notificationService.createNotification(
        {
          userId: request.user_id,
          type: "hold_cancelled",
          title: "Hold cancelled",
          message: `Your hold on "${request.book_title}" was cancelled. Join the waitlist again if you still need this book.`,
          relatedId: id,
        },
        client,
      );
      if (request.status === "ready") {
        await holdQueueService.promoteNextHold(request.book_id, client);
      }
      return borrowRequestRepository.findById(id, client);
    });
  }

  if (request.status !== "ready") {
    throw new AppError("Only ready holds can be marked as collected", 400);
  }

  const alreadyBorrowed = await transactionRepository.findActiveBorrowByUserAndBook(
    request.user_id,
    request.book_id,
  );
  if (alreadyBorrowed) {
    throw new AppError("User already has this book borrowed", 400);
  }

  const activeCount = await transactionRepository.countActiveByUserId(request.user_id);
  if (activeCount >= MAX_ACTIVE_BORROWS) {
    throw new AppError(
      `User already has ${MAX_ACTIVE_BORROWS} active books`,
      400,
    );
  }

  const borrowDate = getTodayDateOnly();
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

    await borrowRequestRepository.updateStatus(
      id,
      "fulfilled",
      { adminNote, reviewedBy: adminId, borrowId },
      client,
    );

    await notificationService.createNotification(
      {
        userId: request.user_id,
        type: "hold_fulfilled",
        title: "Book issued",
        message: `"${request.book_title}" issued. Due date: ${dueDate}.`,
        relatedId: borrowId,
      },
      client,
    );

    return borrowRequestRepository.findById(id, client);
  });
}

async function submitExtensionRequest(userId, { borrowId, reason }) {
  if (!borrowId) {
    throw new AppError("borrowId is required", 400);
  }

  const borrow = await transactionRepository.findById(borrowId);
  if (!borrow) throw new AppError("Borrow record not found", 404);
  if (borrow.user_id !== userId) throw new AppError("Access denied", 403);
  if (borrow.status === "returned") {
    throw new AppError("Cannot extend a returned loan", 400);
  }

  const today = getTodayDateOnly();
  if (isOverdue(borrow.due_date, today)) {
    throw new AppError("Cannot extend an overdue loan — fines apply", 400);
  }

  const holdsOnBook = await borrowRequestRepository.countActiveHoldsByBook(borrow.book_id);
  if (holdsOnBook > 0) {
    throw new AppError("Cannot extend — another user is waiting for this book", 400);
  }

  const pendingForUser = await extensionRequestRepository.findPendingByUserId(userId);
  if (pendingForUser) {
    throw new AppError("You already have a pending extension request", 400);
  }

  const pending = await extensionRequestRepository.findPendingByBorrowId(borrowId);
  if (pending) throw new AppError("A pending extension request already exists", 400);

  const now = new Date();
  const approvedThisMonth = await extensionRequestRepository.countApprovedInMonth(
    userId,
    now.getFullYear(),
    now.getMonth() + 1,
  );
  if (approvedThisMonth >= MAX_EXTENSIONS_PER_MONTH) {
    throw new AppError("You have already used your one extension for this month", 400);
  }

  const currentDueDate = borrow.due_date?.split?.("T")[0] || borrow.due_date;
  const requestedDueDate = addDays(currentDueDate, LOAN_DAYS);

  const id = await extensionRequestRepository.create({
    borrowId,
    userId,
    currentDueDate: borrow.due_date,
    requestedDueDate,
    reason,
  });

  const created = await extensionRequestRepository.findById(id);
  const user = await userRepository.findById(userId);

  await notificationService.createNotification({
    userId,
    type: "extension_submitted",
    title: "Extension requested",
    message: `Your extension for "${created.book_title}" is pending admin approval (new due: ${requestedDueDate}).`,
    relatedId: id,
  });

  await notificationService.notifyAdmins({
    type: "admin_extension_request",
    title: "Extension request",
    message: `${user?.name || "A user"} requested a ${LOAN_DAYS}-day extension for "${created.book_title}" (new due: ${requestedDueDate}).`,
    relatedId: id,
  });

  return created;
}

async function getMyExtensionRequests(userId) {
  return extensionRequestRepository.findByUserId(userId);
}

async function listExtensionRequests(query = {}) {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const status = query.status || undefined;
  const { requests, total } = await extensionRequestRepository.findPaginated(
    pageNum,
    limitNum,
    { status },
  );
  return {
    requests,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
  };
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
    await notificationService.createNotification({
      userId: request.user_id,
      type: "extension_rejected",
      title: "Extension denied",
      message: `Extension for "${request.book_title}" was denied.${adminNote ? ` Note: ${adminNote}` : ""}`,
      relatedId: id,
    });
    return extensionRequestRepository.findById(id);
  }

  const borrow = await transactionRepository.findById(request.borrow_id);
  if (!borrow) throw new AppError("Borrow record not found", 404);

  const today = getTodayDateOnly();
  if (isOverdue(borrow.due_date, today)) {
    throw new AppError("Cannot approve extension for an overdue loan", 400);
  }

  const holdsOnBook = await borrowRequestRepository.countActiveHoldsByBook(borrow.book_id);
  if (holdsOnBook > 0) {
    throw new AppError("Cannot approve extension — holds exist for this book", 400);
  }

  const now = new Date();
  const approvedThisMonth = await extensionRequestRepository.countApprovedInMonth(
    request.user_id,
    now.getFullYear(),
    now.getMonth() + 1,
  );
  if (approvedThisMonth >= MAX_EXTENSIONS_PER_MONTH) {
    throw new AppError("User has already used their one extension for this month", 400);
  }

  const newDueDate = formatDateOnly(request.requested_due_date);

  await transactionRepository.update(request.borrow_id, {
    borrow_date: borrow.borrow_date,
    due_date: newDueDate,
    daily_fine_amount: borrow.daily_fine_amount,
  });

  await extensionRequestRepository.review(id, {
    status: "approved",
    adminNote,
    reviewedBy: adminId,
  });

  await notificationService.createNotification({
    userId: request.user_id,
    type: "extension_approved",
    title: "Extension approved",
    message: `Due date for "${request.book_title}" extended to ${newDueDate}.`,
    relatedId: id,
  });

  return extensionRequestRepository.findById(id);
}

async function getMyBorrows(userId) {
  const rows = await transactionRepository.findByUserId(userId);
  const today = getTodayDateOnly();
  const now = new Date();

  const activeBorrowCount = rows.filter((row) => row.status !== "returned").length;
  const extensionsUsedThisMonth = await extensionRequestRepository.countApprovedInMonth(
    userId,
    now.getFullYear(),
    now.getMonth() + 1,
  );
  const hasPendingExtension = !!(await extensionRequestRepository.findPendingByUserId(userId));
  const extensionQuotaUsed = extensionsUsedThisMonth >= MAX_EXTENSIONS_PER_MONTH;

  const activeRows = rows.filter((row) => row.status !== "returned");
  const holdCounts = await borrowRequestRepository.getActiveHoldCountsByBookIds(
    [...new Set(activeRows.map((row) => row.book_id))],
  );

  const borrows = rows.map((row) => {
      const enriched = enrichTransaction(row);
      const dueDateStr = row.due_date?.split?.("T")[0] || row.due_date;
      const extendedDueDate = addDays(dueDateStr, LOAN_DAYS);

      if (row.status === "returned") {
        return {
          ...enriched,
          can_extend: false,
          extend_reason: null,
          extended_due_date: extendedDueDate,
        };
      }

      let canExtend = true;
      let extendReason = null;

      if (isOverdue(row.due_date, today)) {
        canExtend = false;
        extendReason = "Overdue — pay fine at library first";
      } else if (extensionQuotaUsed) {
        canExtend = false;
        extendReason = "Monthly extension already used";
      } else if (hasPendingExtension) {
        canExtend = false;
        extendReason = "Extension request pending review";
      } else {
        const holdsOnBook = holdCounts.get(row.book_id) || 0;
        if (holdsOnBook > 0) {
          canExtend = false;
          extendReason = "Someone is waiting for this book";
        }
      }

      return {
        ...enriched,
        can_extend: canExtend,
        extend_reason: extendReason,
        extended_due_date: extendedDueDate,
      };
    });

  return {
    borrows,
    activeBorrowCount,
    atBorrowLimit: activeBorrowCount >= MAX_ACTIVE_BORROWS,
    extensionsUsedThisMonth,
    hasPendingExtension,
    extensionQuotaUsed,
  };
}

module.exports = {
  submitBorrowRequest,
  cancelBorrowRequest,
  getMyBorrowRequests,
  listBorrowRequests,
  getHoldQueueSummary,
  reviewBorrowRequest,
  submitExtensionRequest,
  getMyExtensionRequests,
  listExtensionRequests,
  reviewExtensionRequest,
  getMyBorrows,
};
