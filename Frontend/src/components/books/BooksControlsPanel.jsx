import SearchBar from 'components/common/SearchBar';
import BookFilters from 'components/books/BookFilters';

export default function BooksControlsPanel({
  search,
  onSearchChange,
  bookType,
  subjects,
  languages,
  priceSort,
  onSubjectsChange,
  onLanguagesChange,
  onPriceSortChange,
  onClearFilters,
  showClear,
  loading,
  total,
  start,
  end,
}) {
  return (
    <div className="books-controls-panel">
      <div className="books-controls-search-row">
        <SearchBar
          className="books-search"
          value={search}
          onChange={onSearchChange}
          placeholder="Search books by title..."
        />
        {!loading && total > 0 && (
          <span className="books-summary">
            Showing {start}–{end} of {total} books
          </span>
        )}
      </div>
      <BookFilters
        bookType={bookType}
        subjects={subjects}
        languages={languages}
        priceSort={priceSort}
        onSubjectsChange={onSubjectsChange}
        onLanguagesChange={onLanguagesChange}
        onPriceSortChange={onPriceSortChange}
        onClear={onClearFilters}
        showClear={showClear}
      />
    </div>
  );
}
