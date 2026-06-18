import SearchBar from 'components/common/SearchBar';
import Button from 'components/common/Button';
import StatusBadge from 'components/common/StatusBadge';

export default function UsersContent({
  loading,
  filteredUsers,
  paginatedUsers,
  roleFilter,
  search,
  onSearchChange,
  onRoleChange,
  onEdit,
  onDelete,
  onView,
}) {
  return (
    <>
      <div className="users-toolbar">
        <SearchBar
          className="users-search"
          value={search}
          onChange={onSearchChange}
          placeholder="Search by name or ID..."
        />
        <div className="tab-bar">
          {['all', 'teacher', 'student'].map((role) => (
            <button
              key={role}
              type="button"
              className={roleFilter === role ? 'tab active' : 'tab'}
              onClick={() => onRoleChange(role)}
            >
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="users-empty">
          <strong>No users found</strong>
          <p>Add a teacher or student to get started.</p>
        </div>
      ) : (
        <div className="users-grid">
          {paginatedUsers.map((user) => (
            <article key={user.id} className="user-card">
              <div className="user-card-top">
                <h3 className="user-card-title">{user.name}</h3>
                <StatusBadge status={user.status} />
              </div>
              <dl className="user-card-details">
                <div className="user-detail">
                  <dt>ID</dt>
                  <dd>{user.user_code || user.username}</dd>
                </div>
                <div className="user-detail">
                  <dt>Role</dt>
                  <dd className="capitalize">{user.role}</dd>
                </div>
                <div className="user-detail">
                  <dt>Email</dt>
                  <dd>{user.email || '—'}</dd>
                </div>
                <div className="user-detail">
                  <dt>Fine</dt>
                  <dd>₹{Number(user.outstanding_fine || 0)}</dd>
                </div>
              </dl>
              <div className="user-card-actions">
                <Button variant="secondary" onClick={() => onView(user)}>View</Button>
                <Button variant="secondary" onClick={() => onEdit(user)}>Edit</Button>
                <Button variant="danger" onClick={() => onDelete(user.id)}>Delete</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

