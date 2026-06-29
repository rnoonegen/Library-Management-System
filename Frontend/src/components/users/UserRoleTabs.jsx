import PageTabs from 'components/common/PageTabs';

const ROLE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'teacher', label: 'Teacher' },
  { id: 'student', label: 'Student' },
];

export default function UserRoleTabs({ activeRole, counts = {}, onChange }) {
  const tabs = ROLE_TABS.map((tab) => ({
    ...tab,
    count: counts[tab.id] ?? 0,
  }));

  return (
    <PageTabs
      tabs={tabs}
      activeId={activeRole}
      onChange={onChange}
      ariaLabel="Filter users by role"
    />
  );
}
