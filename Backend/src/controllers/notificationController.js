const notificationService = require("../services/notificationService");

async function listMine(req, res) {
  res.json(await notificationService.getMyNotifications(req.user.userId));
}

async function unreadCount(req, res) {
  const count = await notificationService.getUnreadCount(req.user.userId);
  res.json({ count });
}

async function markRead(req, res) {
  res.json(await notificationService.markNotificationRead(req.params.id, req.user.userId));
}

async function markAllRead(req, res) {
  res.json(await notificationService.markAllNotificationsRead(req.user.userId));
}

module.exports = { listMine, unreadCount, markRead, markAllRead };
