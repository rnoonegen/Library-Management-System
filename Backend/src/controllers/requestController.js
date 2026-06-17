const requestService = require("../services/requestService");

async function submitBorrowRequest(req, res) {
  const result = await requestService.submitBorrowRequest(
    req.user.userId,
    req.body.book_id,
  );
  res.status(201).json(result);
}

async function myBorrowRequests(req, res) {
  const rows = await requestService.getMyBorrowRequests(req.user.userId);
  res.json(rows);
}

async function listBorrowRequests(req, res) {
  const rows = await requestService.listBorrowRequests(req.query.status);
  res.json(rows);
}

async function reviewBorrowRequest(req, res) {
  const result = await requestService.reviewBorrowRequest(
    req.params.id,
    req.user.userId,
    req.body,
  );
  res.json(result);
}

async function submitExtensionRequest(req, res) {
  const result = await requestService.submitExtensionRequest(req.user.userId, {
    borrowId: req.body.borrow_id,
    requestedDueDate: req.body.requested_due_date,
    reason: req.body.reason,
  });
  res.status(201).json(result);
}

async function myExtensionRequests(req, res) {
  const rows = await requestService.getMyExtensionRequests(req.user.userId);
  res.json(rows);
}

async function listExtensionRequests(req, res) {
  const rows = await requestService.listExtensionRequests(req.query.status);
  res.json(rows);
}

async function reviewExtensionRequest(req, res) {
  const result = await requestService.reviewExtensionRequest(
    req.params.id,
    req.user.userId,
    req.body,
  );
  res.json(result);
}

async function myBorrows(req, res) {
  const rows = await requestService.getMyBorrows(req.user.userId);
  res.json(rows);
}

module.exports = {
  submitBorrowRequest,
  myBorrowRequests,
  listBorrowRequests,
  reviewBorrowRequest,
  submitExtensionRequest,
  myExtensionRequests,
  listExtensionRequests,
  reviewExtensionRequest,
  myBorrows,
};
