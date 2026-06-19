import { useCallback, useEffect, useState } from 'react';
import { api } from 'services/api';
import { useModal } from 'components/common/Modal';
import BooksContent from 'components/books/BooksContent';
import BookFormModal from 'components/books/BookFormModal';
import { useActionDialog } from 'hooks/useActionDialog';
import { PAGE_SIZE, buildPageNumbers } from 'utils/pagination';

function openDatePicker(e) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // Ignore browsers/contexts that block programmatic picker opening.
  }
}

const datePickerProps = {
  inputMode: 'none',
  onKeyDown: (e) => e.preventDefault(),
  onClick: openDatePicker,
};

const emptyBook = {
  isbn: '',
  title: '',
  publisher: '',
  author: '',
  qty: 1,
  price: '',
  subject: '',
  abstract: '',
  date_of_publication: '',
  grade_level: '',
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const modal = useModal();
  const { askConfirm, ActionDialog } = useActionDialog();

  const loadBooks = useCallback((pageNum = page, searchTerm = search) => {
    setLoading(true);
    const params = { page: pageNum, limit: PAGE_SIZE };
    const trimmed = searchTerm.trim();
    if (trimmed) params.search = trimmed;

    return api
      .getBooks(params)
      .then((result) => {
        setBooks(result.books);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    loadBooks(page, search);
  }, [page, search, loadBooks]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const openCreate = () => {
    setForm(emptyBook);
    setEditingId(null);
    modal.open();
  };

  const openEdit = (book) => {
    setForm({
      isbn: book.isbn || '',
      title: book.title,
      publisher: book.publisher || '',
      author: book.author,
      qty: book.qty,
      price: book.price ?? '',
      subject: book.subject || '',
      abstract: book.abstract || '',
      date_of_publication: book.date_of_publication
        ? String(book.date_of_publication).slice(0, 10)
        : '',
      grade_level: book.grade_level || '',
    });
    setEditingId(book.id);
    modal.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        qty: parseInt(form.qty, 10),
        price: form.price === '' ? null : form.price,
        subject: form.subject || null,
        abstract: form.abstract || null,
        date_of_publication: form.date_of_publication || null,
        grade_level: form.grade_level || null,
      };
      if (editingId) {
        await api.updateBook(editingId, payload);
      } else {
        await api.createBook(payload);
      }
      modal.close();
      if (editingId) loadBooks(page);
      else setPage(1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await askConfirm({
      title: 'Delete book',
      message: 'Are you sure you want to delete this book? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await api.deleteBook(id);
      const nextPage = books.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      else loadBooks(page);
    } catch (err) {
      setError(err.message);
    }
  };

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  const { startPage, endPage, pageNumbers } = buildPageNumbers(page, totalPages);

  return (
    <div className="page books-page">
      {error && <div className="error-banner">{error}</div>}

      <BooksContent
        books={books}
        loading={loading}
        search={search}
        total={total}
        start={start}
        end={end}
        totalPages={totalPages}
        page={page}
        startPage={startPage}
        endPage={endPage}
        pageNumbers={pageNumbers}
        onSearchChange={handleSearchChange}
        onEdit={openEdit}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <BookFormModal
        isOpen={modal.isOpen}
        editingId={editingId}
        form={form}
        datePickerProps={datePickerProps}
        onClose={modal.close}
        onSubmit={handleSubmit}
        setForm={setForm}
      />

      <button
        type="button"
        className="books-fab"
        onClick={openCreate}
        aria-label="Add book"
      >
        <span className="books-fab-icon" aria-hidden="true">
          +
        </span>
        <span className="books-fab-label">Add Book</span>
      </button>

      <ActionDialog />
    </div>
  );
}
