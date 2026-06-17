export default function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    cancelled: 'badge-muted',
    borrowed: 'badge-info',
    returned: 'badge-muted',
    overdue: 'badge-danger',
    active: 'badge-success',
    inactive: 'badge-danger',
  };

  const className = map[status] || 'badge-muted';
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return <span className={`badge ${className}`}>{label}</span>;
}

