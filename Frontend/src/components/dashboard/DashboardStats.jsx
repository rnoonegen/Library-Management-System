export default function DashboardStats({ groups, stats }) {
  return (
    <>
      {groups.map((group) => (
        <section key={group.title} className="dashboard-section">
          <h3 className="dashboard-section-title">{group.title}</h3>
          <div className="card-grid">
            {group.cards.map((card) => (
              <div key={card.key} className={`stat-card ${card.accent}`}>
                <div className="stat-card-top">
                  <span className="label">{card.label}</span>
                  <span className="stat-icon" aria-hidden="true">
                    {card.icon}
                  </span>
                </div>
                <div className="value">{stats[card.key] ?? 0}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

