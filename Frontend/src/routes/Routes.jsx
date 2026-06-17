import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from 'components/auth/ProtectedRoute';
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


