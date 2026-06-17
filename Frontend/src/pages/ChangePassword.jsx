import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import ChangePasswordForm from 'components/auth/ChangePasswordForm';

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleSuccess() {
    navigate(user?.role === 'admin' ? '/' : '/user/books', { replace: true });
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>Change password</h1>
          <p>
            {user?.mustChangePassword
              ? 'Set a new password before continuing.'
              : 'Update your account password.'}
          </p>
        </div>
        <ChangePasswordForm
          forced={user?.mustChangePassword}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}

