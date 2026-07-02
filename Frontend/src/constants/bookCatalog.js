export const BOOK_FILTER_OTHER = 'Other';

export const BOOK_LANGUAGES = ['English', 'Hindi', 'Telugu', 'Sanskrit'];

export const BOOK_SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Telugu',
  'Sanskrit',
  'History',
  'Geography',
  'Civics',
  'Economics',
  'Computer Science',
  'General Knowledge',
];

export const BOOK_TYPES = {
  all: 'all',
  borrow: 'borrow',
  reference: 'reference',
  sell: 'sell',
};

export const DEFAULT_BOOK_TYPE = BOOK_TYPES.all;

export const BOOK_TYPE_LABELS = {
  all: 'All',
  borrow: 'Borrow',
  reference: 'Reference',
  sell: 'Sell',
};

export const PRICE_SORT = {
  lowHigh: 'price_asc',
  highLow: 'price_desc',
};

export const PRICE_SORT_OPTIONS = [
  { value: PRICE_SORT.lowHigh, label: 'Low to High' },
  { value: PRICE_SORT.highLow, label: 'High to Low' },
];

export function subjectFilterOptions() {
  return [...BOOK_SUBJECTS, BOOK_FILTER_OTHER];
}

export function languageFilterOptions() {
  return [...BOOK_LANGUAGES, BOOK_FILTER_OTHER];
}

export function mergeCatalogOptions(predefined, fromApi = []) {
  return [...new Set([...predefined, ...fromApi.filter(Boolean)])].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getBookAvailabilityLabel(book) {
  const qty = book?.qty ?? 0;
  const available = qty > 0;
  const type = book?.book_type || BOOK_TYPES.borrow;

  if (type === BOOK_TYPES.reference) {
    return available ? 'Available in library' : 'Not available';
  }
  if (type === BOOK_TYPES.sell) {
    return available ? `${qty} for sale` : 'Out of stock';
  }
  return available ? `${qty} available` : 'Unavailable';
}

export function isBookAvailable(book) {
  return (book?.qty ?? 0) > 0;
}
