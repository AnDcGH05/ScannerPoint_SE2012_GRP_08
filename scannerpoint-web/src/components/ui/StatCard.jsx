import CountUp from './CountUp';

export default function StatCard({ label, value, icon: Icon, note, noteTone, decimals, prefix, suffix }) {
    const numeric = typeof value === 'number';
    return (
        <div className="card stat">
            <div className="stat-label">{Icon && <Icon aria-hidden="true" />}{label}</div>
            <div className="stat-value">
                {numeric ? <CountUp value={value} decimals={decimals} prefix={prefix} suffix={suffix} /> : value}
            </div>
            {note && <div className={`stat-note${noteTone ? ` is-${noteTone}` : ''}`}>{note}</div>}
        </div>
    );
}
