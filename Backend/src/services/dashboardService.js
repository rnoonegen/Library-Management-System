const { getDbMode } = require("../config/database");
const bookRepository = require("../repositories/bookRepository");
const userRepository = require("../repositories/userRepository");
const transactionRepository = require("../repositories/transactionRepository");
const { enrichTransaction } = require("../utils/fineUtils");

async function getDashboardStats() {
  const [allBooks, allUsersData, allTransactions] = await Promise.all([
    bookRepository.findAll(),
    userRepository.findAll(),
    transactionRepository.findAllWithDetails(),
  ]);

  const allUsers = allUsersData.filter((u) =>
    ["teacher", "student"].includes(u.role),
  );
  const enrichedTransactions = allTransactions.map(enrichTransaction);
  const activeBorrows = enrichedTransactions.filter(
    (t) => t.status !== "returned",
  );
  const overdue = enrichedTransactions.filter((t) => t.is_overdue);
  const availableCopies = allBooks.reduce((sum, b) => sum + b.qty, 0);
  const activeUsers = allUsers.filter((u) => u.status === "active").length;

  return {
    totalBooks: allBooks.length,
    totalCopies: availableCopies + activeBorrows.length,
    availableCopies,
    totalUsers: allUsers.length,
    activeUsers,
    inactiveUsers: allUsers.length - activeUsers,
    overdueLoans: overdue.length,
    dbMode: getDbMode(),
  };
}

module.exports = { getDashboardStats };
