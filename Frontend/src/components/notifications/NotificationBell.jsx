import { Link } from 'react-router-dom';
import { useNotifications } from 'context/NotificationContext';

export default function NotificationBell({ to = '/user/notifications' }) {
  const { unreadCount } = useNotifications();

  return (
    <Link to={to} className="notification-bell-wrap header-icon-link" aria-label="Notifications">
      <span aria-hidden="true">🔔</span>
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
      )}
    </Link>
  );
}
