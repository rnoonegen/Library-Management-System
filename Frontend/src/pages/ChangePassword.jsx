import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import ChangePasswordForm from 'components/auth/ChangePasswordForm';
import AppBrand from 'components/common/AppBrand';

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleSuccess() {
    navigate(user?.role === 'admin' ? '/' : '/user/books', { replace: true });
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <AppBrand
          variant="auth"
          title="Change password"
          subtitle={
            user?.mustChangePassword
              ? 'Set a new password before continuing.'
              : 'Update your account password.'
          }
        />
        <div className="auth-panel-body">
          <ChangePasswordForm
            forced={user?.mustChangePassword}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
