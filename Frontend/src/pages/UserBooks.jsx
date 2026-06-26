import { useCallback, useEffect, useState } from 'react';

import { api } from 'services/api';

import UserBooksContent from 'components/users/UserBooksContent';

import { useActionDialog } from 'hooks/useActionDialog';

import { PAGE_SIZE, buildPageNumbers } from 'utils/pagination';

import { BOOK_LANGUAGES, BOOK_SUBJECTS, BOOK_TYPES, DEFAULT_BOOK_TYPE } from 'constants/bookCatalog';

import { buildBookListParams, buildBookTypeCountParams, EMPTY_TYPE_COUNTS } from 'utils/bookFilterParams';



function parseBorrowsForBooks(data) {

  if (Array.isArray(data)) {

    const active = data.filter((b) => b.status !== 'returned');

    return {

      borrows: data,

      atBorrowLimit: active.length >= 3,

    };

  }

  return {

    borrows: data.borrows ?? [],

    atBorrowLimit: data.atBorrowLimit ?? false,

  };

}



const emptyFilterOptions = { subjects: BOOK_SUBJECTS, languages: BOOK_LANGUAGES };



export default function UserBooks() {

  const [books, setBooks] = useState([]);

  const [borrowedBookIds, setBorrowedBookIds] = useState(new Set());

  const [holdsByBookId, setHoldsByBookId] = useState({});

  const [purchasesByBookId, setPurchasesByBookId] = useState({});

  const [atBorrowLimit, setAtBorrowLimit] = useState(false);

  const [search, setSearch] = useState('');

  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const [bookType, setBookType] = useState(DEFAULT_BOOK_TYPE);

  const [priceSort, setPriceSort] = useState('');

  const [typeCounts, setTypeCounts] = useState(EMPTY_TYPE_COUNTS);

  const [filterOptions, setFilterOptions] = useState(emptyFilterOptions);

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);

  const [requestingId, setRequestingId] = useState(null);

  const [buyingId, setBuyingId] = useState(null);

  const { askConfirm, ActionDialog } = useActionDialog();



  const loadUserContext = () =>

    Promise.all([api.getMyBorrows(), api.getMyBorrowRequests(), api.getMyPurchaseOrders()]).then(

      ([borrowsData, holds, purchases]) => {

        const { borrows, atBorrowLimit: atLimit } = parseBorrowsForBooks(borrowsData);

        const borrowed = new Set(

          borrows.filter((b) => b.status !== 'returned').map((b) => b.book_id),

        );

        setBorrowedBookIds(borrowed);

        setAtBorrowLimit(atLimit);

        const activeHolds = {};

        holds

          .filter((h) => h.status === 'pending' || h.status === 'ready')

          .forEach((h) => {

            activeHolds[h.book_id] = h;

          });

        setHoldsByBookId(activeHolds);

        const activePurchases = {};

        purchases

          .filter((p) => p.status === 'pending' || p.status === 'ready')

          .forEach((p) => {

            activePurchases[p.book_id] = p;

          });

        setPurchasesByBookId(activePurchases);

      },

    );



  const loadBooks = useCallback((

    pageNum = page,

    searchTerm = search,

    subjectFilters = selectedSubjects,

    languageFilters = selectedLanguages,

    typeFilter = bookType,

    sortFilter = priceSort,

  ) => {

    setLoading(true);

    const params = buildBookListParams({

      page: pageNum,

      limit: PAGE_SIZE,

      search: searchTerm,

      selectedSubjects: subjectFilters,

      selectedLanguages: languageFilters,

      filterOptions,

      bookType: typeFilter,

      priceSort: sortFilter,

    });



    const countParams = buildBookTypeCountParams({

      search: searchTerm,

      selectedSubjects: subjectFilters,

      selectedLanguages: languageFilters,

      filterOptions,

    });



    Promise.all([api.getBooks(params), api.getBookTypeCounts(countParams), loadUserContext()])

      .then(([booksRes, counts]) => {

        setBooks(booksRes.books ?? []);

        setTotal(booksRes.total ?? 0);

        setTotalPages(booksRes.totalPages ?? 1);

        if (booksRes.page && booksRes.page !== page) setPage(booksRes.page);

        setTypeCounts({ ...EMPTY_TYPE_COUNTS, ...counts });

      })

      .catch((err) => setError(err.message))

      .finally(() => setLoading(false));

  }, [page, search, selectedSubjects, selectedLanguages, bookType, priceSort, filterOptions]);



  useEffect(() => {

    api.getBookFilters()

      .then((options) => setFilterOptions({

        subjects: options.subjects ?? [],

        languages: options.languages ?? [],

      }))

      .catch(() => setFilterOptions(emptyFilterOptions));

  }, []);



  useEffect(() => {

    loadBooks(page, search, selectedSubjects, selectedLanguages, bookType, priceSort);

  }, [page, search, selectedSubjects, selectedLanguages, bookType, priceSort, loadBooks]);



  const handleSearchChange = (value) => {

    setSearch(value);

    setPage(1);

  };



  const handleSubjectsChange = (values) => {

    setSelectedSubjects(values);

    setPage(1);

  };



  const handleLanguagesChange = (values) => {

    setSelectedLanguages(values);

    setPage(1);

  };



  const handleClearFilters = () => {

    setSearch('');

    setSelectedSubjects([]);

    setSelectedLanguages([]);

    setPriceSort('');

    setPage(1);

  };



  const handleBookTypeChange = (type) => {

    setBookType(type);

    if (type !== BOOK_TYPES.sell && type !== BOOK_TYPES.all) setPriceSort('');

    setPage(1);

  };



  const handlePriceSortChange = (value) => {

    setPriceSort(value);

    setPage(1);

  };



  async function handleRequest(bookId, bookTitle) {

    setError('');

    const confirmed = await askConfirm({

      title: 'Join waitlist',

      message: bookTitle

        ? `Join the waitlist for "${bookTitle}"? You will be notified when a copy is ready for pickup.`

        : 'Join the waitlist for this book? You will be notified when a copy is ready for pickup.',

      confirmLabel: 'Join waitlist',

      variant: 'primary',

    });

    if (!confirmed) return;



    setRequestingId(bookId);

    try {

      await api.submitBorrowRequest(bookId);

      loadBooks(page, search, selectedSubjects, selectedLanguages, bookType, priceSort);

    } catch (err) {

      setError(err.message);

    } finally {

      setRequestingId(null);

    }

  }



  async function handleBuy(bookId, bookTitle, price) {

    setError('');

    const confirmed = await askConfirm({

      title: 'Place purchase order',

      message: bookTitle

        ? `Order "${bookTitle}" for ₹${price}? You will visit the library to pay and collect the book.`

        : `Place a purchase order for ₹${price}? You will visit the library to pay and collect the book.`,

      confirmLabel: 'Place order',

      variant: 'primary',

    });

    if (!confirmed) return;



    setBuyingId(bookId);

    try {

      await api.submitPurchaseOrder(bookId);

      loadBooks(page, search, selectedSubjects, selectedLanguages, bookType, priceSort);

    } catch (err) {

      setError(err.message);

    } finally {

      setBuyingId(null);

    }

  }



  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const end = Math.min(page * PAGE_SIZE, total);

  const { startPage, endPage, pageNumbers } = buildPageNumbers(page, totalPages);



  return (

    <div className="page books-page">

      {error && <div className="error-banner">{error}</div>}

      <UserBooksContent

        books={books}

        search={search}

        selectedSubjects={selectedSubjects}

        selectedLanguages={selectedLanguages}

        filterOptions={filterOptions}

        bookType={bookType}

        typeCounts={typeCounts}

        priceSort={priceSort}

        loading={loading}

        total={total}

        start={start}

        end={end}

        page={page}

        totalPages={totalPages}

        startPage={startPage}

        endPage={endPage}

        pageNumbers={pageNumbers}

        requestingId={requestingId}

        buyingId={buyingId}

        borrowedBookIds={borrowedBookIds}

        holdsByBookId={holdsByBookId}

        purchasesByBookId={purchasesByBookId}

        atBorrowLimit={atBorrowLimit}

        onSearchChange={handleSearchChange}

        onSubjectsChange={handleSubjectsChange}

        onLanguagesChange={handleLanguagesChange}

        onClearFilters={handleClearFilters}

        onBookTypeChange={handleBookTypeChange}

        onPriceSortChange={handlePriceSortChange}

        onPageChange={setPage}

        onRequest={handleRequest}

        onBuy={handleBuy}

      />

      <ActionDialog />

    </div>

  );

}


