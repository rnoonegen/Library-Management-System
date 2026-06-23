import { useEffect, useState } from 'react';
import { useNotifications } from 'context/NotificationContext';
import Button from 'components/common/Button';

export default function UserNotifications() {
  const {
    notifications,
    refreshNotifications,
    markRead,
    markAllRead,
  } = useNotifications();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    refreshNotifications()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshNotifications]);

  const unread = notifications.filter((n) => !n.is_read).length;

  async function handleMarkRead(id) {
    setError('');
    try {
      await markRead(id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMarkAllRead() {
    setError('');
    try {
      await markAllRead();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar rules-banner">
        <p className="text-muted" style={{ margin: 0 }}>
          {unread > 0 ? `${unread} unread notification(s)` : 'All caught up'}
        </p>
        {unread > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <p className="text-muted">No notifications yet.</p>
      ) : (
        <div className="notification-list">
          {notifications.map((item) => (
            <article key={item.id} className={`notification-item${item.is_read ? '' : ' unread'}`}>
              <h3 className="notification-item-title">{item.title}</h3>
              <p style={{ margin: 0 }}>{item.message}</p>
              <div className="notification-item-meta">
                {item.created_at?.replace('T', ' ').slice(0, 16)}
                {!item.is_read && (
                  <Button variant="secondary" onClick={() => handleMarkRead(item.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
