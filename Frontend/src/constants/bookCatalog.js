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

export function mergeCatalogOptions(predefined, fromApi = []) {
  return [...new Set([...predefined, ...fromApi.filter(Boolean)])].sort((a, b) =>
    a.localeCompare(b),
  );
}
