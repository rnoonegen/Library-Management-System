export default function PageTabs({
  tabs,
  activeId,
  onChange,
  ariaLabel = 'Filter tabs',
  className = '',
}) {
  return (
    <div
      className={`tab-bar page-tabs ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        const toneClass = tab.tone ? `tab-${tab.tone}` : '';
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tab ${toneClass} ${isActive ? 'active' : ''}`.trim()}
            onClick={() => onChange(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            {tab.count != null && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
