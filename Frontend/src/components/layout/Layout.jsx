import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useThemeMode } from '../../theme/ThemeModeContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/books', label: 'Books', icon: '📚' },
  { to: '/members', label: 'Members', icon: '👥' },
  { to: '/transactions', label: 'Borrow / Return', icon: '🔄' },
];

const routeMeta = {
  '/': {
    title: 'Dashboard',
    subtitle: 'Overview of your library at a glance',
  },
  '/books': {
    title: 'Books',
    subtitle: 'Browse, search, and manage your book catalog',
  },
  '/members': {
    title: 'Members',
    subtitle: 'Register and manage library members',
  },
  '/transactions': {
    title: 'Borrow / Return',
    subtitle: 'Issue books to members and process returns',
  },
};

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12.1 3a9 9 0 1 0 8.87 10.36A6.5 6.5 0 0 1 12.1 3z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5h1.5v3H12V2zm0 17h1.5v3H12v-3zM4.22 4.22l1.06 1.06-2.12 2.12-1.06-1.06 2.12-2.12zm15.56 0 1.06 1.06-2.12 2.12-1.06-1.06 2.12-2.12zM2 12h3v1.5H2V12zm17 0h3v1.5h-3V12zM6.34 17.66l1.06-1.06 2.12 2.12-1.06 1.06-2.12-2.12zm11.32 0 1.06 1.06-2.12 2.12-1.06-1.06 2.12-2.12z" />
    </svg>
  );
}

export default function Layout({ dbMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { mode, toggleMode } = useThemeMode();

  const dbLabels = {
    local: 'Local PostgreSQL',
    online: 'Online PostgreSQL',
  };

  const meta = routeMeta[pathname] || { title: 'Library', subtitle: '' };
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`layout ${menuOpen ? 'menu-open' : ''}`}>
      {menuOpen && (
        <button type="button" className="sidebar-backdrop" onClick={closeMenu} aria-label="Close menu" />
      )}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon" aria-hidden="true">
            📖
          </span>
          <div>
            <h1 className="brand-title">Library MS</h1>
            <p className="brand-tagline">Management System</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={closeMenu}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="db-badge">
            <span className="db-dot" aria-hidden="true" />
            {dbLabels[dbMode] || dbMode}
          </span>
        </div>
      </aside>

      <div className="app-shell">
        <header className="app-header">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="app-header-text">
            <h2 className="app-header-title">{meta.title}</h2>
            {meta.subtitle && <p className="app-header-subtitle">{meta.subtitle}</p>}
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleMode}
            aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {mode === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
