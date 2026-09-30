// Compact status dropdown used inside table rows
export default function StatusSelect({ value, options, label, onChange }) {
    return (
        <select className="input" style={{ height: 36, width: 'auto' }} value={value} aria-label={label}
                onChange={(e) => onChange(e.target.value)}>
            {[...new Set([value, ...options])].map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
    );
}
