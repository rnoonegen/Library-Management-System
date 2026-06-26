const purchaseOrderService = require("../services/purchaseOrderService");

async function submitPurchaseOrder(req, res) {
  const result = await purchaseOrderService.submitPurchaseOrder(
    req.user.userId,
    req.body.book_id,
  );
  res.status(201).json(result);
}

async function myPurchaseOrders(req, res) {
  res.json(await purchaseOrderService.getMyPurchaseOrders(req.user.userId));
}

async function cancelPurchaseOrder(req, res) {
  res.json(await purchaseOrderService.cancelPurchaseOrder(req.user.userId, req.params.id));
}

async function listPurchaseOrders(req, res) {
  res.json(await purchaseOrderService.listPurchaseOrders(req.query));
}

async function reviewPurchaseOrder(req, res) {
  res.json(
    await purchaseOrderService.reviewPurchaseOrder(req.params.id, req.user.userId, req.body),
  );
}

module.exports = {
  submitPurchaseOrder,
  myPurchaseOrders,
  cancelPurchaseOrder,
  listPurchaseOrders,
  reviewPurchaseOrder,
};
