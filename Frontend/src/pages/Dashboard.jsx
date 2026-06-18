import { useEffect, useState } from "react";
import { api } from 'services/api';
import DashboardStats from 'components/dashboard/DashboardStats';

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
    title: "Users",
    cards: [
      {
        label: "Total Users",
        key: "totalUsers",
        icon: "👥",
        accent: "accent-blue",
      },
      {
        label: "Active Users",
        key: "activeUsers",
        icon: "🟢",
        accent: "accent-green",
      },
      {
        label: "Inactive Users",
        key: "inactiveUsers",
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
      <DashboardStats groups={statGroups} stats={stats} />
    </div>
  );
}

