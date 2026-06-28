import MultiFilterSelect from 'components/common/MultiFilterSelect';
import FilterSelect from 'components/common/FilterSelect';
import {
  BOOK_TYPES,
  languageFilterOptions,
  PRICE_SORT_OPTIONS,
  subjectFilterOptions,
} from 'constants/bookCatalog';

export default function BookFilters({
  bookType,
  subjects,
  languages,
  priceSort,
  onSubjectsChange,
  onLanguagesChange,
  onPriceSortChange,
  onClear,
  showClear,
}) {
  const isSellTab = bookType === BOOK_TYPES.sell;

  return (
    <div className="books-filters-panel">
      <p className="books-filters-heading">Filter by</p>
      <div className="books-filters" role="group" aria-label="Book filters">
        <MultiFilterSelect
          label="Subject"
          values={subjects}
          options={subjectFilterOptions()}
          placeholder="Select subject"
          onChange={onSubjectsChange}
          ariaLabel="Filter by subject"
        />
        <MultiFilterSelect
          label="Language"
          values={languages}
          options={languageFilterOptions()}
          placeholder="Select language"
          onChange={onLanguagesChange}
          ariaLabel="Filter by language"
        />
        {isSellTab && (
          <FilterSelect
            label="Price"
            value={priceSort}
            options={PRICE_SORT_OPTIONS}
            placeholder="Sort by price"
            onChange={onPriceSortChange}
            ariaLabel="Sort books by price"
          />
        )}
        {showClear && (
          <button type="button" className="btn-secondary books-filter-clear" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
