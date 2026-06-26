import { BOOK_LANGUAGES, BOOK_SUBJECTS, mergeCatalogOptions } from 'constants/bookCatalog';

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

export function buildBookListParams({
  page,
  limit,
  search = '',
  selectedSubjects = [],
  selectedLanguages = [],
  filterOptions = {},
}) {
  const { subjects: subjectOptions, languages: languageOptions } = getMergedFilterOptions(filterOptions);
  const subjects = normalizeFilterSelection(selectedSubjects, subjectOptions);
  const languages = normalizeFilterSelection(selectedLanguages, languageOptions);

  const params = { page, limit };
  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;
  if (subjects.length) params.subject = subjects.join(',');
  if (languages.length) params.language = languages.join(',');
  return params;
}

export function hasBookFilters(
  search = '',
  selectedSubjects = [],
  selectedLanguages = [],
  filterOptions = {},
) {
  const { subjects: subjectOptions, languages: languageOptions } = getMergedFilterOptions(filterOptions);
  const subjectsActive = normalizeFilterSelection(selectedSubjects, subjectOptions).length > 0;
  const languagesActive = normalizeFilterSelection(selectedLanguages, languageOptions).length > 0;
  return Boolean(search.trim() || subjectsActive || languagesActive);
}

export function isAllFilterSelection(selected = [], allOptions = []) {
  return allOptions.length > 0 && selected.length >= allOptions.length;
}
