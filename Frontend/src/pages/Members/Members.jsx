import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Modal, { useModal } from "../../components/ui/Modal";
import SearchBar from "../../components/ui/SearchBar";

const PAGE_SIZE = 10;

const emptyMember = {
  name: "",
  email: "",
  phone: "",
  address: "",
  membership_date: new Date().toISOString().split("T")[0],
  status: "active",
};

export default function Members() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
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
    setForm({
      ...emptyMember,
      membership_date: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
    modal.open();
  };

  const openEdit = (member) => {
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      address: member.address || "",
      membership_date:
        member.membership_date?.split("T")[0] || member.membership_date,
      status: member.status,
    });
    setEditingId(member.id);
    modal.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
    if (!confirm("Delete this member?")) return;
    try {
      await api.deleteMember(id);
      loadMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadge = (status) => {
    if (status === "active")
      return <span className="badge badge-success">Active</span>;
    return <span className="badge badge-danger">Inactive</span>;
  };

  const searchTerm = search.trim().toLowerCase();
  const filteredMembers = searchTerm
    ? members.filter((member) => member.name.toLowerCase().includes(searchTerm))
    : members;
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const start =
    filteredMembers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, filteredMembers.length);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(1, safePage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  for (let i = startPage; i <= endPage; i += 1) {
    pageNumbers.push(i);
  }

  return (
    <div className="page members-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="members-toolbar">
        <SearchBar
          className="members-search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search members by name..."
        />
        {!loading && filteredMembers.length > 0 && (
          <span className="members-summary">
            Showing {start}-{end} of {filteredMembers.length} members
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="members-empty">
          <div className="empty-state-icon" aria-hidden="true">
            👥
          </div>
          <strong>No members yet</strong>
          <p>Add your first member to start lending books.</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="members-empty">
          <div className="empty-state-icon" aria-hidden="true">
            🔍
          </div>
          <strong>No members found</strong>
          <p>Try a different name or clear the search.</p>
        </div>
      ) : (
        <>
          <div className="members-grid">
            {paginatedMembers.map((member) => (
              <article key={member.id} className="member-card">
                <div className="member-card-top">
                  <h3 className="member-card-title">{member.name}</h3>
                  {statusBadge(member.status)}
                </div>

                <dl className="member-card-details">
                  <div className="member-detail">
                    <dt>Email</dt>
                    <dd>{member.email}</dd>
                  </div>
                  <div className="member-detail">
                    <dt>Phone</dt>
                    <dd>{member.phone || "—"}</dd>
                  </div>
                  <div className="member-detail member-detail-full">
                    <dt>Address</dt>
                    <dd>{member.address || "—"}</dd>
                  </div>
                  <div className="member-detail">
                    <dt>Joined</dt>
                    <dd>
                      {member.membership_date?.split("T")[0] ||
                        member.membership_date}
                    </dd>
                  </div>
                  <div className="member-detail">
                    <dt>Outstanding Fine</dt>
                    <dd
                      className={
                        member.outstanding_fine > 0
                          ? "fine-amount-due"
                          : undefined
                      }
                    >
                      ₹{Number(member.outstanding_fine || 0)}
                    </dd>
                  </div>
                </dl>

                <div className="member-card-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => openEdit(member)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(member.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="members-pagination" aria-label="Members pagination">
              <button
                type="button"
                className="btn-secondary pagination-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <div className="pagination-pages">
                {startPage > 1 && (
                  <>
                    <button
                      type="button"
                      className="pagination-page"
                      onClick={() => setPage(1)}
                    >
                      1
                    </button>
                    {startPage > 2 && (
                      <span className="pagination-ellipsis">…</span>
                    )}
                  </>
                )}
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`pagination-page ${n === safePage ? "active" : ""}`}
                    onClick={() => setPage(n)}
                    aria-current={n === safePage ? "page" : undefined}
                  >
                    {n}
                  </button>
                ))}
                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && (
                      <span className="pagination-ellipsis">…</span>
                    )}
                    <button
                      type="button"
                      className="pagination-page"
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                className="btn-secondary pagination-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}

      {modal.isOpen && (
        <Modal
          title={editingId ? "Edit Member" : "Add Member"}
          onClose={modal.close}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Membership Date *</label>
                <input
                  type="date"
                  value={form.membership_date}
                  onChange={(e) =>
                    setForm({ ...form, membership_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
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
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={modal.close}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <button
        type="button"
        className="members-fab"
        onClick={openCreate}
        aria-label="Add member"
      >
        <span className="members-fab-icon" aria-hidden="true">
          +
        </span>
        <span className="members-fab-label">Add Member</span>
      </button>
    </div>
  );
}
