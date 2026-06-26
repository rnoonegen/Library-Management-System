const bookRepository = require("../repositories/bookRepository");
const purchaseOrderRepository = require("../repositories/purchaseOrderRepository");
const userRepository = require("../repositories/userRepository");
const notificationService = require("./notificationService");
const { withTransaction } = require("../config/connection");
const { AppError } = require("../middleware");

async function submitPurchaseOrder(userId, bookId) {
  if (!bookId) throw new AppError("book_id is required", 400);

  const book = await bookRepository.findById(bookId);
  if (!book) throw new AppError("Book not found", 404);
  if (book.book_type !== "sell") {
    throw new AppError("This book is not available for purchase", 400);
  }
  if (book.qty < 1) {
    throw new AppError("Book is out of stock", 400);
  }
  if (book.price == null || book.price <= 0) {
    throw new AppError("Book price is not set", 400);
  }

  const existing = await purchaseOrderRepository.findActiveByUserAndBook(userId, bookId);
  if (existing) {
    throw new AppError("You already have an active purchase order for this book", 400);
  }

  const orderId = await withTransaction(async (client) => {
    await bookRepository.decrementQty(bookId, client);
    return purchaseOrderRepository.create(
      { userId, bookId, amount: book.price },
      client,
    );
  });

  const order = await purchaseOrderRepository.findById(orderId);
  const user = await userRepository.findById(userId);

  await notificationService.createNotification({
    userId,
    type: "purchase_submitted",
    title: "Purchase order placed",
    message: `Your order for "${book.title}" (₹${book.price}) is pending. You will be notified when it is ready for pickup.`,
    relatedId: orderId,
  });

  await notificationService.notifyAdmins({
    type: "admin_purchase_order",
    title: "New purchase order",
    message: `${user?.name || "A user"} ordered "${book.title}" for ₹${book.price}.`,
    relatedId: orderId,
  });

  return order;
}

async function cancelPurchaseOrder(userId, orderId) {
  const order = await purchaseOrderRepository.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  if (order.user_id !== userId) throw new AppError("Access denied", 403);
  if (!["pending", "ready"].includes(order.status)) {
    throw new AppError("Only pending or ready orders can be cancelled", 400);
  }

  await withTransaction(async (client) => {
    await bookRepository.incrementQty(order.book_id, client);
    await purchaseOrderRepository.updateStatus(orderId, "cancelled", {}, client);
  });

  return purchaseOrderRepository.findById(orderId);
}

async function getMyPurchaseOrders(userId) {
  return purchaseOrderRepository.findByUserId(userId);
}

async function listPurchaseOrders(query = {}) {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const status = query.status || "active";
  const { orders, total } = await purchaseOrderRepository.findPaginated(
    pageNum,
    limitNum,
    { status },
  );
  return {
    orders,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
  };
}

async function reviewPurchaseOrder(id, adminId, { action, adminNote }) {
  if (!["ready", "paid", "cancel"].includes(action)) {
    throw new AppError("action must be ready, paid, or cancel", 400);
  }

  const order = await purchaseOrderRepository.findById(id);
  if (!order) throw new AppError("Order not found", 404);

  if (action === "cancel") {
    if (!["pending", "ready"].includes(order.status)) {
      throw new AppError("Only pending or ready orders can be cancelled", 400);
    }

    return withTransaction(async (client) => {
      await bookRepository.incrementQty(order.book_id, client);
      await purchaseOrderRepository.updateStatus(
        id,
        "cancelled",
        { adminNote, reviewedBy: adminId },
        client,
      );
      await notificationService.createNotification(
        {
          userId: order.user_id,
          type: "purchase_cancelled",
          title: "Purchase cancelled",
          message: `Your order for "${order.book_title}" was cancelled.${adminNote ? ` Note: ${adminNote}` : ""}`,
          relatedId: id,
        },
        client,
      );
      return purchaseOrderRepository.findById(id, client);
    });
  }

  if (action === "ready") {
    if (order.status !== "pending") {
      throw new AppError("Only pending orders can be marked ready", 400);
    }

    await purchaseOrderRepository.updateStatus(id, "ready", { adminNote, reviewedBy: adminId });
    await notificationService.createNotification({
      userId: order.user_id,
      type: "purchase_ready",
      title: "Book ready for pickup",
      message: `"${order.book_title}" is ready. Visit the library to pay ₹${order.amount} and collect your book.`,
      relatedId: id,
    });
    return purchaseOrderRepository.findById(id);
  }

  if (order.status !== "ready") {
    throw new AppError("Only ready orders can be marked as paid", 400);
  }

  await purchaseOrderRepository.updateStatus(id, "paid", { adminNote, reviewedBy: adminId });
  await notificationService.createNotification({
    userId: order.user_id,
    type: "purchase_paid",
    title: "Purchase complete",
    message: `Payment received for "${order.book_title}". Enjoy your book!`,
    relatedId: id,
  });
  return purchaseOrderRepository.findById(id);
}

module.exports = {
  submitPurchaseOrder,
  cancelPurchaseOrder,
  getMyPurchaseOrders,
  listPurchaseOrders,
  reviewPurchaseOrder,
};
