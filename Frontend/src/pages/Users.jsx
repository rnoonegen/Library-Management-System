import { useEffect, useState } from 'react';
import { api } from 'services/api';
import { useModal } from 'components/common/Modal';
import UsersContent from 'components/users/UsersContent';
import UserFormModal from 'components/users/UserFormModal';
import UserBorrowHistoryModal from 'components/users/UserBorrowHistoryModal';

const PAGE_SIZE = 12;

const emptyForm = {
  role: 'student',
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  joined_date: new Date().toISOString().split('T')[0],
  status: 'active',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const modal = useModal();
  const viewModal = useModal();
  const [viewUser, setViewUser] = useState(null);
  const [userBorrows, setUserBorrows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    api
      .getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = async (role) => {
    try {
      const { code } = await api.getNextUserCode(role);
      setForm({ ...emptyForm, role, username: code, password: '' });
      setEditingId(null);
      modal.open();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (user) => {
    setForm({
      role: user.role,
      username: user.user_code || user.username,
      password: '',
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      joined_date: user.joined_date?.split('T')[0] || user.joined_date,
      status: user.status,
    });
    setEditingId(user.id);
    modal.open();
  };

  const openView = async (user) => {
    setViewUser(user);
    setUserBorrows([]);
    setHistoryLoading(true);
    viewModal.open();
    try {
      const data = await api.getUserBorrows(user.id);
      setViewUser(data.user || user);
      setUserBorrows(data.borrows ?? []);
    } catch (err) {
      setError(err.message);
      viewModal.close();
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateUser(editingId, form);
      } else {
        await api.createUser({
          role: form.role,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          joined_date: form.joined_date,
          password: form.password,
        });
      }
      modal.close();
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const searchTerm = search.trim().toLowerCase();
  const roleFiltered = roleFilter === 'all'
    ? users
    : users.filter((u) => u.role === roleFilter);
  const filteredUsers = searchTerm
    ? roleFiltered.filter((m) =>
        `${m.name} ${m.user_code || m.username}`.toLowerCase().includes(searchTerm),
      )
    : roleFiltered;

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleRoleChangeInForm = async (role) => {
    const { code } = await api.getNextUserCode(role);
    setForm({ ...form, role, username: code });
  };

  return (
    <div className="page users-page">
      {error && <div className="error-banner">{error}</div>}

      <UsersContent
        loading={loading}
        filteredUsers={filteredUsers}
        paginatedUsers={paginatedUsers}
        roleFilter={roleFilter}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onRoleChange={(role) => { setRoleFilter(role); setPage(1); }}
        onEdit={openEdit}
        onDelete={handleDelete}
        onView={openView}
      />

      <UserBorrowHistoryModal
        isOpen={viewModal.isOpen}
        user={viewUser}
        borrows={userBorrows}
        loading={historyLoading}
        onClose={viewModal.close}
      />

      <UserFormModal
        isOpen={modal.isOpen}
        editingId={editingId}
        form={form}
        onClose={modal.close}
        onSubmit={handleSubmit}
        setForm={setForm}
        onRoleChange={handleRoleChangeInForm}
      />

      <button type="button" className="users-fab" onClick={() => openCreate('student')}>
        + User
      </button>
    </div>
  );
}



