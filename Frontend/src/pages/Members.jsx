import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal, { useModal } from '../components/Modal';

const emptyMember = {
  name: '',
  email: '',
  phone: '',
  address: '',
  membership_date: new Date().toISOString().split('T')[0],
  status: 'active',
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const modal = useModal();

  const loadMembers = () => {
    setLoading(true);
    api
      .getMembers()
      .then(setMembers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const openCreate = () => {
    setForm({ ...emptyMember, membership_date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    modal.open();
  };

  const openEdit = (member) => {
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      address: member.address || '',
      membership_date: member.membership_date?.split('T')[0] || member.membership_date,
      status: member.status,
    });
    setEditingId(member.id);
    modal.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateMember(editingId, form);
      } else {
        await api.createMember(form);
      }
      modal.close();
      loadMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this member?')) return;
    try {
      await api.deleteMember(id);
      loadMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadge = (status) => {
    if (status === 'active') return <span className="badge badge-success">Active</span>;
    return <span className="badge badge-danger">Inactive</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Members</h2>
          <p>Manage library members</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Member
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="data-card">
        {loading ? (
          <div className="loading">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="empty-state">No members yet. Add your first member.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.phone || '—'}</td>
                    <td>{member.membership_date?.split('T')[0] || member.membership_date}</td>
                    <td>{statusBadge(member.status)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-secondary" onClick={() => openEdit(member)}>
                          Edit
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(member.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.isOpen && (
        <Modal title={editingId ? 'Edit Member' : 'Add Member'} onClose={modal.close}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Membership Date *</label>
                <input
                  type="date"
                  value={form.membership_date}
                  onChange={(e) => setForm({ ...form, membership_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={modal.close}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
