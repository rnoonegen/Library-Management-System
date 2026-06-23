const { WebSocketServer } = require("ws");
const { verifyToken } = require("../utils/token");
const { ACCESS_COOKIE } = require("../utils/cookies");
const notificationRepository = require("../repositories/notificationRepository");
const logger = require("../utils/logger");

const clients = new Map();

function parseCookieHeader(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

function getUserIdFromRequest(req) {
  const cookies = parseCookieHeader(req.headers.cookie);
  const token = cookies[ACCESS_COOKIE];
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return payload.userId;
  } catch {
    return null;
  }
}

function addClient(userId, ws) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId).add(ws);
}

function removeClient(userId, ws) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) clients.delete(userId);
}

function sendToUser(userId, message) {
  const set = clients.get(userId);
  if (!set || set.size === 0) return false;

  const payload = JSON.stringify(message);
  let sent = false;
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
      sent = true;
    }
  }
  return sent;
}

function initNotificationSocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws/notifications" });

  wss.on("connection", (ws, req) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      ws.close(4401, "Unauthorized");
      return;
    }

    addClient(userId, ws);
    logger.info({ userId }, "Notification WebSocket connected");

    notificationRepository
      .countUnread(userId)
      .then((count) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: "notification", event: "sync", unreadCount: count }));
        }
      })
      .catch(() => {});

    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      removeClient(userId, ws);
      logger.info({ userId }, "Notification WebSocket disconnected");
    });

    ws.on("error", () => {
      removeClient(userId, ws);
    });
  });

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

  logger.info("Notification WebSocket server ready at /ws/notifications");
  return wss;
}

module.exports = {
  initNotificationSocket,
  sendToUser,
};
