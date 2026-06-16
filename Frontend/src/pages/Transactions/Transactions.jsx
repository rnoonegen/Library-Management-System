import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Modal, { useModal } from "../../components/ui/Modal";
import SearchBar from "../../components/ui/SearchBar";

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "borrowed", label: "Borrowed" },
  { id: "overdue", label: "Overdue" },
  { id: "returned", label: "Returned" },
];

function openDatePicker(e) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // Ignore browsers/contexts that block programmatic picker opening.
  }
}

const datePickerProps = {
  inputMode: "none",
  onKeyDown: (e) => e.preventDefault(),
  onClick: openDatePicker,
};

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDate(value) {
  return value?.split("T")[0] || value || "";
}

function formatFine(amount) {
  return `₹${Number(amount || 0)}`;
}

const emptyBorrow = {
  book_id: "",
  member_id: "",
  borrow_date: new Date().toISOString().split("T")[0],
  due_date: addDays(new Date().toISOString().split("T")[0], 14),
  daily_fine_amount: 1,
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyBorrow);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const modal = useModal();

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getTransactions(), api.getBooks(), api.getMembers()])
      .then(([txns, bookList, memberList]) => {
        setTransactions(txns);
        setBooks(bookList);
        setMembers(memberList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setForm({
      ...emptyBorrow,
      borrow_date: new Date().toISOString().split("T")[0],
      due_date: addDays(new Date().toISOString().split("T")[0], 14),
    });
    setEditingId(null);
    modal.open();
  };

  const openEdit = (txn) => {
    setForm({
      book_id: String(txn.book_id),
      member_id: String(txn.member_id),
      borrow_date: formatDate(txn.borrow_date),
      due_date: formatDate(txn.due_date),
      daily_fine_amount: txn.daily_fine_amount || 1,
      book_title: txn.book_title,
      member_name: txn.member_name,
    });
    setEditingId(txn.id);
    modal.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.updateTransaction(editingId, {
          borrow_date: form.borrow_date,
          due_date: form.due_date,
          daily_fine_amount: parseInt(form.daily_fine_amount, 10),
        });
      } else {
        await api.borrowBook({
          ...form,
          book_id: parseInt(form.book_id, 10),
          member_id: parseInt(form.member_id, 10),
          daily_fine_amount: parseInt(form.daily_fine_amount, 10),
        });
      }
      modal.close();
      setEditingId(null);
      setForm({
        ...emptyBorrow,
        borrow_date: new Date().toISOString().split("T")[0],
        due_date: addDays(new Date().toISOString().split("T")[0], 14),
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this loan record?")) return;
    try {
      await api.deleteTransaction(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.returnBook(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayment = async (id) => {
    try {
      await api.recordPayment(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusBadge = (status) => {
    const map = {
      borrowed: "badge-borrowed",
      returned: "badge-success",
      overdue: "badge-danger",
    };
    return (
      <span className={`badge ${map[status] || "badge-borrowed"}`}>{status}</span>
    );
  };

  const availableBooks = books.filter((b) => b.qty > 0);
  const activeMembers = members.filter((m) => m.status === "active");

  const statusCounts = transactions.reduce(
    (counts, txn) => {
      counts.all += 1;
      if (txn.status === "borrowed") counts.borrowed += 1;
      if (txn.status === "overdue") counts.overdue += 1;
      if (txn.status === "returned") counts.returned += 1;
      return counts;
    },
    { all: 0, borrowed: 0, overdue: 0, returned: 0 },
  );

  const searchTerm = search.trim().toLowerCase();
  const statusFilteredTransactions =
    statusFilter === "all"
      ? transactions
      : transactions.filter((txn) => txn.status === statusFilter);
  const filteredTransactions = searchTerm
    ? statusFilteredTransactions.filter((txn) =>
        txn.book_title.toLowerCase().includes(searchTerm),
      )
    : statusFilteredTransactions;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const start =
    filteredTransactions.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, filteredTransactions.length);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const emptyMessage =
    statusFilter === "all"
      ? {
          title: "No loans found",
          hint: "Try a different book title or clear the search.",
        }
      : {
          title: `No ${statusFilter} loans`,
          hint: `There are no loans with status "${statusFilter}" right now.`,
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
    <div className="page transactions-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="transactions-toolbar">
        <SearchBar
          className="transactions-search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by book title..."
        />
        {!loading && filteredTransactions.length > 0 && (
          <span className="transactions-summary">
            Showing {start}-{end} of {filteredTransactions.length} loans
          </span>
        )}
      </div>

      {!loading && transactions.length > 0 && (
        <div
          className="transactions-tabs"
          role="tablist"
          aria-label="Filter loans by status"
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.id}
              className={`transactions-tab transactions-tab-${tab.id} ${
                statusFilter === tab.id ? "active" : ""
              }`}
              onClick={() => handleStatusChange(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="transactions-tab-count">
                {statusCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="transactions-empty">
          <div className="empty-state-icon" aria-hidden="true">
            🔄
          </div>
          <strong>No loans yet</strong>
          <p>Borrow a book to a member to see it here.</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="transactions-empty">
          <div className="empty-state-icon" aria-hidden="true">
            {searchTerm ? "🔍" : "📋"}
          </div>
          <strong>{searchTerm ? "No loans found" : emptyMessage.title}</strong>
          <p>
            {searchTerm
              ? "Try a different book title or clear the search."
              : emptyMessage.hint}
          </p>
        </div>
      ) : (
        <>
          <div className="transactions-grid">
            {paginatedTransactions.map((txn) => (
              <article key={txn.id} className="transaction-card">
                <div className="transaction-card-top">
                  <h3 className="transaction-card-title">{txn.book_title}</h3>
                  {statusBadge(txn.status)}
                </div>

                <dl className="transaction-card-details">
                  <div className="transaction-detail">
                    <dt>Member</dt>
                    <dd>{txn.member_name}</dd>
                  </div>
                  <div className="transaction-detail">
                    <dt>Borrowed</dt>
                    <dd>{formatDate(txn.borrow_date)}</dd>
                  </div>
                  <div className="transaction-detail">
                    <dt>Due</dt>
                    <dd>{formatDate(txn.due_date)}</dd>
                  </div>
                  <div className="transaction-detail">
                    <dt>Returned</dt>
                    <dd>{formatDate(txn.return_date) || "—"}</dd>
                  </div>
                  <div className="transaction-detail">
                    <dt>Daily Fine</dt>
                    <dd>{formatFine(txn.daily_fine_amount)}/day</dd>
                  </div>
                  <div className="transaction-detail">
                    <dt>
                      {txn.status === "returned" ? "Fine Paid" : "Accrued Fine"}
                    </dt>
                    <dd
                      className={
                        txn.accrued_fine > 0 ? "fine-amount-due" : undefined
                      }
                    >
                      {formatFine(txn.accrued_fine)}
                      {txn.is_overdue && txn.overdue_days > 0 && (
                        <span className="fine-days-note">
                          {" "}
                          ({txn.overdue_days} day
                          {txn.overdue_days === 1 ? "" : "s"})
                        </span>
                      )}
                    </dd>
                  </div>
                  {txn.payment_status === "paid" &&
                    txn.status !== "returned" && (
                      <div className="transaction-detail transaction-detail-full">
                        <dt>Payment</dt>
                        <dd className="fine-amount-paid">
                          Received {formatFine(txn.paid_amount)} on{" "}
                          {formatDate(txn.paid_at)}
                        </dd>
                      </div>
                    )}
                </dl>

                {txn.status !== "returned" && (
                  <div className="transaction-card-actions">
                    {txn.requires_payment && (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handlePayment(txn.id)}
                      >
                        Payment Received
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-success"
                      onClick={() => handleReturn(txn.id)}
                      disabled={!txn.can_return}
                      title={
                        txn.requires_payment
                          ? "Record payment before returning this book"
                          : undefined
                      }
                    >
                      Return Book
                    </button>
                  </div>
                )}

                {(txn.status === "borrowed" || txn.status === "overdue") && (
                  <div className="transaction-card-actions transaction-card-secondary-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => openEdit(txn)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleDelete(txn.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}

                {txn.status === "returned" && (
                  <div className="transaction-card-actions transaction-card-secondary-actions">
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleDelete(txn.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="transactions-pagination"
              aria-label="Transactions pagination"
            >
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
          title={editingId ? "Edit Loan" : "Borrow Book"}
          onClose={modal.close}
        >
          <form onSubmit={handleSubmit}>
            {editingId ? (
              <>
                <div className="form-group">
                  <label>Book</label>
                  <input value={form.book_title || ""} disabled />
                </div>
                <div className="form-group">
                  <label>Member</label>
                  <input value={form.member_name || ""} disabled />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Book *</label>
                  <select
                    value={form.book_id}
                    onChange={(e) =>
                      setForm({ ...form, book_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a book</option>
                    {availableBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} ({book.qty} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Member *</label>
                  <select
                    value={form.member_id}
                    onChange={(e) =>
                      setForm({ ...form, member_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select a member</option>
                    {activeMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Borrow Date *</label>
                <input
                  type="date"
                  value={form.borrow_date}
                  onChange={(e) =>
                    setForm({ ...form, borrow_date: e.target.value })
                  }
                  required
                  {...datePickerProps}
                />
              </div>
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                  required
                  {...datePickerProps}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Daily Fine Amount *</label>
              <select
                value={form.daily_fine_amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    daily_fine_amount: parseInt(e.target.value, 10),
                  })
                }
                required
              >
                {Array.from({ length: 10 }, (_, index) => index + 1).map(
                  (amount) => (
                    <option key={amount} value={amount}>
                      ₹{amount} per day
                    </option>
                  ),
                )}
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
                {editingId ? "Save Changes" : "Borrow"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <button
        type="button"
        className="transactions-fab"
        onClick={openCreate}
        aria-label="Borrow book"
      >
        <span className="transactions-fab-icon" aria-hidden="true">
          +
        </span>
        <span className="transactions-fab-label">Borrow Book</span>
      </button>
    </div>
  );
}
