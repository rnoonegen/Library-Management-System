const { getDbMode } = require("../config/database");
const bookRepository = require("../repositories/bookRepository");
const userRepository = require("../repositories/userRepository");
const transactionRepository = require("../repositories/transactionRepository");
const { getTodayDateOnly } = require("../utils/fineUtils");

async function getDashboardStats() {
  const today = getTodayDateOnly();
  const [inventory, members, loans] = await Promise.all([
    bookRepository.getInventoryStats(),
    userRepository.getMemberStats(),
    transactionRepository.getLoanStats(today),
  ]);

  const availableCopies = inventory.available_copies;
  const activeBorrows = loans.active_borrows;

  return {
    totalBooks: inventory.total_books,
    totalCopies: availableCopies + activeBorrows,
    availableCopies,
    totalUsers: members.total_users,
    activeUsers: members.active_users,
    inactiveUsers: members.inactive_users,
    overdueLoans: loans.overdue_loans,
    dbMode: getDbMode(),
  };
}

module.exports = { getDashboardStats };
