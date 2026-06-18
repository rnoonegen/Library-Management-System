import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from 'context/ThemeContext';
import { useAuth } from 'context/AuthContext';
import SettingsModal from 'components/auth/SettingsModal';
import AppBrand from 'components/common/AppBrand';
import HeaderActionButton from 'components/common/HeaderActionButton';
import ProfileMenu from 'components/common/ProfileMenu';
import { MoonIcon, SunIcon } from 'components/common/HeaderIcons';
import NotificationBell from 'components/notifications/NotificationBell';

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
  { to: '/user/rules', label: 'Rules & Regulations', icon: '📜' },
];

const routeMeta = {
  '/': { title: 'Dashboard', subtitle: 'Library overview' },
  '/books': { title: 'Books', subtitle: 'Manage book catalog' },
  '/users': { title: 'Users', subtitle: 'Teachers and students' },
  '/transactions': { title: 'Borrows', subtitle: 'Issue and return books' },
  '/requests': { title: 'Requests', subtitle: 'Waitlist overview and extensions' },
  '/notifications': { title: 'Notifications', subtitle: 'Waitlist and extension alerts' },
  '/user/books': { title: 'Books', subtitle: 'Browse catalog and join waitlists' },
  '/user/requests': { title: 'My Requests', subtitle: 'Waitlist and extension status' },
  '/user/borrows': { title: 'My Borrows', subtitle: 'Active loans and extensions' },
  '/user/notifications': { title: 'Notifications', subtitle: 'Hold alerts and updates' },
  '/user/rules': { title: 'Rules & Regulations', subtitle: 'Library borrowing policies' },
  '/user/profile': { title: 'My Profile', subtitle: 'Update your personal details' },
};

export default function MainLayout({ variant = 'admin' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { pathname } = useLocation();
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isUser = variant === 'user';

  const navItems = isUser ? userNav : adminNav;
  const meta = routeMeta[pathname] || { title: 'Library', subtitle: '' };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${menuOpen ? 'menu-open' : ''}`}>
      {menuOpen && (
        <button type="button" className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
      )}

      <aside className="sidebar">
        <AppBrand tagline={isUser ? 'User Portal' : 'Admin Portal'} />

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
            <AppBrand variant="header" />
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
            <NotificationBell to={isUser ? '/user/notifications' : '/notifications'} />
            <ProfileMenu
              user={user}
              variant={isUser ? 'user' : 'admin'}
              onChangePassword={() => setSettingsOpen(true)}
              onLogout={handleLogout}
            />
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

