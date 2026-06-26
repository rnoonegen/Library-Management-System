import { BOOK_TYPE_LABELS, BOOK_TYPES } from 'constants/bookCatalog';

const TABS = [
  { id: BOOK_TYPES.borrow, label: BOOK_TYPE_LABELS.borrow },
  { id: BOOK_TYPES.reference, label: BOOK_TYPE_LABELS.reference },
];

export default function BookTypeTabs({ activeType, onChange }) {
  return (
    <div className="tab-bar books-type-tabs" role="tablist" aria-label="Book type">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeType === tab.id}
          className={activeType === tab.id ? 'tab active' : 'tab'}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
