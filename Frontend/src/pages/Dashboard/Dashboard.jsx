import { useEffect, useState } from "react";
import { api } from "../../services/api";

const statGroups = [
  {
    title: "Book Inventory",
    cards: [
      {
        label: "Total Books",
        key: "totalBooks",
        icon: "📚",
        accent: "accent-blue",
      },
      {
        label: "Total Copies",
        key: "totalCopies",
        icon: "📦",
        accent: "accent-blue",
      },
      {
        label: "Available Copies",
        key: "availableCopies",
        icon: "✅",
        accent: "accent-green",
      },
    ],
  },
  {
    title: "Members",
    cards: [
      {
        label: "Total Members",
        key: "totalMembers",
        icon: "👥",
        accent: "accent-blue",
      },
      {
        label: "Active Members",
        key: "activeMembers",
        icon: "🟢",
        accent: "accent-green",
      },
      {
        label: "Inactive Members",
        key: "inactiveMembers",
        icon: "⚪",
        accent: "accent-red",
      },
    ],
  },
  {
    title: "Overdue",
    cards: [
      {
        label: "Overdue Count",
        key: "overdueLoans",
        icon: "⚠️",
        accent: "accent-red",
      },
    ],
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      {statGroups.map((group) => (
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
    </div>
  );
}
