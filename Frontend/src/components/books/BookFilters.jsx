import { BOOK_LANGUAGES, BOOK_SUBJECTS, mergeCatalogOptions } from 'constants/bookCatalog';
import MultiFilterSelect from 'components/common/MultiFilterSelect';

export default function BookFilters({
  subjects = [],
  languages = [],
  selectedSubjects = [],
  selectedLanguages = [],
  onSubjectsChange,
  onLanguagesChange,
  onClear,
  hasActiveFilters,
}) {
  const subjectOptions = mergeCatalogOptions(BOOK_SUBJECTS, subjects);
  const languageOptions = mergeCatalogOptions(BOOK_LANGUAGES, languages);

  return (
    <div className="books-filters" role="group" aria-label="Book filters">
      <MultiFilterSelect
        label="Subject"
        values={selectedSubjects}
        options={subjectOptions}
        placeholder="All subjects"
        onChange={onSubjectsChange}
        ariaLabel="Filter by subject"
        chipType="subject"
      />

      <MultiFilterSelect
        label="Language"
        values={selectedLanguages}
        options={languageOptions}
        placeholder="All languages"
        onChange={onLanguagesChange}
        ariaLabel="Filter by language"
        chipType="language"
      />

      {hasActiveFilters && (
        <button type="button" className="btn-secondary books-filter-clear" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
