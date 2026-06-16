const { getDbMode } = require("../config/database");
const bookRepository = require("../repositories/bookRepository");
const memberRepository = require("../repositories/memberRepository");
const transactionRepository = require("../repositories/transactionRepository");
const { enrichTransaction } = require("../utils/fineUtils");

async function getDashboardStats() {
  const [allBooks, allMembers, allTransactions] = await Promise.all([
    bookRepository.findAll(),
    memberRepository.findAll(),
    transactionRepository.findAllWithDetails(),
  ]);

  const enrichedTransactions = allTransactions.map(enrichTransaction);
  const activeBorrows = enrichedTransactions.filter(
    (t) => t.status !== "returned",
  );
  const overdue = enrichedTransactions.filter((t) => t.is_overdue);
  const availableCopies = allBooks.reduce((sum, b) => sum + b.qty, 0);
  const activeMembers = allMembers.filter((m) => m.status === "active").length;

  return {
    totalBooks: allBooks.length,
    totalCopies: availableCopies + activeBorrows.length,
    availableCopies,
    totalMembers: allMembers.length,
    activeMembers,
    inactiveMembers: allMembers.length - activeMembers,
    overdueLoans: overdue.length,
    dbMode: getDbMode(),
  };
}

module.exports = { getDashboardStats };
