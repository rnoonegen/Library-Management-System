import { useCallback, useEffect, useState } from 'react';
import { api } from 'services/api';
import { useModal } from 'components/common/Modal';
import BooksContent from 'components/books/BooksContent';
import BookFormModal from 'components/books/BookFormModal';
import { useActionDialog } from 'hooks/useActionDialog';
import { PAGE_SIZE, buildPageNumbers } from 'utils/pagination';
import { BOOK_TYPES, DEFAULT_BOOK_TYPE } from 'constants/bookCatalog';
import { buildBookListParams, buildBookTypeCountParams, EMPTY_TYPE_COUNTS } from 'utils/bookFilterParams';
import {
  getBookImages,
  setBookImages,
  removeBookImages,
  readImageFilesAsDataUrls,
  MAX_IMAGES_PER_BOOK,
} from 'utils/bookImageStore';

function openDatePicker(e) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // Ignore browsers/contexts that block programmatic picker opening.
  }
}

function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const maxPublicationDate = todayLocalISO();

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
  language: '',
  abstract: '',
  date_of_publication: '',
  grade_level: '',
  book_type: BOOK_TYPES.borrow,
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [priceSort, setPriceSort] = useState('');
  const [bookType, setBookType] = useState(DEFAULT_BOOK_TYPE);
  const [typeCounts, setTypeCounts] = useState(EMPTY_TYPE_COUNTS);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(emptyBook);
  const [bookImages, setBookImagesState] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const modal = useModal();
  const { askConfirm, ActionDialog } = useActionDialog();

  const loadBooks = useCallback((
    pageNum = page,
    searchTerm = search,
    typeFilter = bookType,
    subjectFilter = subjects,
    languageFilter = languages,
    sortFilter = priceSort,
  ) => {
    setLoading(true);
    const params = buildBookListParams({
      page: pageNum,
      limit: PAGE_SIZE,
      search: searchTerm,
      bookType: typeFilter,
      subjects: subjectFilter,
      languages: languageFilter,
      priceSort: sortFilter,
    });

    const countParams = buildBookTypeCountParams({
      search: searchTerm,
      subjects: subjectFilter,
      languages: languageFilter,
    });

    return Promise.all([
      api.getBooks(params),
      api.getBookTypeCounts(countParams),
    ])
      .then(([result, counts]) => {
        setBooks(result.books);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
        setTypeCounts({ ...EMPTY_TYPE_COUNTS, ...counts });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, search, bookType, subjects, languages, priceSort]);

  useEffect(() => {
    loadBooks(page, search, bookType, subjects, languages, priceSort);
  }, [page, search, bookType, subjects, languages, priceSort, loadBooks]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleBookTypeChange = (type) => {
    setBookType(type);
    if (type !== BOOK_TYPES.sell) setPriceSort('');
    setPage(1);
  };

  const handleSubjectsChange = (nextSubjects) => {
    setSubjects(nextSubjects);
    setPage(1);
  };

  const handleLanguagesChange = (nextLanguages) => {
    setLanguages(nextLanguages);
    setPage(1);
  };

  const handlePriceSortChange = (nextSort) => {
    setPriceSort(nextSort);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSubjects([]);
    setLanguages([]);
    setPriceSort('');
    setPage(1);
  };

  const openCreate = () => {
    const defaultType = bookType === BOOK_TYPES.all ? BOOK_TYPES.borrow : bookType;
    setForm({ ...emptyBook, book_type: defaultType });
    setBookImagesState([]);
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
      language: book.language || '',
      abstract: book.abstract || '',
      date_of_publication: book.date_of_publication
        ? String(book.date_of_publication).slice(0, 10)
        : '',
      grade_level: book.grade_level || '',
      book_type: book.book_type || BOOK_TYPES.borrow,
    });
    setBookImagesState(getBookImages(book.id));
    setEditingId(book.id);
    modal.open();
  };

  const handleAddImages = async (files) => {
    if (!files?.length) return;
    try {
      const dataUrls = await readImageFilesAsDataUrls(files);
      setBookImagesState((prev) =>
        [...prev, ...dataUrls].slice(0, MAX_IMAGES_PER_BOOK),
      );
    } catch {
      setError('Failed to read one or more images.');
    }
  };

  const handleRemoveImage = (index) => {
    setBookImagesState((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const minQty = editingId ? 0 : 1;
      const qty = Math.max(minQty, parseInt(form.qty, 10) || minQty);
      const publicationDate =
        form.date_of_publication && form.date_of_publication <= maxPublicationDate
          ? form.date_of_publication
          : null;

      const payload = {
        ...form,
        qty,
        price: form.price === '' ? null : form.price,
        subject: form.subject || null,
        language: form.language || null,
        abstract: form.abstract || null,
        date_of_publication: publicationDate,
        grade_level: form.grade_level || null,
        book_type: form.book_type || BOOK_TYPES.borrow,
      };
      if (editingId) {
        await api.updateBook(editingId, payload);
        setBookImages(editingId, bookImages);
      } else {
        const created = await api.createBook(payload);
        if (created?.id) setBookImages(created.id, bookImages);
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
      removeBookImages(id);
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
        subjects={subjects}
        languages={languages}
        priceSort={priceSort}
        bookType={bookType}
        typeCounts={typeCounts}
        total={total}
        start={start}
        end={end}
        totalPages={totalPages}
        page={page}
        startPage={startPage}
        endPage={endPage}
        pageNumbers={pageNumbers}
        onSearchChange={handleSearchChange}
        onSubjectsChange={handleSubjectsChange}
        onLanguagesChange={handleLanguagesChange}
        onPriceSortChange={handlePriceSortChange}
        onClearFilters={handleClearFilters}
        onBookTypeChange={handleBookTypeChange}
        onEdit={openEdit}
        onDelete={handleDelete}
        onPageChange={setPage}
      />

      <BookFormModal
        isOpen={modal.isOpen}
        editingId={editingId}
        form={form}
        images={bookImages}
        maxImages={MAX_IMAGES_PER_BOOK}
        onImagesChange={handleAddImages}
        onRemoveImage={handleRemoveImage}
        datePickerProps={datePickerProps}
        maxPublicationDate={maxPublicationDate}
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
