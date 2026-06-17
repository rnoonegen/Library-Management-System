import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, UserIcon } from 'components/common/HeaderIcons';

export default function ProfileMenu({ user, onChangePassword, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function goToProfile() {
    setOpen(false);
    navigate('/user/profile');
  }

  function handleChangePassword() {
    setOpen(false);
    onChangePassword();
  }

  function handleLogout() {
    setOpen(false);
    onLogout();
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Profile menu"
      >
        <span className="header-action-icon"><UserIcon /></span>
        <span className="header-action-label">Profile</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <div className="profile-menu-dropdown" role="menu">
          <div className="profile-menu-user">
            <strong>{user?.name || user?.username}</strong>
            <span>{user?.username}</span>
          </div>
          <button type="button" role="menuitem" onClick={goToProfile}>
            View profile
          </button>
          <button type="button" role="menuitem" onClick={handleChangePassword}>
            Change password
          </button>
          <button type="button" role="menuitem" className="danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

