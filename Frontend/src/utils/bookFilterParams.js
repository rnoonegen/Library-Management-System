import { BOOK_TYPES, DEFAULT_BOOK_TYPE } from 'constants/bookCatalog';

export function buildBookListParams({
  page,
  limit,
  search = '',
  bookType = DEFAULT_BOOK_TYPE,
}) {
  const params = { page, limit };
  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;

  if (bookType === BOOK_TYPES.borrow || bookType === BOOK_TYPES.reference || bookType === BOOK_TYPES.sell) {
    params.book_type = bookType;
  }

  return params;
}

export function buildBookTypeCountParams({ search = '' } = {}) {
  const params = {};
  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;
  return params;
}

export const EMPTY_TYPE_COUNTS = {
  all: 0,
  borrow: 0,
  reference: 0,
  sell: 0,
};
