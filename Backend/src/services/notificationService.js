const notificationRepository = require("../repositories/notificationRepository");
const userRepository = require("../repositories/userRepository");
const { AppError } = require("../middleware");

async function getMyNotifications(userId) {
  return notificationRepository.findByUserId(userId);
}

async function getUnreadCount(userId) {
  return notificationRepository.countUnread(userId);
}

async function createNotification(payload, client) {
  return notificationRepository.create(payload, client);
}

async function notifyAdmins(payload, client) {
  const adminIds = await userRepository.findAdminIds();
  await Promise.all(
    adminIds.map((adminId) =>
      createNotification({ ...payload, userId: adminId }, client),
    ),
  );
}

async function markNotificationRead(id, userId) {
  const updated = await notificationRepository.markRead(id, userId);
  if (!updated) throw new AppError("Notification not found", 404);
  return { success: true };
}

async function markAllNotificationsRead(userId) {
  await notificationRepository.markAllRead(userId);
  return { success: true };
}

module.exports = {
  getMyNotifications,
  getUnreadCount,
  createNotification,
  notifyAdmins,
  markNotificationRead,
  markAllNotificationsRead,
};
