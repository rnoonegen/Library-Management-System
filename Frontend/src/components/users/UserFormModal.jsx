import Modal from 'components/common/Modal';
import Button from 'components/common/Button';
import FormField from 'components/common/FormField';

export default function UserFormModal({
  isOpen,
  editingId,
  form,
  onClose,
  onSubmit,
  setForm,
  onRoleChange,
}) {
  if (!isOpen) return null;

  return (
    <Modal title={editingId ? 'Edit User' : 'Add User'} onClose={onClose}>
      <form onSubmit={onSubmit}>
        {!editingId && (
          <>
            <div className="form-group">
              <label>Role</label>
              <select
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
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
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
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">
            {editingId ? 'Save' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

