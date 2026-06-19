import { useCallback, useEffect, useState } from "react";
import { api } from "services/api";
import { useModal } from "components/common/Modal";
import TransactionsContent from "components/transactions/TransactionsContent";
import TransactionFormModal from "components/transactions/TransactionFormModal";
import { useActionDialog } from "hooks/useActionDialog";
import { PAGE_SIZE, buildPageNumbers } from "utils/pagination";

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
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    borrowed: 0,
    overdue: 0,
    returned: 0,
  });
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyBorrow);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const modal = useModal();
  const { askConfirm, ActionDialog } = useActionDialog();

  const loadTransactions = useCallback(
    (pageNum = page, searchTerm = search, status = statusFilter) => {
      setLoading(true);
      const params = { page: pageNum, limit: PAGE_SIZE };
      const trimmed = searchTerm.trim();
      if (trimmed) params.search = trimmed;
      if (status && status !== "all") params.status = status;

      return api
        .getTransactions(params)
        .then((result) => {
          setTransactions(result.transactions);
          setTotal(result.total);
          setTotalPages(result.totalPages);
          setPage(result.page);
          if (result.statusCounts) {
            setStatusCounts(result.statusCounts);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    },
    [page, search, statusFilter],
  );

  const loadLookups = useCallback(() => {
    Promise.all([api.getAvailableBooks(), api.getActiveUsers()])
      .then(([bookList, userList]) => {
        setBooks(bookList);
        setUsers(userList);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    loadTransactions(page, search, statusFilter);
  }, [page, search, statusFilter, loadTransactions]);

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
      loadLookups();
      loadTransactions(page, search, statusFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await askConfirm({
      title: "Delete loan record",
      message: "Are you sure you want to delete this loan record? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    try {
      await api.deleteTransaction(id);
      loadLookups();
      loadTransactions(page, search, statusFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.returnBook(id);
      loadLookups();
      loadTransactions(page, search, statusFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePayment = async (id) => {
    try {
      await api.recordPayment(id);
      loadTransactions(page, search, statusFilter);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const safePage = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, total);
  const { startPage, endPage, pageNumbers } = buildPageNumbers(safePage, totalPages);

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

  return (
    <div className="page transactions-page">
      {error && <div className="error-banner">{error}</div>}
      <TransactionsContent
        loading={loading}
        transactions={transactions}
        search={search}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        filteredTransactions={transactions}
        paginatedTransactions={transactions}
        safePage={safePage}
        totalPages={totalPages}
        startPage={startPage}
        endPage={endPage}
        pageNumbers={pageNumbers}
        start={start}
        end={end}
        searchTerm={search.trim().toLowerCase()}
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
        availableBooks={books}
        activeUsers={users}
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

      <ActionDialog />
    </div>
  );
}
