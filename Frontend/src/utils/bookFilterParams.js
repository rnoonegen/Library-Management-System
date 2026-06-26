export function buildBookListParams({
  page,
  limit,
  search = '',
  selectedSubjects = [],
  selectedLanguages = [],
}) {
  const params = { page, limit };
  const trimmed = search.trim();
  if (trimmed) params.search = trimmed;
  if (selectedSubjects.length) params.subject = selectedSubjects.join(',');
  if (selectedLanguages.length) params.language = selectedLanguages.join(',');
  return params;
}

export function hasBookFilters(search = '', selectedSubjects = [], selectedLanguages = []) {
  return Boolean(search.trim() || selectedSubjects.length || selectedLanguages.length);
}
