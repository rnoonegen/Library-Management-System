import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from 'context/ThemeContext';
import { useAuth } from 'context/AuthContext';
import SettingsModal from 'components/auth/SettingsModal';
import HeaderActionButton from 'components/common/HeaderActionButton';
import ProfileMenu from 'components/common/ProfileMenu';
import { MoonIcon, SettingsIcon, SunIcon } from 'components/common/HeaderIcons';

const adminNav = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/books', label: 'Books', icon: '📚' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/transactions', label: 'Borrows', icon: '🔄' },
  { to: '/requests', label: 'Requests', icon: '📋' },
];

const userNav = [
  { to: '/user/books', label: 'Books', icon: '📚', end: false },
  { to: '/user/requests', label: 'My Requests', icon: '📋' },
  { to: '/user/borrows', label: 'My Borrows', icon: '🔄' },
];

const routeMeta = {
  '/': { title: 'Dashboard', subtitle: 'Library overview' },
  '/books': { title: 'Books', subtitle: 'Manage book catalog' },
  '/users': { title: 'Users', subtitle: 'Teachers and students' },
  '/transactions': { title: 'Borrows', subtitle: 'Issue and return books' },
  '/requests': { title: 'Requests', subtitle: 'Borrow and extension approvals' },
  '/user/books': { title: 'Books', subtitle: 'Browse and request books' },
  '/user/requests': { title: 'My Requests', subtitle: 'Track your book requests' },
  '/user/borrows': { title: 'My Borrows', subtitle: 'Active loans and extensions' },
  '/user/profile': { title: 'My Profile', subtitle: 'Update your personal details' },
};

export default function MainLayout({ dbMode, variant = 'admin' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { pathname } = useLocation();
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isUser = variant === 'user';

  const navItems = isUser ? userNav : adminNav;
  const meta = routeMeta[pathname] || { title: 'Library', subtitle: '' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${menuOpen ? 'menu-open' : ''}`}>
      {menuOpen && (
        <button type="button" className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
      )}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon" aria-hidden="true">📖</span>
          <div>
            <h1 className="brand-title">Library MS</h1>
            <p className="brand-tagline">{isUser ? 'User Portal' : 'Admin'}</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.name || user?.username}</span>
            <span className="sidebar-user-role">{user?.username}</span>
          </div>
          {!isUser && (
            <button type="button" className="btn-secondary sidebar-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
          {!isUser && (
            <span className="db-badge">
              <span className="db-dot" aria-hidden="true" />
              {dbMode === 'online' ? 'Online PostgreSQL' : 'Local PostgreSQL'}
            </span>
          )}
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
            <span /><span /><span />
          </button>

          <div className="app-header-text">
            <h2 className="app-header-title">{meta.title}</h2>
            {meta.subtitle && <p className="app-header-subtitle">{meta.subtitle}</p>}
          </div>

          <div className="header-actions">
            <HeaderActionButton
              icon={mode === 'light' ? <MoonIcon /> : <SunIcon />}
              label={mode === 'light' ? 'Dark mode' : 'Light mode'}
              onClick={toggleMode}
              ariaLabel={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            />
            {isUser ? (
              <ProfileMenu
                user={user}
                onChangePassword={() => setSettingsOpen(true)}
                onLogout={handleLogout}
              />
            ) : (
              <HeaderActionButton
                icon={<SettingsIcon />}
                label="Account"
                onClick={() => setSettingsOpen(true)}
                ariaLabel="Open account settings and change password"
                title="Change password"
              />
            )}
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

