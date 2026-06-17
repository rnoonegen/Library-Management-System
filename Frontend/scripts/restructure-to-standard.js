/**
 * DEPRECATED — one-time migration from features/shared layout (already applied).
 * Kept for reference only; do not run on the current codebase.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(rel, content) {
  const file = path.join(SRC, rel);
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
  console.log('wrote', rel);
}

function read(rel) {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

function fixImports(content) {
  return content
    .replace(/from 'shared\/api\/client'/g, "from 'services/api'")
    .replace(/from "shared\/api\/client"/g, 'from "services/api"')
    .replace(/from 'shared\/components\/ui\/(\w+)'/g, "from 'components/$1/$1'")
    .replace(/from 'shared\/hooks\/useDbMode'/g, "from 'hooks/useDbMode'")
    .replace(/from 'features\/auth\/context\/AuthContext'/g, "from 'context/AuthContext'")
    .replace(/from 'features\/auth\/components\/ChangePasswordForm'/g, "from 'components/ChangePasswordForm/ChangePasswordForm'")
    .replace(/from '\.\/ChangePasswordForm'/g, "from 'components/ChangePasswordForm/ChangePasswordForm'")
    .replace(/from 'styles\/theme\/ThemeModeContext'/g, "from 'context/ThemeContext'")
    .replace(/from 'styles\/theme\/appGlobalCss'/g, "from 'assets/styles/appGlobalCss'")
    .replace(/from 'styles\/theme\/valmikiTheme'/g, "from 'assets/styles/valmikiTheme'")
    .replace(/from '\.\/HeaderIcons'/g, "from 'components/HeaderIcons/HeaderIcons'");
}

const uiComponents = [
  'Button', 'FormField', 'Modal', 'SearchBar', 'PageHeader',
  'StatusBadge', 'ProfileMenu', 'HeaderIcons', 'HeaderActionButton',
];

uiComponents.forEach((name) => {
  const content = read(`shared/components/ui/${name}.jsx`);
  write(`components/${name}/${name}.jsx`, content.replace(/from '\.\/HeaderIcons'/g, "from 'components/HeaderIcons/HeaderIcons'"));
});

write('components/ChangePasswordForm/ChangePasswordForm.jsx', fixImports(read('features/auth/components/ChangePasswordForm.jsx')));
write('components/SettingsModal/SettingsModal.jsx', fixImports(
  read('features/auth/components/SettingsModal.jsx').replace(
    "import ChangePasswordForm from './ChangePasswordForm';",
    "import ChangePasswordForm from 'components/ChangePasswordForm/ChangePasswordForm';",
  ),
));
write('components/ProtectedRoute/ProtectedRoute.jsx', fixImports(read('shared/components/layout/ProtectedRoute.jsx')));

let mainLayout = fixImports(read('shared/components/layout/AppLayout.jsx'));
mainLayout = mainLayout
  .replace("import SettingsModal from 'features/auth/components/SettingsModal';", "import SettingsModal from 'components/SettingsModal/SettingsModal';")
  .replace('export default function AppLayout', 'export default function MainLayout');
write('layouts/MainLayout.jsx', mainLayout);

write('services/api.js', read('shared/api/client.js'));
write('hooks/useDbMode.js', fixImports(read('shared/hooks/useDbMode.js')));
write('context/AuthContext.jsx', fixImports(read('features/auth/context/AuthContext.jsx')));

let themeCtx = read('styles/theme/ThemeModeContext.jsx')
  .replace(/from 'styles\/theme\/appGlobalCss'/g, "from 'assets/styles/appGlobalCss'")
  .replace(/from 'styles\/theme\/valmikiTheme'/g, "from 'assets/styles/valmikiTheme'");
write('context/ThemeContext.jsx', themeCtx);
write('assets/styles/appGlobalCss.js', read('styles/theme/appGlobalCss.js'));
write('assets/styles/valmikiTheme.js', read('styles/theme/valmikiTheme.js'));

const pages = [
  ['features/auth/pages/LoginPage.jsx', 'pages/Login.jsx', 'LoginPage', 'Login'],
  ['features/auth/pages/ChangePasswordPage.jsx', 'pages/ChangePassword.jsx', 'ChangePasswordPage', 'ChangePassword'],
  ['features/admin/pages/DashboardPage.jsx', 'pages/Dashboard.jsx', 'DashboardPage', 'Dashboard'],
  ['features/admin/pages/BooksPage.jsx', 'pages/Books.jsx', 'BooksPage', 'Books'],
  ['features/admin/pages/UsersPage.jsx', 'pages/Users.jsx', 'UsersPage', 'Users'],
  ['features/admin/pages/TransactionsPage.jsx', 'pages/Transactions.jsx', 'TransactionsPage', 'Transactions'],
  ['features/admin/pages/RequestsPage.jsx', 'pages/Requests.jsx', 'RequestsPage', 'Requests'],
  ['features/user/pages/BooksPage.jsx', 'pages/UserBooks.jsx', 'BooksPage', 'UserBooks'],
  ['features/user/pages/RequestsPage.jsx', 'pages/UserRequests.jsx', 'RequestsPage', 'UserRequests'],
  ['features/user/pages/BorrowsPage.jsx', 'pages/UserBorrows.jsx', 'BorrowsPage', 'UserBorrows'],
  ['features/user/pages/ProfilePage.jsx', 'pages/UserProfile.jsx', 'ProfilePage', 'UserProfile'],
];

pages.forEach(([src, dest, oldName, newName]) => {
  let content = fixImports(read(src));
  if (oldName !== newName) {
    content = content.replace(`function ${oldName}`, `function ${newName}`);
    content = content.replace(`ChangePasswordForm from 'features/auth/components/ChangePasswordForm'`, "ChangePasswordForm from 'components/ChangePasswordForm/ChangePasswordForm'");
  }
  write(dest, content);
});

write('routes/Routes.jsx', `import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from 'components/ProtectedRoute/ProtectedRoute';
import MainLayout from 'layouts/MainLayout';
import Login from 'pages/Login';
import ChangePassword from 'pages/ChangePassword';
import Dashboard from 'pages/Dashboard';
import Books from 'pages/Books';
import Users from 'pages/Users';
import Transactions from 'pages/Transactions';
import Requests from 'pages/Requests';
import UserBooks from 'pages/UserBooks';
import UserRequests from 'pages/UserRequests';
import UserBorrows from 'pages/UserBorrows';
import UserProfile from 'pages/UserProfile';
import { useDbMode } from 'hooks/useDbMode';

export default function AppRoutes() {
  const dbMode = useDbMode();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute roles={['teacher', 'student']}>
            <MainLayout dbMode={dbMode} variant="user" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/books" replace />} />
        <Route path="books" element={<UserBooks />} />
        <Route path="requests" element={<UserRequests />} />
        <Route path="borrows" element={<UserBorrows />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute roles={['admin']}>
            <MainLayout dbMode={dbMode} variant="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="users" element={<Users />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="requests" element={<Requests />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
`);

write('App.jsx', `import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'context/AuthContext';
import { ThemeModeProvider } from 'context/ThemeContext';
import AppRoutes from 'routes/Routes';

export default function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeModeProvider>
  );
}
`);

write('index.jsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`);

console.log('Done. Remove old folders: app, features, shared, styles');
