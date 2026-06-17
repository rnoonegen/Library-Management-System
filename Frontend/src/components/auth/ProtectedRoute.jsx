import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/' : '/user/books';
    return <Navigate to={fallback} replace />;
  }

  return children;
}

