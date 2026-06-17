import Button from 'components/common/Button';
import FormField from 'components/common/FormField';

export default function UserProfileForm({
  user,
  form,
  error,
  success,
  saving,
  isStudent,
  isTeacher,
  onSubmit,
  setForm,
}) {
  return (
    <div className="profile-card">
      <p className="text-muted profile-intro">
        Keep your contact details up to date so the library can reach you.
      </p>

      <form onSubmit={onSubmit}>
        <div className="form-row">
          <FormField
            id="username"
            label="User ID"
            value={user?.username || ''}
            readOnly
          />
          <FormField
            id="role"
            label="Role"
            value={user?.role || ''}
            readOnly
          />
        </div>

        <FormField
          id="name"
          label="Full name"
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
          label="Mobile number"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="e.g. 9876543210"
        />
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            rows={3}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Optional"
          />
        </div>

        {isStudent && (
          <FormField
            id="grade_level"
            label="Grade / Class"
            value={form.grade_level}
            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
            placeholder="e.g. 10th, B.Tech CSE"
          />
        )}

        {isTeacher && (
          <FormField
            id="department"
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="e.g. Mathematics, Science"
          />
        )}

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}

