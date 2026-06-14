import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/books', label: 'Books', icon: '📚' },
  { to: '/members', label: 'Members', icon: '👥' },
  { to: '/transactions', label: 'Borrow / Return', icon: '🔄' },
];

export default function Layout({ dbMode }) {
  const dbLabels = {
    memory: 'In-Memory',
    local: 'Local MySQL',
    online: 'Online MySQL',
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📖</span>
          <div>
            <h1>Library MS</h1>
            <p className="db-badge">{dbLabels[dbMode] || dbMode}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
