export default function PageHeader({ children }) {
  if (!children) return null;
  return <div className="page-toolbar">{children}</div>;
}
