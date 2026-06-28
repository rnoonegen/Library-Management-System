import { BOOK_TYPES, DEFAULT_BOOK_TYPE, PRICE_SORT } from 'constants/bookCatalog';

function appendArrayParams(params, key, values = []) {
  const list = values.filter(Boolean);
  if (list.length > 0) params[key] = list;
}

export function buildBookListParams({
  page,
  limit,
  search = '',
  bookType = DEFAULT_BOOK_TYPE,
  subjects = [],
  languages = [],
  priceSort = '',
}) {
  const params = { page, limit };
  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;

  if (bookType === BOOK_TYPES.borrow || bookType === BOOK_TYPES.reference || bookType === BOOK_TYPES.sell) {
    params.book_type = bookType;
  }

  appendArrayParams(params, 'subjects', subjects);
  appendArrayParams(params, 'languages', languages);

  if (bookType === BOOK_TYPES.sell && (priceSort === PRICE_SORT.lowHigh || priceSort === PRICE_SORT.highLow)) {
    params.sort = priceSort;
  }

  return params;
}

export function buildBookTypeCountParams({ search = '', subjects = [], languages = [] } = {}) {
  const params = {};
  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;
  appendArrayParams(params, 'subjects', subjects);
  appendArrayParams(params, 'languages', languages);
  return params;
}

export const EMPTY_TYPE_COUNTS = {
  all: 0,
  borrow: 0,
  reference: 0,
  sell: 0,
};

export function hasActiveBookFilters({
  search = '',
  subjects = [],
  languages = [],
  bookType = DEFAULT_BOOK_TYPE,
  priceSort = '',
} = {}) {
  const hasPriceSort =
    bookType === BOOK_TYPES.sell &&
    (priceSort === PRICE_SORT.lowHigh || priceSort === PRICE_SORT.highLow);

  return Boolean(search.trim() || subjects.length || languages.length || hasPriceSort);
}
