export const appGlobalCss = `
html {
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
:root {
  --sidebar-width: 280px;
  --radius: 12px;
  --accent: #1e4d2b;
  --accent-light: #2d6b3c;
  --accent-muted: #4a7c59;
  --brand-gold: #d4af37;
  --brand-gold-light: #f0d78c;
  --brand-gradient: linear-gradient(145deg, #0f2d1a 0%, #1e4d2b 42%, #2d6b3c 100%);
  --brand-gradient-soft: linear-gradient(145deg, rgba(15, 45, 26, 0.08) 0%, rgba(45, 107, 60, 0.04) 100%);
  --cream: #f5efe6;
  --sage: #dce8da;
  --card-cream: #f4efde;
  --fab-clearance: calc(4.25rem + env(safe-area-inset-bottom, 0px));
}
[data-theme='light'] {
  --bg: #fafafa;
  --surface: #ffffff;
  --surface-hover: #f5f5f5;
  --border: #e5e5e5;
  --text: #171717;
  --text-muted: #525252;
  --text-prose: #404040;
  --heading: #1e4d2b;
  --primary: #1e4d2b;
  --primary-hover: #2d6b3c;
  --primary-fg: #ffffff;
  --secondary: #ffffff;
  --secondary-muted: #f5f5f5;
  --link: #1d4ed8;
  --link-hover: #1e40af;
  --header-bg: rgba(255, 255, 255, 0.92);
  --header-subtitle: #525252;
  --sidebar-surface: #ffffff;
  --sidebar-heading: #1e4d2b;
  --sidebar-text: #171717;
  --sidebar-text-muted: #525252;
  --sidebar-active-bg: rgba(30, 77, 43, 0.06);
  --sidebar-active-text: #1e4d2b;
  --footer-strip: #fafafa;
  --shadow: 0 4px 24px rgba(30, 77, 43, 0.08);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --accent-soft: rgba(30, 77, 43, 0.06);
  --accent-border: rgba(30, 77, 43, 0.2);
  --success: #2d6b3c;
  --warning: #b45309;
  --danger: #dc2626;
  color-scheme: light;
}
[data-theme='dark'] {
  --bg: #0a0a0a;
  --surface: #171717;
  --surface-hover: #262626;
  --border: #333333;
  --text: #f5f5f5;
  --text-muted: #a3a3a3;
  --text-prose: #d4d4d4;
  --heading: #ffffff;
  --heading-active: #a7f3d0;
  --primary: #1e4d2b;
  --primary-hover: #2d6b3c;
  --primary-fg: #ffffff;
  --secondary: #262626;
  --secondary-muted: #333333;
  --link: #38bdf8;
  --link-hover: #7dd3fc;
  --header-bg: rgba(10, 10, 10, 0.96);
  --header-subtitle: #a3a3a3;
  --sidebar-surface: #0a0a0a;
  --sidebar-heading: #ffffff;
  --sidebar-text: #ffffff;
  --sidebar-text-muted: #d4d4d4;
  --sidebar-active-bg: #1e4d2b;
  --sidebar-active-text: #ffffff;
  --footer-strip: #0a0a0a;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.25);
  --accent-soft: rgba(30, 77, 43, 0.35);
  --accent-border: rgba(167, 243, 208, 0.22);
  --success: #4ade80;
  --warning: #fbbf24;
  --danger: #f87171;
  color-scheme: dark;
}
body {
  font-family: 'Poppins', 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
a {
  color: var(--link);
  text-decoration-color: rgba(29, 78, 216, 0.35);
}
a:hover {
  color: var(--link-hover);
}
[data-theme='dark'] a {
  text-decoration-color: rgba(56, 189, 248, 0.35);
}
#root {
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
}
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
}
button:active:not(:disabled) {
  transform: scale(0.98);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
input,
select,
textarea {
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  width: 100%;
  transition: border-color 0.15s, outline 0.15s;
}
input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--accent-border);
  outline-offset: 0;
  border-color: var(--primary);
}
input[type='date'] {
  min-height: 2.5rem;
  padding-right: 0.55rem;
}
[data-theme='light'] input[type='date'] {
  color-scheme: light;
}
[data-theme='dark'] input[type='date'] {
  color-scheme: dark;
}
input[type='date']::-webkit-datetime-edit {
  color: var(--text);
}
input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 1;
}
[data-theme='dark'] input[type='date']::-webkit-calendar-picker-indicator {
  filter: brightness(0) invert(1);
}
table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 0.8rem 1.1rem;
  border-bottom: 1px solid var(--border);
}
th {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}
tbody tr {
  transition: background 0.12s;
}
tbody tr:hover td {
  background: var(--surface-hover);
}
tbody tr:last-child td {
  border-bottom: none;
}
.badge {
  display: inline-block;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}
.badge-success,
.badge-borrowed {
  background: rgba(45, 107, 60, 0.12);
  color: #2d6b3c;
  border: 1px solid rgba(45, 107, 60, 0.22);
}
[data-theme='dark'] .badge-success,
[data-theme='dark'] .badge-borrowed {
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.28);
}
.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}
.badge-danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.25);
}
[data-theme='dark'] .badge-danger {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.28);
}
.badge-info {
  background: var(--accent-soft);
  color: var(--primary);
}
.error-banner {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.45);
  color: #b91c1c;
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}
[data-theme="dark"] .error-banner {
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.45);
}
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 0.85rem;
  font-size: 0.9rem;
  opacity: 0.55;
  pointer-events: none;
}
.search-bar input {
  padding-left: 2.35rem;
  max-width: 100%;
}
.search-bar input[type='search']::-webkit-search-cancel-button {
  cursor: pointer;
}
.btn-primary {
  background: var(--primary);
  color: var(--primary-fg);
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}
.btn-secondary {
  background: var(--surface-hover);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover:not(:disabled) {
  background: var(--border);
}
.btn-danger {
  background: #dc2626;
  color: white;
}
.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}
.btn-success {
  background: var(--primary);
  color: var(--primary-fg);
}
.btn-success:hover:not(:disabled) {
  background: var(--primary-hover);
}
img,
video {
  max-width: 100%;
  height: auto;
}
.layout {
  display: flex;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--bg);
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  height: 100vh;
  height: 100dvh;
  background: var(--sidebar-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 200;
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(30, 77, 43, 0.06);
}
[data-theme='dark'] .sidebar {
  box-shadow: 4px 0 32px rgba(0, 0, 0, 0.4);
}
.sidebar-brand {
  padding: 0;
  border-bottom: none;
  flex-shrink: 0;
}
.brand-hero {
  position: relative;
  overflow: hidden;
}
.brand-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 100% 0%, rgba(212, 175, 55, 0.18) 0%, transparent 55%),
    radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
  pointer-events: none;
}
.brand-hero--sidebar {
  padding: 1.35rem 1.1rem 1.2rem;
  background: var(--brand-gradient);
  text-align: center;
}
.brand-hero--auth {
  width: min(100%, 440px);
  padding: 2rem 1.75rem 1.75rem;
  background: var(--brand-gradient);
  border-radius: calc(var(--radius) + 4px);
  text-align: center;
  box-shadow: 0 12px 40px rgba(30, 77, 43, 0.22);
}
.brand-monogram {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.75rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid var(--brand-gold);
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15), 0 4px 12px rgba(0, 0, 0, 0.2);
}
.brand-monogram--lg {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
}
.brand-monogram-text {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--brand-gold-light);
}
.brand-monogram--lg .brand-monogram-text {
  font-size: 0.95rem;
}
.brand-name-highlight {
  position: relative;
  z-index: 1;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.01em;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.brand-name-highlight--auth {
  font-size: 1.35rem;
  line-height: 1.3;
  margin-bottom: 0.35rem;
}
.brand-app-name {
  position: relative;
  z-index: 1;
  font-size: 0.72rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  margin-top: 0.35rem;
}
.brand-app-name--auth {
  font-size: 0.9rem;
  color: var(--brand-gold-light);
  font-weight: 600;
  margin-top: 0.15rem;
}
.brand-auth-message {
  position: relative;
  z-index: 1;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 0.65rem;
  line-height: 1.45;
}
.brand-portal-badge {
  position: relative;
  z-index: 1;
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.3rem 0.75rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--brand-gold-light);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.45);
  border-radius: 999px;
}
.institution-banner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
  margin-bottom: 0.35rem;
  padding: 0.35rem 0.85rem 0.35rem 0.65rem;
  background: var(--brand-gradient);
  border-radius: 999px;
  box-shadow: 0 2px 10px rgba(30, 77, 43, 0.18);
}
.institution-banner-accent {
  width: 4px;
  height: 1.1rem;
  border-radius: 4px;
  background: var(--brand-gold);
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
}
.institution-banner-text {
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.35;
  color: #ffffff;
  white-space: normal;
}
.sidebar-nav {
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  overflow-y: auto;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  color: var(--sidebar-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}
.nav-icon {
  font-size: 1.05rem;
  width: 1.35rem;
  text-align: center;
  flex-shrink: 0;
}
.nav-link:hover {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-text);
}
.nav-link.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--brand-gold);
}
.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  background: var(--footer-strip);
}
.db-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.72rem;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  max-width: 100%;
}
.db-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}
.app-shell {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 2rem;
  background: var(--header-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.app-header-text {
  min-width: 0;
  flex: 1;
}
.app-header-title {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--heading);
}
.app-header-subtitle {
  color: var(--header-subtitle);
  font-size: 0.85rem;
  margin-top: 0.2rem;
  line-height: 1.4;
}
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
  color: var(--heading);
  border: 1px solid var(--accent-border);
  border-radius: 10px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
[data-theme='light'] .theme-toggle {
  background: var(--surface);
  color: var(--heading);
  border-color: var(--border);
}
.theme-toggle:hover {
  background: var(--accent-soft);
  border-color: var(--accent-border);
}
.theme-toggle svg {
  display: block;
}
.main-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 1.5rem 2rem 2rem;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  background:
    var(--brand-gradient-soft),
    var(--bg);
}
.page {
  max-width: 1280px;
  margin: 0 auto;
}
.dashboard-section {
  margin-bottom: 1.75rem;
}
.dashboard-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 0.85rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--brand-gold);
  display: inline-block;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  box-shadow: var(--shadow-sm);
}
.stat-card:hover {
  border-color: var(--border);
  box-shadow: var(--shadow);
  transform: translateY(-1px);
}
.stat-card .value {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--heading);
}
.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.stat-card .label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  line-height: 1.3;
}
.stat-icon {
  font-size: 1.35rem;
  opacity: 0.9;
}
.stat-card.accent-blue {
  border-left: 3px solid var(--primary);
}
.stat-card.accent-green {
  border-left: 3px solid var(--success);
}
.stat-card.accent-amber {
  border-left: 3px solid var(--warning);
}
.stat-card.accent-red {
  border-left: 3px solid var(--danger);
}
.loading {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}
.loading::before {
  content: '';
  display: block;
  width: 2rem;
  height: 2rem;
  margin: 0 auto 0.75rem;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.empty-state-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.6;
}
.menu-toggle {
  display: none;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.45rem;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  flex-shrink: 0;
}
.menu-toggle span {
  display: block;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
}
.sidebar-backdrop {
  display: block;
  position: fixed;
  inset: 0;
  z-index: 150;
  background: rgba(0, 0, 0, 0.55);
  border: none;
  padding: 0;
  cursor: pointer;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
}
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}
.modal-header-text {
  min-width: 0;
}
.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--heading);
  margin: 0;
}
.modal-subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.875rem;
  color: var(--text-muted);
}
.modal-close {
  background: transparent;
  color: var(--text-muted);
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
}
.modal-close:hover {
  color: var(--text);
}
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.confirm-dialog,
.reason-dialog {
  max-width: 440px;
}
.confirm-dialog .modal-body,
.reason-dialog .modal-body {
  padding-top: 0.25rem;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}
.reason-dialog textarea {
  width: 100%;
  min-height: 5.5rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.45;
  resize: vertical;
}
.reason-dialog textarea:focus {
  outline: 2px solid var(--accent-border);
  border-color: var(--accent-muted);
}
.reason-dialog textarea:disabled {
  opacity: 0.7;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}
.password-field {
  position: relative;
  display: block;
}
.password-field input {
  display: block;
  box-sizing: border-box;
  min-height: 2.5rem;
  padding-right: 2.75rem;
}
.password-toggle {
  position: absolute;
  top: 0;
  right: 0.45rem;
  bottom: 0;
  width: 2rem;
  height: 2rem;
  margin: auto 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
  transition: color 0.15s, background 0.15s;
}
.password-toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
}
.password-toggle-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}
.password-toggle:hover {
  color: var(--text);
  background: var(--surface-hover);
}
.password-toggle:active:not(:disabled) {
  transform: none;
}
.password-toggle:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.books-page,
.users-page,
.transactions-page {
  padding-bottom: 1.25rem;
}
.books-toolbar,
.users-toolbar,
.transactions-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.users-toolbar .tab-bar {
  margin-bottom: 0;
  margin-left: auto;
}
.books-search,
.users-search,
.transactions-search {
  flex: 1;
  min-width: min(100%, 280px);
  max-width: 100%;
  position: relative;
}
.books-search::before,
.users-search::before,
.transactions-search::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(30, 77, 43, 0.35), rgba(45, 107, 60, 0.25));
  opacity: 0.45;
  z-index: 0;
  transition: opacity 0.2s;
}
[data-theme='light'] .books-search::before,
[data-theme='light'] .users-search::before,
[data-theme='light'] .transactions-search::before {
  display: none;
}
.books-search:focus-within::before,
.users-search:focus-within::before,
.transactions-search:focus-within::before {
  opacity: 1;
}
.books-search input,
.users-search input,
.transactions-search input {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0.85rem 1.1rem 0.85rem 2.85rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 0.9rem;
  box-shadow: var(--shadow-sm);
}
[data-theme='dark'] .books-search input,
[data-theme='dark'] .users-search input,
[data-theme='dark'] .transactions-search input {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
.books-summary,
.users-summary,
.transactions-summary {
  font-size: 0.82rem;
  color: var(--text-muted);
  white-space: nowrap;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
}
.transactions-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.transactions-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.transactions-tab:hover {
  border-color: var(--accent-border);
  color: var(--text);
}
.transactions-tab.active {
  background: var(--accent-soft);
  border-color: var(--accent-border);
  color: var(--heading);
  font-weight: 600;
}
.transactions-tab-overdue.active {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.45);
  color: #f87171;
}
.transactions-tab-returned.active {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.45);
  color: #4ade80;
}
.transactions-tab-count {
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.35rem;
  text-align: center;
}
.transactions-tab.active .transactions-tab-count {
  background: rgba(255, 255, 255, 0.12);
}
.books-empty,
.users-empty,
.transactions-empty {
  text-align: center;
  padding: 3.5rem 1.5rem;
  color: var(--text-muted);
}
.books-grid,
.users-grid,
.transactions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
[data-theme='dark'] .stat-card {
  background: var(--surface);
  box-shadow: none;
}
[data-theme='light'] .book-card,
[data-theme='light'] .user-card,
[data-theme='light'] .transaction-card,
[data-theme='light'] .stat-card {
  box-shadow: var(--shadow-sm);
}
[data-theme='light'] .book-card:hover,
[data-theme='light'] .user-card:hover,
[data-theme='light'] .transaction-card:hover {
  box-shadow: var(--shadow);
  border-color: var(--border);
  transform: translateY(-1px);
}
[data-theme='light'] .transactions-tab.active {
  background: var(--accent-soft);
  border-color: var(--border);
  color: var(--heading);
}
[data-theme='light'] .pagination-page.active {
  background: var(--accent-soft);
  border-color: var(--border);
  color: var(--heading);
}
[data-theme='dark'] .theme-toggle {
  background: transparent;
  color: #ffffff;
  border-color: #404040;
}
[data-theme='dark'] .theme-toggle:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: #525252;
  color: var(--heading-active);
}
[data-theme='dark'] .app-header {
  border-bottom-color: #262626;
}
[data-theme='dark'] .sidebar {
  border-right-color: #262626;
}
[data-theme='dark'] .sidebar-brand,
[data-theme='dark'] .sidebar-footer {
  border-color: #262626;
}
[data-theme='dark'] .nav-link:hover {
  color: var(--heading-active);
  background: transparent;
}
[data-theme='dark'] .nav-link.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  border: 1px solid var(--accent-border);
}
[data-theme='dark'] .db-badge {
  background: #171717;
  border-color: #333333;
  color: var(--text-muted);
}
[data-theme='dark'] .transactions-tab {
  background: #171717;
  color: var(--text-muted);
  border-color: #333333;
}
[data-theme='dark'] .transactions-tab:hover {
  color: var(--heading-active);
  border-color: #525252;
}
[data-theme='dark'] .transactions-tab.active {
  background: var(--primary);
  border-color: var(--accent-border);
  color: #ffffff;
}
[data-theme='dark'] .pagination-page.active {
  background: var(--primary);
  border-color: var(--accent-border);
  color: #ffffff;
}
[data-theme='dark'] .btn-primary,
[data-theme='dark'] .btn-success {
  background: var(--primary);
  color: #ffffff;
  border: 1px solid var(--accent-border);
}
[data-theme='dark'] .btn-primary:hover:not(:disabled),
[data-theme='dark'] .btn-success:hover:not(:disabled) {
  background: var(--primary-hover);
}
[data-theme='dark'] .books-fab,
[data-theme='dark'] .users-fab,
[data-theme='dark'] .transactions-fab {
  background: var(--primary);
  border: 1px solid var(--accent-border);
}
[data-theme='dark'] .books-fab:hover,
[data-theme='dark'] .users-fab:hover,
[data-theme='dark'] .transactions-fab:hover {
  background: var(--primary-hover);
}
[data-theme='dark'] .book-card:hover,
[data-theme='dark'] .user-card:hover,
[data-theme='dark'] .transaction-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
}
.book-card,
.user-card,
.transaction-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.2rem 1.25rem;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.book-card:hover,
.user-card:hover,
.transaction-card:hover {
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}
.book-card-top,
.user-card-top,
.transaction-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border);
}
.book-card-title,
.user-card-title,
.transaction-card-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--heading);
}
.book-card-details,
.user-card-details,
.transaction-card-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem 1rem;
  flex: 1;
  margin: 0;
}
.book-detail dt,
.user-detail dt,
.transaction-detail dt {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}
.book-detail dd,
.user-detail dd,
.transaction-detail dd {
  font-size: 0.85rem;
  margin: 0;
  color: var(--text);
  word-break: break-word;
}
.user-detail-full,
.transaction-detail-full {
  grid-column: 1 / -1;
}
.book-card-actions,
.user-card-actions,
.transaction-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.book-card-actions button,
.user-card-actions button {
  flex: 1;
}
.user-book-card-actions {
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}
.user-book-card-actions .btn-primary {
  width: 100%;
}
.transaction-card-actions button {
  flex: 1;
}
.transaction-card-secondary-actions {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}
.transaction-card-actions + .transaction-card-secondary-actions {
  margin-top: 0;
  padding-top: 0.75rem;
}
.fine-amount-due {
  color: #f87171;
  font-weight: 600;
}
.fine-amount-paid {
  color: #4ade80;
  font-weight: 600;
}
.fine-days-note {
  color: var(--text-muted);
  font-weight: 400;
  font-size: 0.78rem;
}
.books-pagination,
.users-pagination,
.transactions-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}
.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: center;
}
.pagination-page {
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0 0.5rem;
  background: var(--surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
}
.pagination-page.active {
  background: var(--accent-soft);
  color: var(--heading);
  border-color: var(--accent-border);
  font-weight: 600;
}
.pagination-ellipsis {
  color: var(--text-muted);
  padding: 0 0.25rem;
}
.books-fab,
.users-fab,
.transactions-fab {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 90;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.35rem;
  border-radius: 10px;
  background: var(--primary);
  color: var(--primary-fg);
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: var(--shadow);
}
.books-fab:hover,
.users-fab:hover,
.transactions-fab:hover {
  background: var(--primary-hover);
}
.books-fab-icon,
.users-fab-icon,
.transactions-fab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem;
  height: 1.35rem;
  font-size: 1.35rem;
  line-height: 1;
  font-weight: 400;
}
@media (max-width: 900px) {
  .table-desktop {
    display: none;
  }
  .list-cards-mobile {
    display: block;
  }
}
@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: var(--shadow);
  }
  .layout.menu-open .sidebar {
    transform: translateX(0);
  }
  .app-shell {
    margin-left: 0;
    width: 100%;
  }
  .app-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto auto auto;
    padding: 0.75rem 1rem;
    gap: 0.35rem 0.65rem;
    align-items: start;
  }
  .menu-toggle {
    grid-column: 1;
    grid-row: 1 / -1;
    align-self: center;
  }
  .app-header-text {
    grid-column: 2;
    grid-row: 1 / -1;
    min-width: 0;
  }
  .header-actions {
    grid-column: 3;
    grid-row: 1 / -1;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin-left: 0;
    padding: 0.25rem;
    align-self: start;
  }
  .header-actions > * {
    border-bottom: 1px solid var(--border);
  }
  .header-actions > *:last-child {
    border-bottom: none;
  }
  .header-action-btn:not(:last-child) {
    border-right: none;
  }
  .header-action-btn,
  .header-icon-link,
  .profile-menu-trigger {
    justify-content: center;
    width: 100%;
    padding: 0.45rem;
  }
  .app-header-text .institution-banner {
    display: inline-flex;
    margin-bottom: 0.75rem;
    max-width: 100%;
  }
  .institution-banner {
    padding: 0.3rem 0.7rem 0.3rem 0.55rem;
    max-width: 100%;
  }
  .institution-banner-text {
    font-size: 0.68rem;
    white-space: normal;
    line-height: 1.35;
  }
  .app-header-title {
    font-size: 1.1rem;
    line-height: 1.3;
    overflow-wrap: break-word;
    word-break: break-word;
    margin-top: 0.15rem;
  }
  .app-header-subtitle {
    font-size: 0.78rem;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .main-content {
    padding: 1rem;
    padding-bottom: 1rem;
  }
  .main-content:has(.books-fab),
  .main-content:has(.users-fab),
  .main-content:has(.transactions-fab) {
    padding-bottom: calc(1rem + var(--fab-clearance));
  }
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  .stat-card {
    padding: 1rem;
  }
  .stat-card .value {
    font-size: 1.5rem;
  }
  .books-grid,
  .users-grid,
  .transactions-grid {
    grid-template-columns: 1fr;
  }
  .books-fab,
  .users-fab,
  .transactions-fab {
    right: max(1.25rem, env(safe-area-inset-right, 0px));
    bottom: max(1.25rem, env(safe-area-inset-bottom, 0px));
  }
  .users-count,
  .books-count,
  .transactions-count {
    margin-bottom: 0.5rem;
  }
  .users-pagination,
  .books-pagination,
  .transactions-pagination {
    margin-bottom: 0.5rem;
  }
}
@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
  .form-row,
  .book-card-details,
  .user-card-details,
  .transaction-card-details {
    grid-template-columns: 1fr;
  }
  .form-actions,
  .books-pagination,
  .users-pagination,
  .transactions-pagination,
  .book-card-actions,
  .user-card-actions {
    flex-direction: column;
  }
  .books-fab,
  .users-fab,
  .transactions-fab {
    right: max(1rem, env(safe-area-inset-right, 0px));
    bottom: max(1rem, env(safe-area-inset-bottom, 0px));
    width: 3.5rem;
    height: 3.5rem;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
  }
  .books-fab-label,
  .users-fab-label,
  .transactions-fab-label {
    display: none;
  }
}
@media (min-width: 769px) {
  .sidebar-backdrop {
    display: none !important;
  }
  .app-header {
    align-items: flex-start;
  }
  .institution-banner {
    width: fit-content;
    max-width: 100%;
  }
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}
.auth-screen {
  height: 100%;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 2vh, 1.25rem);
  overflow-y: auto;
  box-sizing: border-box;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(30, 77, 43, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(212, 175, 55, 0.08) 0%, transparent 45%),
    var(--bg);
}
[data-theme='dark'] .auth-screen {
  background:
    radial-gradient(ellipse at 20% 0%, rgba(45, 107, 60, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(212, 175, 55, 0.06) 0%, transparent 45%),
    var(--bg);
}
.auth-panel {
  width: min(100%, 400px);
  max-height: calc(100dvh - 1.5rem);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 4px);
  box-shadow: var(--shadow);
  overflow: hidden;
  flex-shrink: 0;
}
.auth-panel .brand-hero--auth {
  width: 100%;
  flex-shrink: 0;
  padding: 1.15rem 1.25rem 1rem;
  border-radius: 0;
  box-shadow: none;
}
.auth-panel .brand-monogram--lg {
  width: 2.75rem;
  height: 2.75rem;
  margin-bottom: 0.55rem;
}
.auth-panel .brand-monogram--lg .brand-monogram-text {
  font-size: 0.8rem;
}
.auth-panel .brand-name-highlight--auth {
  font-size: 1.05rem;
  line-height: 1.25;
  margin-bottom: 0.2rem;
}
.auth-panel .brand-app-name--auth {
  font-size: 0.78rem;
  margin-top: 0.1rem;
}
.auth-panel .brand-auth-message {
  font-size: 0.75rem;
  margin-top: 0.4rem;
  line-height: 1.35;
}
.auth-panel-body {
  padding: 1.15rem 1.35rem 1.35rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
.auth-layout {
  width: min(100%, 440px);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.auth-card {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.75rem 2rem 2rem;
  box-shadow: var(--shadow);
}
.auth-card-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--heading);
  margin-bottom: 0.2rem;
}
.auth-card-subheading {
  color: var(--text-muted);
  font-size: 0.8125rem;
  margin-bottom: 1rem;
}
.auth-panel-body .form-group {
  margin-bottom: 0.75rem;
}
@media (max-height: 720px) {
  .auth-panel {
    max-height: calc(100dvh - 1rem);
  }
  .auth-panel .brand-hero--auth {
    padding: 0.75rem 1rem 0.65rem;
  }
  .auth-panel .brand-monogram--lg {
    width: 2.25rem;
    height: 2.25rem;
    margin-bottom: 0.35rem;
  }
  .auth-panel .brand-name-highlight--auth {
    font-size: 0.92rem;
  }
  .auth-panel .brand-auth-message {
    margin-top: 0.25rem;
    font-size: 0.7rem;
  }
  .auth-panel-body {
    padding: 0.9rem 1.1rem 1.1rem;
  }
  .auth-card-heading {
    font-size: 1rem;
  }
  .auth-card-subheading {
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
  }
  .auth-panel-body .form-group {
    margin-bottom: 0.6rem;
  }
}
.text-muted {
  color: var(--text-muted);
  font-size: 0.875rem;
}
.auth-submit {
  width: 100%;
  margin-top: 0.5rem;
}
.form-error {
  color: var(--danger);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
.form-success {
  color: var(--success);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
  padding: 0.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}
.header-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.header-action-btn:hover {
  background: var(--accent-soft);
  color: var(--heading);
}
.header-action-btn:not(:last-child) {
  border-right: 1px solid var(--border);
}
.header-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--heading);
  flex-shrink: 0;
}
.header-action-label {
  line-height: 1;
}
.profile-menu {
  position: relative;
}
.profile-menu-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.profile-menu-trigger:hover {
  background: var(--accent-soft);
  color: var(--heading);
}
.profile-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 0.35rem;
  z-index: 100;
}
.profile-menu-user {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.25rem;
}
.profile-menu-user strong {
  display: block;
  font-size: 0.875rem;
  color: var(--heading);
}
.profile-menu-user span {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}
.profile-menu-dropdown button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.85rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text);
  font-size: 0.875rem;
  cursor: pointer;
}
.profile-menu-dropdown button:hover {
  background: var(--accent-soft);
  color: var(--heading);
}
.profile-menu-dropdown button.danger {
  color: var(--danger);
}
.profile-menu-dropdown button.danger:hover {
  background: rgba(220, 38, 38, 0.08);
}
.profile-card {
  max-width: 560px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}
.profile-intro {
  margin-bottom: 1.25rem;
}
.settings-modal-desc {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
@media (max-width: 640px) {
  .header-action-label {
    display: none;
  }
  .header-action-btn {
    padding: 0.45rem;
  }
  .profile-menu-trigger {
    padding: 0.45rem;
  }
}
.form-hint {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
.password-requirements {
  list-style: none;
  margin: -0.35rem 0 1rem;
  padding: 0.65rem 0.75rem;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.password-requirement {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}
.password-requirement + .password-requirement {
  margin-top: 0.35rem;
}
.password-requirement-icon {
  flex-shrink: 0;
  width: 1rem;
  text-align: center;
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--text-muted);
}
.password-requirement.met {
  color: var(--success);
}
.password-requirement.met .password-requirement-icon {
  color: var(--success);
  font-weight: 700;
}
.tab-bar {
  display: inline-flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  padding: 0.35rem;
  margin-bottom: 1.5rem;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: 12px;
  width: fit-content;
  max-width: 100%;
}
.tab {
  background: transparent;
  color: var(--text-muted);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tab:hover:not(.active) {
  background: var(--surface);
  color: var(--text);
}
.tab.active {
  background: var(--primary);
  color: var(--primary-fg);
  box-shadow: var(--shadow-sm);
}
.tab-panel {
  margin-top: 0;
}
.tab-panel .table-wrap {
  margin-top: 0;
}
.tab-panel .text-muted,
.tab-panel .loading {
  margin-top: 0.25rem;
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.data-table th {
  color: var(--text-muted);
  font-weight: 600;
}
.table-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.section-block {
  margin-bottom: 2rem;
}
.section-block h3 {
  margin-bottom: 0.75rem;
  color: var(--heading);
}
.sidebar-user {
  margin-bottom: 0.75rem;
}
.sidebar-user-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sidebar-text);
}
.sidebar-user-role {
  display: block;
  font-size: 0.75rem;
  color: var(--sidebar-text-muted);
}
.sidebar-logout {
  width: 100%;
  margin-bottom: 0.75rem;
}
.welcome-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.info-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.capitalize {
  text-transform: capitalize;
}
.badge-muted {
  background: var(--surface-hover);
  color: var(--text-muted);
}
.fab-group {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.users-fab-alt {
  background: var(--accent-light);
  color: white;
}
.data-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.toolbar {
  margin-bottom: 1rem;
}
.rules-banner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
.rules-banner p { margin: 0; }
.rules-page {
  max-width: 52rem;
}
.rules-intro {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
}
.rules-intro p { margin: 0; }
.rules-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.rules-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
}
.rules-section-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--sidebar-heading, var(--text));
}
.rules-list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}
.rules-list li { line-height: 1.5; }
.user-borrow-groups {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.user-borrow-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}
.user-borrow-group-title {
  margin: 0;
  font-size: 0.9375rem;
}
.user-borrow-count {
  white-space: nowrap;
}
.header-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text);
  font-size: 1.1rem;
}
.header-icon-link:hover { background: var(--surface-hover); }
.notification-bell-wrap { position: relative; }
.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: #dc3545;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notification-list { display: flex; flex-direction: column; gap: 0.75rem; }
.notification-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.875rem 1rem;
}
.notification-item.unread {
  border-left: 3px solid var(--accent, #2563eb);
  background: var(--surface-hover);
}
.notification-item-title { font-weight: 600; margin: 0 0 0.25rem; }
.notification-item-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.book-status-available { color: #198754; font-weight: 500; }
.book-status-owned { color: #dc2626; font-weight: 600; }
.book-status-limit { color: #dc2626; font-weight: 600; font-size: 0.875rem; }
.book-status-muted { color: var(--text-muted); font-size: 0.875rem; }
.book-status-unavailable { color: var(--text-muted); }
.extension-summary {
  background: var(--surface-hover);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
.extension-summary p { margin: 0.35rem 0; }
[data-theme="dark"] .book-status-owned,
[data-theme="dark"] .book-status-limit { color: #f87171; }
`;

