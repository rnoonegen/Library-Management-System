const transactionService = require("../services/transactionService");

async function listTransactions(req, res) {
  const result = await transactionService.getAllTransactions(req.query);
  res.json(result);
}

async function borrowBook(req, res) {
  const transaction = await transactionService.borrowBook(req.body);
  res.status(201).json(transaction);
}

async function recordPayment(req, res) {
  const transaction = await transactionService.recordPayment(req.params.id);
  res.json(transaction);
}

async function returnBook(req, res) {
  const transaction = await transactionService.returnBook(req.params.id);
  res.json(transaction);
}

async function updateTransaction(req, res) {
  const transaction = await transactionService.updateTransaction(
    req.params.id,
    req.body,
  );
  res.json(transaction);
}

async function deleteTransaction(req, res) {
  await transactionService.deleteTransaction(req.params.id);
  res.json({ success: true });
}

module.exports = {
  listTransactions,
  borrowBook,
  recordPayment,
  returnBook,
  updateTransaction,
  deleteTransaction,
};
