import { useEffect, useState } from 'react';
import { api } from 'services/api';
import Button from 'components/common/Button';

export default function UserNotifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getNotifications()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="page">
      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar rules-banner">
        <p className="text-muted" style={{ margin: 0 }}>
          {unread > 0 ? `${unread} unread notification(s)` : 'All caught up'}
        </p>
        {unread > 0 && (
          <Button variant="secondary" onClick={() => api.markAllNotificationsRead().then(load)}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading notifications...</div>
      ) : items.length === 0 ? (
        <p className="text-muted">No notifications yet.</p>
      ) : (
        <div className="notification-list">
          {items.map((item) => (
            <article key={item.id} className={`notification-item${item.is_read ? '' : ' unread'}`}>
              <h3 className="notification-item-title">{item.title}</h3>
              <p style={{ margin: 0 }}>{item.message}</p>
              <div className="notification-item-meta">
                {item.created_at?.replace('T', ' ').slice(0, 16)}
                {!item.is_read && (
                  <Button variant="secondary" onClick={() => api.markNotificationRead(item.id).then(load)}>
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
