import { useState } from 'react';
import { useAuth } from 'context/AuthContext';
import { api } from 'services/api';
import Button from 'components/common/Button';
import FormField from 'components/common/FormField';

import { validatePassword } from 'utils/passwordValidation';

export default function ChangePasswordForm({ onSuccess, onCancel, forced = false }) {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.changePassword({ currentPassword, newPassword });
      await refreshUser();
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        id="settings-username"
        label="Username"
        value={user?.username || ''}
        readOnly
        hint="Username cannot be changed here"
      />
      <FormField
        id="settings-currentPassword"
        label="Current password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />
      <FormField
        id="settings-newPassword"
        label="New password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <FormField
        id="settings-confirmPassword"
        label="Confirm new password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {forced && (
        <p className="form-hint">You must change your password before continuing.</p>
      )}

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <div className="form-actions">
        {onCancel && !forced && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Update password'}
        </Button>
      </div>
    </form>
  );
}

