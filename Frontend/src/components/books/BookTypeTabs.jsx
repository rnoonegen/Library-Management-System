import PageTabs from 'components/common/PageTabs';
import { BOOK_TYPE_LABELS, BOOK_TYPES } from 'constants/bookCatalog';

const TABS = [
  { id: BOOK_TYPES.all, label: BOOK_TYPE_LABELS.all },
  { id: BOOK_TYPES.borrow, label: BOOK_TYPE_LABELS.borrow },
  { id: BOOK_TYPES.reference, label: BOOK_TYPE_LABELS.reference },
  { id: BOOK_TYPES.sell, label: BOOK_TYPE_LABELS.sell },
];

export default function BookTypeTabs({ activeType, counts = {}, onChange }) {
  const tabs = TABS.map((tab) => ({
    ...tab,
    count: counts[tab.id] ?? 0,
  }));

  return (
    <PageTabs
      className="books-type-tabs"
      tabs={tabs}
      activeId={activeType}
      onChange={onChange}
      ariaLabel="Book type"
    />
  );
}
