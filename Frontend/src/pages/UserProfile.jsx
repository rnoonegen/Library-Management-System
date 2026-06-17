import { useEffect, useState } from 'react';
import { useAuth } from 'context/AuthContext';
import { api } from 'services/api';
import UserProfileForm from 'components/users/UserProfileForm';

export default function UserProfile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    grade_level: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshUser()
      .then((profile) => {
        setForm({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          grade_level: profile.gradeLevel || '',
          department: profile.department || '',
        });
      })
      .catch((err) => setError(err.message));
  }, [refreshUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.updateProfile(form);
      await refreshUser();
      setSuccess('Profile saved successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="page">
      <UserProfileForm
        user={user}
        form={form}
        error={error}
        success={success}
        saving={saving}
        isStudent={isStudent}
        isTeacher={isTeacher}
        onSubmit={handleSubmit}
        setForm={setForm}
      />
    </div>
  );
}


