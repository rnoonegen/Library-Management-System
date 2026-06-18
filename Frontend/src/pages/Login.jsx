import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import Button from 'components/common/Button';
import AppBrand from 'components/common/AppBrand';
import FormField from 'components/common/FormField';

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function redirectAfterAuth(profile) {
    if (profile.mustChangePassword) {
      navigate('/change-password', { replace: true });
      return;
    }
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    navigate(profile.role === 'admin' ? '/' : '/user/books', { replace: true });
  }

  useEffect(() => {
    if (loading || !user) return;
    redirectAfterAuth(user);
  }, [user, loading, navigate, from]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const profile = await login(username.trim(), password);
      redirectAfterAuth(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <AppBrand variant="auth" tagline="Sign in to your library account" />

        <div className="auth-panel-body">
          <h2 className="auth-card-heading">Welcome back</h2>
          <p className="auth-card-subheading">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>
            <FormField
              id="username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin, T0001, S0001"
              required
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="form-error">{error}</p>}

            <Button type="submit" variant="primary" disabled={submitting} className="auth-submit">
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
