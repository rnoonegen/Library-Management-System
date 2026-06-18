import { lazy, Suspense } from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from 'components/auth/ProtectedRoute';

import MainLayout from 'layouts/MainLayout';

import Login from 'pages/Login';

import ChangePassword from 'pages/ChangePassword';

const Dashboard = lazy(() => import('pages/Dashboard'));

const Books = lazy(() => import('pages/Books'));

const Users = lazy(() => import('pages/Users'));

const Transactions = lazy(() => import('pages/Transactions'));

const Requests = lazy(() => import('pages/Requests'));

const UserBooks = lazy(() => import('pages/UserBooks'));

const UserRequests = lazy(() => import('pages/UserRequests'));

const UserBorrows = lazy(() => import('pages/UserBorrows'));

const UserProfile = lazy(() => import('pages/UserProfile'));

const UserNotifications = lazy(() => import('pages/UserNotifications'));

const UserRules = lazy(() => import('pages/UserRules'));



function PageLoader() {

  return (

    <div className="auth-screen">

      <div className="loading">Loading...</div>

    </div>

  );

}



export default function AppRoutes() {
  return (

    <Suspense fallback={<PageLoader />}>

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

              <MainLayout variant="user" />

            </ProtectedRoute>

          }

        >

          <Route index element={<Navigate to="/user/books" replace />} />

          <Route path="books" element={<UserBooks />} />

          <Route path="requests" element={<UserRequests />} />

          <Route path="borrows" element={<UserBorrows />} />

          <Route path="notifications" element={<UserNotifications />} />

          <Route path="rules" element={<UserRules />} />

          <Route path="profile" element={<UserProfile />} />

        </Route>



        <Route

          path="/"

          element={

            <ProtectedRoute roles={['admin']}>

              <MainLayout variant="admin" />

            </ProtectedRoute>

          }

        >

          <Route index element={<Dashboard />} />

          <Route path="books" element={<Books />} />

          <Route path="users" element={<Users />} />

          <Route path="transactions" element={<Transactions />} />

          <Route path="requests" element={<Requests />} />

          <Route path="notifications" element={<UserNotifications />} />

        </Route>



        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>

    </Suspense>

  );

}


