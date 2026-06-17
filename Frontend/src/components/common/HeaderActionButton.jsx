export default function HeaderActionButton({ icon, label, onClick, ariaLabel, title }) {
  return (
    <button
      type="button"
      className="header-action-btn"
      onClick={onClick}
      aria-label={ariaLabel || label}
      title={title || label}
    >
      <span className="header-action-icon">{icon}</span>
      <span className="header-action-label">{label}</span>
    </button>
  );
}

