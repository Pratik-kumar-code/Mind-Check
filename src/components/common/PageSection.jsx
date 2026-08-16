export default function PageSection({ title, children }) {
  return <section className="admin-section"><h2>{title}</h2>{children}</section>;
}
