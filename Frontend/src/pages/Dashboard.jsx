import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  const cards = [
    { label: 'Total Books', value: stats.totalBooks },
    { label: 'Total Copies', value: stats.totalCopies },
    { label: 'Available Copies', value: stats.availableCopies },
    { label: 'Members', value: stats.totalMembers },
    { label: 'Active Members', value: stats.activeMembers },
    { label: 'Active Loans', value: stats.activeBorrows },
    { label: 'Overdue Loans', value: stats.overdueLoans },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your library</p>
        </div>
      </div>

      {stats.dbMode === 'memory' && (
        <div className="error-banner" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)', color: '#fcd34d' }}>
          Running in memory mode. Copy backend/.env.local.example or backend/.env.online.example to backend/.env to use MySQL.
        </div>
      )}

      <div className="card-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="label">{card.label}</div>
            <div className="value">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
