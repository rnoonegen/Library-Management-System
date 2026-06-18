const requestService = require("../services/requestService");

async function submitBorrowRequest(req, res) {
  const result = await requestService.submitBorrowRequest(
    req.user.userId,
    req.body.book_id,
  );
  res.status(201).json(result);
}

async function myBorrowRequests(req, res) {
  res.json(await requestService.getMyBorrowRequests(req.user.userId));
}

async function cancelBorrowRequest(req, res) {
  res.json(await requestService.cancelBorrowRequest(req.user.userId, req.params.id));
}

async function listBorrowRequests(req, res) {
  res.json(await requestService.listBorrowRequests(req.query.status));
}

async function holdQueueSummary(req, res) {
  res.json(await requestService.getHoldQueueSummary());
}

async function reviewBorrowRequest(req, res) {
  res.json(
    await requestService.reviewBorrowRequest(req.params.id, req.user.userId, req.body),
  );
}

async function submitExtensionRequest(req, res) {
  const result = await requestService.submitExtensionRequest(req.user.userId, {
    borrowId: req.body.borrow_id,
    reason: req.body.reason,
  });
  res.status(201).json(result);
}

async function myExtensionRequests(req, res) {
  res.json(await requestService.getMyExtensionRequests(req.user.userId));
}

async function listExtensionRequests(req, res) {
  res.json(await requestService.listExtensionRequests(req.query.status));
}

async function reviewExtensionRequest(req, res) {
  res.json(
    await requestService.reviewExtensionRequest(req.params.id, req.user.userId, req.body),
  );
}

async function myBorrows(req, res) {
  res.json(await requestService.getMyBorrows(req.user.userId));
}

module.exports = {
  submitBorrowRequest,
  myBorrowRequests,
  cancelBorrowRequest,
  listBorrowRequests,
  holdQueueSummary,
  reviewBorrowRequest,
  submitExtensionRequest,
  myExtensionRequests,
  listExtensionRequests,
  reviewExtensionRequest,
  myBorrows,
};
