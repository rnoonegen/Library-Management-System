import { BOOK_LANGUAGES, BOOK_SUBJECTS, BOOK_TYPES, PRICE_SORT_OPTIONS, mergeCatalogOptions } from 'constants/bookCatalog';

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

  bookType,

  priceSort = '',

  onPriceSortChange,

}) {

  const subjectOptions = mergeCatalogOptions(BOOK_SUBJECTS, subjects);

  const languageOptions = mergeCatalogOptions(BOOK_LANGUAGES, languages);

  const showPriceSort =
    (bookType === BOOK_TYPES.sell || bookType === BOOK_TYPES.all) && onPriceSortChange;



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



      {showPriceSort && (

        <div className="books-filter">

          <span className="books-filter-label">Sort by price</span>

          <select

            className="filter-select-native"

            value={priceSort}

            onChange={(e) => onPriceSortChange(e.target.value)}

            aria-label="Sort by price"

          >

            <option value="">Default (title)</option>

            {PRICE_SORT_OPTIONS.map((opt) => (

              <option key={opt.value} value={opt.value}>

                {opt.label}

              </option>

            ))}

          </select>

        </div>

      )}



      {hasActiveFilters && (

        <button type="button" className="btn-secondary books-filter-clear" onClick={onClear}>

          Clear filters

        </button>

      )}

    </div>

  );

}


