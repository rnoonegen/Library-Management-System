const bookRepository = require("../repositories/bookRepository");
const borrowRequestRepository = require("../repositories/borrowRequestRepository");
const transactionRepository = require("../repositories/transactionRepository");
const notificationService = require("./notificationService");
const { PICKUP_DAYS } = require("../constants/libraryRules");

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

async function findNextEligibleHold(bookId, client) {
  let skipped = true;
  while (skipped) {
    skipped = false;
    const next = await borrowRequestRepository.findOldestPendingByBook(bookId, client);
    if (!next) return null;

    const activeBorrow = await transactionRepository.findActiveBorrowByUserAndBook(
      next.user_id,
      bookId,
      client,
    );
    if (activeBorrow) {
      await borrowRequestRepository.updateStatus(next.id, "cancelled", {}, client);
      skipped = true;
      continue;
    }
    return next;
  }
  return null;
}

async function promoteNextHold(bookId, client) {
  const book = await bookRepository.findById(bookId, client);
  if (!book || book.qty < 1) return null;

  const next = await findNextEligibleHold(bookId, client);
  if (!next) return null;

  const today = new Date().toISOString().split("T")[0];
  const collectBy = addDays(today, PICKUP_DAYS);

  await borrowRequestRepository.markReady(
    next.id,
    { readyAt: new Date(), collectBy },
    client,
  );
  await bookRepository.decrementQty(bookId, client);

  await notificationService.createNotification(
    {
      userId: next.user_id,
      type: "hold_ready",
      title: "Book ready for pickup",
      message: `"${next.book_title}" is ready. Please collect by ${collectBy} at the library.`,
      relatedId: next.id,
    },
    client,
  );

  return borrowRequestRepository.findById(next.id, client);
}

/** Promote pending holds when stock is available. No automatic expiry — admin cancels manually. */
async function syncHoldQueues(client) {
  const books = await borrowRequestRepository.findBooksNeedingPromotion(client);
  for (const { book_id } of books) {
    await promoteNextHold(book_id, client);
  }
}

module.exports = { promoteNextHold, syncHoldQueues };
