import { BORROW_STATUS_TABS } from 'utils/borrowFilterParams';

export default function BorrowStatusTabs({ activeStatus, counts = {}, onChange }) {
  return (
    <div className="transactions-tabs" role="tablist" aria-label="Filter loans by status">
      {BORROW_STATUS_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeStatus === tab.id}
          className={`transactions-tab transactions-tab-${tab.id} ${activeStatus === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          <span className="transactions-tab-count">{counts[tab.id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
