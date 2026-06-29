import PageTabs from 'components/common/PageTabs';
import { BORROW_STATUS_TABS } from 'utils/borrowFilterParams';

const STATUS_TONES = {
  overdue: 'overdue',
  returned: 'returned',
};

export default function BorrowStatusTabs({ activeStatus, counts = {}, onChange }) {
  const tabs = BORROW_STATUS_TABS.map((tab) => ({
    ...tab,
    count: counts[tab.id] ?? 0,
    tone: STATUS_TONES[tab.id],
  }));

  return (
    <PageTabs
      tabs={tabs}
      activeId={activeStatus}
      onChange={onChange}
      ariaLabel="Filter loans by status"
    />
  );
}
