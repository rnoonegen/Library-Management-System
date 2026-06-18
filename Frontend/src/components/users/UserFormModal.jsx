import { useState } from 'react';
import Modal from 'components/common/Modal';
import Button from 'components/common/Button';
import FormField from 'components/common/FormField';
import PasswordRequirements from 'components/common/PasswordRequirements';
import { validatePassword } from 'utils/passwordValidation';

export default function UserFormModal({
  isOpen,
  editingId,
  form,
  onClose,
  onSubmit,
  setForm,
  onRoleChange,
}) {
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  function handleClose() {
    setFormError('');
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!editingId) {
      const passwordError = validatePassword(form.password);
      if (passwordError) {
        setFormError(passwordError);
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      setFormError('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={editingId ? 'Edit User' : 'Add User'} onClose={handleClose}>
      <form onSubmit={handleSubmit} noValidate>
        {!editingId && (
          <>
            <div className="form-group">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => onRoleChange(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <FormField
              id="username"
              label="Username / ID"
              value={form.username}
              readOnly
              hint="Auto-generated ID"
            />
            <FormField
              id="password"
              label="Initial password"
              type="password"
              value={form.password}
              onChange={(e) => {
                setFormError('');
                setForm({ ...form, password: e.target.value });
              }}
              required
            />
            <PasswordRequirements password={form.password} />
          </>
        )}
        <FormField
          id="name"
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <FormField
          id="phone"
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {editingId && (
          <div className="form-group">
            <label htmlFor="user-status">Status</label>
            <select
              id="user-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        {formError && <p className="form-error">{formError}</p>}

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingId ? 'Save' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
