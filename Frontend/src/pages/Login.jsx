import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import Button from 'components/common/Button';
import FormField from 'components/common/FormField';

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (user.mustChangePassword) {
      navigate('/change-password', { replace: true });
      return;
    }
    navigate(user.role === 'admin' ? '/' : '/user/books', { replace: true });
  }, [user, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const profile = await login(username.trim(), password);
      if (profile.mustChangePassword) {
        navigate('/change-password', { replace: true });
        return;
      }
      navigate(profile.role === 'admin' ? '/' : '/user/books', { replace: true });
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
      <div className="auth-card">
        <div className="auth-brand">
          <span aria-hidden="true">📖</span>
          <h1>Library MS</h1>
          <p>Sign in to continue</p>
        </div>

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
  );
}

