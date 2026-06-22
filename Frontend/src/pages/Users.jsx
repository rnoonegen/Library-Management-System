import { useEffect, useState } from 'react';

import { api } from 'services/api';

import { useModal } from 'components/common/Modal';

import UsersContent from 'components/users/UsersContent';

import UserFormModal from 'components/users/UserFormModal';

import UserBorrowHistoryModal from 'components/users/UserBorrowHistoryModal';

import { useActionDialog } from 'hooks/useActionDialog';

import { PAGE_SIZE, buildPageNumbers } from 'utils/pagination';



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

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);

  const modal = useModal();

  const viewModal = useModal();

  const { askConfirm, ActionDialog } = useActionDialog();

  const [viewUser, setViewUser] = useState(null);

  const [userBorrows, setUserBorrows] = useState([]);

  const [historyLoading, setHistoryLoading] = useState(false);



  const loadUsers = (pageNum = page, searchTerm = search, role = roleFilter) => {

    setLoading(true);

    const params = { page: pageNum, limit: PAGE_SIZE };

    const trimmed = searchTerm.trim();

    if (trimmed) params.search = trimmed;

    if (role && role !== 'all') params.role = role;



    return api

      .getUsers(params)

      .then((result) => {

        setUsers(result.users ?? []);

        setTotal(result.total ?? 0);

        setTotalPages(result.totalPages ?? 1);

        if (result.page && result.page !== pageNum) setPage(result.page);

      })

      .catch((err) => setError(err.message))

      .finally(() => setLoading(false));

  };



  useEffect(() => {

    loadUsers(page, search, roleFilter);

  }, [page, search, roleFilter]);



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



  const handleSubmit = async (formData) => {
    if (editingId) {
      await api.updateUser(editingId, formData);
    } else {
      await api.createUser({
        role: formData.role,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        joined_date: formData.joined_date,
        password: formData.password,
      });
    }
    modal.close();
    loadUsers();
  };



  const handleDelete = async (id) => {
    const confirmed = await askConfirm({
      title: 'Delete user',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.deleteUser(id);
      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };



  const handleRoleChangeInForm = async (role) => {

    const { code } = await api.getNextUserCode(role);

    setForm({ ...form, role, username: code });

  };



  const { startPage, endPage, pageNumbers } = buildPageNumbers(page, totalPages);

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const end = Math.min(page * PAGE_SIZE, total);



  return (

    <div className="page users-page">

      {error && <div className="error-banner">{error}</div>}



      <UsersContent

        loading={loading}

        users={users}

        total={total}

        start={start}

        end={end}

        roleFilter={roleFilter}

        search={search}

        page={page}

        totalPages={totalPages}

        startPage={startPage}

        endPage={endPage}

        pageNumbers={pageNumbers}

        onSearchChange={(v) => { setSearch(v); setPage(1); }}

        onRoleChange={(role) => { setRoleFilter(role); setPage(1); }}

        onPageChange={setPage}

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



      <button
        type="button"
        className="users-fab"
        onClick={() => openCreate('student')}
        aria-label="Add user"
      >
        <span className="users-fab-icon" aria-hidden="true">+</span>
        <span className="users-fab-label">User</span>
      </button>

      <ActionDialog />

    </div>

  );

}


