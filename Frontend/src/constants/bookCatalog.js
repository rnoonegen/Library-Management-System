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
  borrow: 'borrow',
  reference: 'reference',
};

export const DEFAULT_BOOK_TYPE = BOOK_TYPES.borrow;

export const BOOK_TYPE_LABELS = {
  borrow: 'Borrow',
  reference: 'Reference',
};

export function mergeCatalogOptions(predefined, fromApi = []) {
  return [...new Set([...predefined, ...fromApi.filter(Boolean)])].sort((a, b) =>
    a.localeCompare(b),
  );
}
