const notificationRepository = require("../repositories/notificationRepository");
const userRepository = require("../repositories/userRepository");
const { sendToUser } = require("../websocket/notificationSocket");
const { AppError } = require("../middleware");

const pushQueue = [];

async function emitToUser(userId, event) {
  const unreadCount = await notificationRepository.countUnread(userId);
  sendToUser(userId, { type: "notification", ...event, unreadCount });
}

function queueNotificationPush(userId, event) {
  pushQueue.push({ userId, event });
}

async function flushNotificationPushQueue() {
  if (pushQueue.length === 0) return;
  const batch = pushQueue.splice(0, pushQueue.length);
  await Promise.all(batch.map(({ userId, event }) => emitToUser(userId, event)));
}

function clearNotificationPushQueue() {
  pushQueue.length = 0;
}

async function getMyNotifications(userId) {
  return notificationRepository.findByUserId(userId);
}

async function getUnreadCount(userId) {
  return notificationRepository.countUnread(userId);
}

async function createNotification(payload, client) {
  const row = await notificationRepository.create(payload, client);
  queueNotificationPush(payload.userId, {
    event: "new",
    notification: row,
  });
  if (!client) {
    await flushNotificationPushQueue();
  }
  return row;
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
  await emitToUser(userId, { event: "read", id });
  return { success: true };
}

async function markAllNotificationsRead(userId) {
  await notificationRepository.markAllRead(userId);
  await emitToUser(userId, { event: "read_all" });
  return { success: true };
}

module.exports = {
  getMyNotifications,
  getUnreadCount,
  createNotification,
  notifyAdmins,
  markNotificationRead,
  markAllNotificationsRead,
  flushNotificationPushQueue,
  clearNotificationPushQueue,
};
