import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from 'context/AuthContext';
import { api } from 'services/api';

const NotificationContext = createContext(null);

function getNotificationWsUrl() {
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl) {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws/notifications';
    url.search = '';
    url.hash = '';
    return url.toString();
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/notifications`;
}

function applyNotificationEvent(items, message) {
  if (message.event === 'new' && message.notification) {
    const exists = items.some((item) => item.id === message.notification.id);
    if (exists) {
      return items.map((item) =>
        item.id === message.notification.id ? { ...item, ...message.notification } : item,
      );
    }
    return [message.notification, ...items];
  }

  if (message.event === 'read' && message.id != null) {
    return items.map((item) =>
      item.id === message.id ? { ...item, is_read: true } : item,
    );
  }

  if (message.event === 'read_all') {
    return items.map((item) => ({ ...item, is_read: true }));
  }

  return items;
}

export function NotificationProvider({ children }) {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const reconnectDelayRef = useRef(1000);
  const shouldReconnectRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.getUnreadNotificationCount();
      setUnreadCount(res.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const items = await api.getNotifications();
      setNotifications(Array.isArray(items) ? items : []);
    } catch {
      setNotifications([]);
    }
  }, [user]);

  const handleSocketMessage = useCallback((message) => {
    if (message.type !== 'notification') return;

    if (typeof message.unreadCount === 'number') {
      setUnreadCount(message.unreadCount);
    }

    if (message.event) {
      setNotifications((prev) => applyNotificationEvent(prev, message));
    }
  }, []);

  const disconnectSocket = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  const connectSocket = useCallback(() => {
    if (!user || socketRef.current) return;

    const socket = new WebSocket(getNotificationWsUrl());
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      reconnectDelayRef.current = 1000;
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleSocketMessage(message);
      } catch {
        // Ignore malformed payloads.
      }
    };

    socket.onclose = () => {
      setConnected(false);
      socketRef.current = null;
      if (!shouldReconnectRef.current) return;

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connectSocket();
      }, reconnectDelayRef.current);
      reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [user, handleSocketMessage]);

  useEffect(() => {
    if (loading) return undefined;

    if (!user) {
      shouldReconnectRef.current = false;
      disconnectSocket();
      setUnreadCount(0);
      setNotifications([]);
      return undefined;
    }

    shouldReconnectRef.current = true;
    refreshUnreadCount();
    refreshNotifications();
    connectSocket();

    return () => {
      shouldReconnectRef.current = false;
      disconnectSocket();
    };
  }, [
    user,
    loading,
    connectSocket,
    disconnectSocket,
    refreshUnreadCount,
    refreshNotifications,
  ]);

  const markRead = useCallback(async (id) => {
    await api.markNotificationRead(id);
    if (!connected) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
      );
      await refreshUnreadCount();
    }
  }, [connected, refreshUnreadCount]);

  const markAllRead = useCallback(async () => {
    await api.markAllNotificationsRead();
    if (!connected) {
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    }
  }, [connected]);

  const value = useMemo(
    () => ({
      unreadCount,
      notifications,
      connected,
      refreshUnreadCount,
      refreshNotifications,
      markRead,
      markAllRead,
    }),
    [
      unreadCount,
      notifications,
      connected,
      refreshUnreadCount,
      refreshNotifications,
      markRead,
      markAllRead,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
