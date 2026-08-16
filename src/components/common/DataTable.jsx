export default function DataTable({ headers, children }) {
  return <div className="table-container"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
