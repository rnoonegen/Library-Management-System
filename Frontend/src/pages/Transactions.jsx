import { useEffect, useState } from "react";
import { api } from 'services/api';
import { useModal } from 'components/common/Modal';
import TransactionsContent from 'components/transactions/TransactionsContent';
import TransactionFormModal from 'components/transactions/TransactionFormModal';

const PAGE_SIZE = 12;

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

const emptyBorrow = {
  book_id: "",
  user_id: "",
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
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyBorrow);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const modal = useModal();

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getTransactions(), api.getBooks(), api.getUsers()])
      .then(([txns, bookList, userList]) => {
        setTransactions(txns);
        setBooks(bookList);
        setUsers(userList);
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
      user_id: String(txn.user_id),
      borrow_date: txn.borrow_date?.split("T")[0] || "",
      due_date: txn.due_date?.split("T")[0] || "",
      daily_fine_amount: txn.daily_fine_amount || 1,
      book_title: txn.book_title,
      user_name: txn.user_name,
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
          user_id: parseInt(form.user_id, 10),
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

  const availableBooks = books.filter((b) => b.qty > 0);
  const activeUsers = users.filter((u) => u.status === "active");

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
      <TransactionsContent
        loading={loading}
        transactions={transactions}
        search={search}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        filteredTransactions={filteredTransactions}
        paginatedTransactions={paginatedTransactions}
        safePage={safePage}
        totalPages={totalPages}
        startPage={startPage}
        endPage={endPage}
        pageNumbers={pageNumbers}
        start={start}
        end={end}
        searchTerm={searchTerm}
        emptyMessage={emptyMessage}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onPageChange={setPage}
        onReturn={handleReturn}
        onPayment={handlePayment}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <TransactionFormModal
        isOpen={modal.isOpen}
        editingId={editingId}
        form={form}
        availableBooks={availableBooks}
        activeUsers={activeUsers}
        datePickerProps={datePickerProps}
        onClose={modal.close}
        onSubmit={handleSubmit}
        setForm={setForm}
      />

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

