/** API dates may be ISO strings or Date-like values — always show YYYY-MM-DD. */
export function formatDateOnly(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'string') return value.split('T')[0];
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return String(value).split('T')[0];
}
