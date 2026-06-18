import SearchBar from 'components/common/SearchBar';

import Button from 'components/common/Button';

import StatusBadge from 'components/common/StatusBadge';

import Pagination from 'components/common/Pagination';



export default function UsersContent({

  loading,

  users,

  total,

  start,

  end,

  roleFilter,

  search,

  page,

  totalPages,

  startPage,

  endPage,

  pageNumbers,

  onSearchChange,

  onRoleChange,

  onPageChange,

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

      ) : users.length === 0 ? (

        <div className="users-empty">

          <strong>No users found</strong>

          <p>Add a teacher or student to get started.</p>

        </div>

      ) : (

        <>

          <p className="text-muted users-count">

            Showing {start}–{end} of {total}

          </p>

          <div className="users-grid">

            {users.map((user) => (

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

          <Pagination

            page={page}

            totalPages={totalPages}

            startPage={startPage}

            endPage={endPage}

            pageNumbers={pageNumbers}

            onPageChange={onPageChange}

            className="users-pagination"

          />

        </>

      )}

    </>

  );

}


