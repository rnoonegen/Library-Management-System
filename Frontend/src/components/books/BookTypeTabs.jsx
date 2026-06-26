import { BOOK_TYPE_LABELS, BOOK_TYPES } from 'constants/bookCatalog';

const TABS = [
  { id: BOOK_TYPES.all, label: BOOK_TYPE_LABELS.all },
  { id: BOOK_TYPES.borrow, label: BOOK_TYPE_LABELS.borrow },
  { id: BOOK_TYPES.reference, label: BOOK_TYPE_LABELS.reference },
  { id: BOOK_TYPES.sell, label: BOOK_TYPE_LABELS.sell },
];

export default function BookTypeTabs({ activeType, counts = {}, onChange }) {
  return (
    <div className="tab-bar books-type-tabs" role="tablist" aria-label="Book type">
      {TABS.map((tab) => {
        const count = counts[tab.id] ?? 0;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeType === tab.id}
            className={activeType === tab.id ? 'tab active' : 'tab'}
            onClick={() => onChange(tab.id)}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
