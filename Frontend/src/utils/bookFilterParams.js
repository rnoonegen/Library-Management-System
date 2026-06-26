import {
  BOOK_LANGUAGES,
  BOOK_SUBJECTS,
  BOOK_TYPES,
  DEFAULT_BOOK_TYPE,
  mergeCatalogOptions,
} from 'constants/bookCatalog';

export function getMergedFilterOptions(filterOptions = {}) {
  return {
    subjects: mergeCatalogOptions(BOOK_SUBJECTS, filterOptions.subjects ?? []),
    languages: mergeCatalogOptions(BOOK_LANGUAGES, filterOptions.languages ?? []),
  };
}

export function normalizeFilterSelection(selected = [], allOptions = []) {
  if (!selected.length) return [];
  if (allOptions.length > 0 && selected.length >= allOptions.length) return [];
  return selected;
}

function buildSharedFilterParams({
  search = '',
  selectedSubjects = [],
  selectedLanguages = [],
  filterOptions = {},
}) {
  const { subjects: subjectOptions, languages: languageOptions } = getMergedFilterOptions(filterOptions);
  const subjects = normalizeFilterSelection(selectedSubjects, subjectOptions);
  const languages = normalizeFilterSelection(selectedLanguages, languageOptions);

  const params = {};
  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;
  if (subjects.length) params.subject = subjects.join(',');
  if (languages.length) params.language = languages.join(',');
  return params;
}

export function buildBookTypeCountParams({
  search = '',
  selectedSubjects = [],
  selectedLanguages = [],
  filterOptions = {},
}) {
  return buildSharedFilterParams({
    search,
    selectedSubjects,
    selectedLanguages,
    filterOptions,
  });
}

export function buildBookListParams({
  page,
  limit,
  search = '',
  selectedSubjects = [],
  selectedLanguages = [],
  filterOptions = {},
  bookType = DEFAULT_BOOK_TYPE,
  priceSort = '',
}) {
  const params = {
    page,
    limit,
    ...buildSharedFilterParams({
      search,
      selectedSubjects,
      selectedLanguages,
      filterOptions,
    }),
  };

  if (bookType === BOOK_TYPES.borrow || bookType === BOOK_TYPES.reference || bookType === BOOK_TYPES.sell) {
    params.book_type = bookType;
  }

  const canSortByPrice = bookType === BOOK_TYPES.sell || bookType === BOOK_TYPES.all;
  if (canSortByPrice && priceSort) {
    params.sort = priceSort;
  }

  return params;
}

export function hasBookFilters(
  search = '',
  selectedSubjects = [],
  selectedLanguages = [],
  filterOptions = {},
  priceSort = '',
) {
  const { subjects: subjectOptions, languages: languageOptions } = getMergedFilterOptions(filterOptions);
  const subjectsActive = normalizeFilterSelection(selectedSubjects, subjectOptions).length > 0;
  const languagesActive = normalizeFilterSelection(selectedLanguages, languageOptions).length > 0;
  return Boolean(search.trim() || subjectsActive || languagesActive || priceSort);
}

export function isAllFilterSelection(selected = [], allOptions = []) {
  return allOptions.length > 0 && selected.length >= allOptions.length;
}

export const EMPTY_TYPE_COUNTS = {
  all: 0,
  borrow: 0,
  reference: 0,
  sell: 0,
};
