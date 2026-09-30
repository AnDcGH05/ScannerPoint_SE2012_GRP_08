/**
 * columns: [{ key, label, num?, className?, render?(row) }]
 * `source` is the object returned by useResource (for loading / error text).
 */
export default function DataTable({ columns, rows, source, empty = 'Nothing here yet.', rowKey = 'id' }) {
    const message = source?.loading ? 'Loading…' : source?.error || empty;
    return (
        <div className="table-wrap">
            <table className="table">
                <thead>
                    <tr>{columns.map((c) => <th key={c.key} className={c.num ? 'num' : undefined}>{c.label}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row[rowKey]}>
                            {columns.map((c) => (
                                <td key={c.key} className={[c.num && 'num', c.className].filter(Boolean).join(' ') || undefined}>
                                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {rows.length === 0 && <p className="table-empty">{message}</p>}
        </div>
    );
}
