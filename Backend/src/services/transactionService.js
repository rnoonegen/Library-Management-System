const bookRepository = require("../repositories/bookRepository");
const userRepository = require("../repositories/userRepository");
const transactionRepository = require("../repositories/transactionRepository");
const { withTransaction } = require("../config/connection");
const { AppError } = require("../middleware");
const {
  enrichTransaction,
  calculateAccruedFine,
  isOverdue,
  getTodayDateOnly,
} = require("../utils/fineUtils");
const holdQueueService = require("./holdQueueService");
const { MAX_ACTIVE_BORROWS } = require("../constants/libraryRules");

function parseDailyFineAmount(value) {
  const amount = parseInt(value, 10);
  if (!Number.isFinite(amount) || amount < 1 || amount > 10) {
    throw new AppError("daily_fine_amount must be between 1 and 10", 400);
  }
  return amount;
}

function mapTransaction(transaction) {
  return enrichTransaction({
    ...transaction,
    userId: transaction.user_id,
  });
}

async function getAllTransactions(query = {}) {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const { transactions, total } = await transactionRepository.findPaginated(
    pageNum,
    limitNum,
    {
      search: query.search || "",
      status: query.status || "all",
    },
  );
  const statusCounts = await transactionRepository.getStatusCounts();

  return {
    transactions: transactions.map(mapTransaction),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
    statusCounts,
  };
}

async function borrowBook({
  book_id,
  user_id,
  userId,
  borrow_date,
  due_date,
  daily_fine_amount,
}) {
  const borrowerId = user_id ?? userId;

  if (!book_id || !borrowerId || !borrow_date || !due_date) {
    throw new AppError(
      "book_id, userId, borrow_date, and due_date are required",
      400,
    );
  }

  const fineAmount = parseDailyFineAmount(daily_fine_amount ?? 1);
  const book = await bookRepository.findById(book_id);
  const user = await userRepository.findById(borrowerId);

  if (!book) throw new AppError("Book not found", 400);
  if (!user) throw new AppError("User not found", 400);
  if (user.status !== "active")
    throw new AppError("User is not active", 400);
  if (book.qty < 1) throw new AppError("No copies available", 400);

  const activeCount = await transactionRepository.countActiveByUserId(borrowerId);
  if (activeCount >= MAX_ACTIVE_BORROWS) {
    throw new AppError(
      `User already has ${MAX_ACTIVE_BORROWS} active books`,
      400,
    );
  }

  if (new Date(due_date) < new Date(borrow_date)) {
    throw new AppError("Due date cannot be before borrow date", 400);
  }

  return withTransaction(async (client) => {
    const transactionId = await transactionRepository.create(
      {
        book_id,
        user_id: borrowerId,
        borrow_date,
        due_date,
        status: "borrowed",
        daily_fine_amount: fineAmount,
      },
      client,
    );
    await bookRepository.decrementQty(book_id, client);
    const transaction = await transactionRepository.findByIdWithDetails(
      transactionId,
      client,
    );
    return mapTransaction(transaction);
  });
}

async function recordPayment(transactionId) {
  return withTransaction(async (client) => {
    const transaction = await transactionRepository.findActiveById(
      transactionId,
      client,
    );
    if (!transaction) {
      throw new AppError("Transaction not found or already returned", 400);
    }

    const today = getTodayDateOnly();
    if (!isOverdue(transaction.due_date, today)) {
      throw new AppError("Payment is only required for overdue loans", 400);
    }

    const alreadyPaid =
      transaction.payment_status === "paid" || transaction.fine_paid === true;

    if (alreadyPaid) {
      throw new AppError("Payment has already been recorded", 400);
    }

    const paidAmount = calculateAccruedFine(transaction, today);
    await transactionRepository.markPaid(
      transactionId,
      { paidAt: today, paidAmount },
      client,
    );

    const updated = await transactionRepository.findByIdWithDetails(
      transactionId,
      client,
    );
    return mapTransaction(updated);
  });
}

async function returnBook(transactionId) {
  return withTransaction(async (client) => {
    const transaction = await transactionRepository.findActiveById(
      transactionId,
      client,
    );
    if (!transaction) {
      throw new AppError("Transaction not found or already returned", 400);
    }

    const today = getTodayDateOnly();
    const overdue = isOverdue(transaction.due_date, today);

    if (
      overdue &&
      transaction.payment_status !== "paid" &&
      transaction.fine_paid !== true
    ) {
      throw new AppError(
        "Payment must be recorded before returning an overdue book",
        400,
      );
    }

    const fineAmount = overdue
      ? (transaction.paid_amount ?? calculateAccruedFine(transaction, today))
      : 0;

    await transactionRepository.markReturned(
      transactionId,
      today,
      fineAmount,
      client,
    );
    await bookRepository.incrementQty(transaction.book_id, client);

    await holdQueueService.syncHoldQueues(client);

    const updated = await transactionRepository.findByIdWithDetails(
      transactionId,
      client,
    );
    return mapTransaction(updated);
  });
}

async function updateTransaction(id, data) {
  const transaction = await transactionRepository.findById(id);
  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.status === "returned") {
    throw new AppError("Returned loans cannot be edited", 400);
  }

  const borrowDate = data.borrow_date ?? transaction.borrow_date;
  const dueDate = data.due_date ?? transaction.due_date;
  const dailyFine = parseDailyFineAmount(
    data.daily_fine_amount ?? transaction.daily_fine_amount,
  );

  if (new Date(dueDate) < new Date(borrowDate)) {
    throw new AppError("Due date cannot be before borrow date", 400);
  }

  await transactionRepository.update(id, {
    borrow_date: borrowDate,
    due_date: dueDate,
    daily_fine_amount: dailyFine,
  });

  const updated = await transactionRepository.findByIdWithDetails(id);
  return mapTransaction(updated);
}

async function deleteTransaction(id) {
  return withTransaction(async (client) => {
    const transaction = await transactionRepository.findById(id, client);
    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.status !== "returned") {
      await bookRepository.incrementQty(transaction.book_id, client);
    }

    await transactionRepository.remove(id, client);
    await holdQueueService.syncHoldQueues(client);
    return { success: true };
  });
}

module.exports = {
  getAllTransactions,
  borrowBook,
  recordPayment,
  returnBook,
  updateTransaction,
  deleteTransaction,
};
