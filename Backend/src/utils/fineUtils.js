function parseDateOnly(value) {
  if (value instanceof Date) {
    return Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
    );
  }

  const normalized = String(value || "").split("T")[0];
  const [year, month, day] = normalized.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function getTodayDateOnly() {
  return new Date().toISOString().split("T")[0];
}

/** Normalize DB date (Date object or string) to YYYY-MM-DD. */
function formatDateOnly(value) {
  if (value == null || value === "") return "";
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  return String(value).split("T")[0];
}

function daysBetween(startMs, endMs) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((endMs - startMs) / msPerDay));
}

function isOverdue(dueDate, asOfDate = getTodayDateOnly()) {
  return parseDateOnly(asOfDate) > parseDateOnly(dueDate);
}

function getOverdueDays(dueDate, asOfDate = getTodayDateOnly()) {
  const dueMs = parseDateOnly(dueDate);
  const asOfMs = parseDateOnly(asOfDate);
  if (asOfMs <= dueMs) return 0;
  return daysBetween(dueMs, asOfMs);
}

function getDailyFineAmount(transaction) {
  const fromDaily = Number(transaction.daily_fine_amount);
  const fromLegacy = Number(transaction.fine_per_day);
  const amount =
    Number.isFinite(fromDaily) && fromDaily > 0
      ? fromDaily
      : Number.isFinite(fromLegacy) && fromLegacy > 0
        ? Math.round(fromLegacy)
        : 1;
  return Math.min(10, Math.max(1, amount));
}

function getPaymentStatus(transaction) {
  if (transaction.payment_status === "paid" || transaction.fine_paid === true) {
    return "paid";
  }
  return transaction.payment_status || "none";
}

function calculateAccruedFine(transaction, asOfDate = getTodayDateOnly()) {
  const dailyFine = getDailyFineAmount(transaction);
  const referenceDate =
    transaction.status === "returned" && transaction.return_date
      ? transaction.return_date
      : asOfDate;

  if (transaction.status === "returned" && transaction.fine_amount != null) {
    const storedFine = Number(transaction.fine_amount);
    if (Number.isFinite(storedFine)) return storedFine;
  }

  if (transaction.payment_status === "paid" && transaction.paid_amount != null) {
    const paidFine = Number(transaction.paid_amount);
    if (Number.isFinite(paidFine)) return paidFine;
  }

  if (getPaymentStatus(transaction) === "paid" && transaction.paid_amount != null) {
    const paidFine = Number(transaction.paid_amount);
    if (Number.isFinite(paidFine)) return paidFine;
  }

  const overdueDays = getOverdueDays(transaction.due_date, referenceDate);
  return overdueDays * dailyFine;
}

function enrichTransaction(transaction) {
  const today = getTodayDateOnly();
  const isActive = transaction.status !== "returned";
  const paymentStatus = getPaymentStatus(transaction);
  const overdue = isActive && isOverdue(transaction.due_date, today);
  const overdueDays = isActive
    ? getOverdueDays(transaction.due_date, today)
    : getOverdueDays(transaction.due_date, transaction.return_date || today);
  const accruedFine = calculateAccruedFine({
    ...transaction,
    daily_fine_amount: getDailyFineAmount(transaction),
    payment_status: paymentStatus,
  }, today);
  const requiresPayment = isActive && overdue && paymentStatus !== "paid";

  return {
    ...transaction,
    daily_fine_amount: getDailyFineAmount(transaction),
    payment_status: paymentStatus,
    status: overdue ? "overdue" : transaction.status,
    is_overdue: overdue,
    overdue_days: overdueDays,
    accrued_fine: accruedFine,
    requires_payment: requiresPayment,
    can_return: isActive && (!overdue || paymentStatus === "paid"),
  };
}

function sumOutstandingFine(transactions) {
  return transactions.reduce((total, transaction) => {
    const enriched = enrichTransaction(transaction);
    if (enriched.status === "returned") return total;
    if (!enriched.is_overdue) return total;
    if (enriched.payment_status === "paid") return total;
    return total + enriched.accrued_fine;
  }, 0);
}

module.exports = {
  getTodayDateOnly,
  formatDateOnly,
  isOverdue,
  getOverdueDays,
  calculateAccruedFine,
  enrichTransaction,
  sumOutstandingFine,
};
