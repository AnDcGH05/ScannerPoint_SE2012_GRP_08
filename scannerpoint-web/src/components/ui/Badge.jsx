// Maps backend/demo status strings onto the four status colours.
const TONES = {
    success: ['COMPLETED', 'CONFIRMED', 'PAID', 'PASSED', 'RESTOCK', 'ACTIVE', 'IN STOCK'],
    warning: ['PENDING', 'IN_PROGRESS', 'SCHEDULED', 'OPEN', 'PARTIAL', 'NEEDS_ATTENTION', 'LOW STOCK', 'ADJUSTMENT'],
    danger: ['FAILED', 'OVERDUE'],
    neutral: ['CANCELLED', 'CLOSED', 'INACTIVE', 'DISPENSE'],
};

export function toneFor(status = '') {
    const s = String(status).toUpperCase();
    return Object.keys(TONES).find((t) => TONES[t].includes(s)) || 'neutral';
}

export default function Badge({ tone, children }) {
    const label = String(children ?? '').replace(/_/g, ' ');
    return <span className={`badge badge-${tone || toneFor(children)}`}>{label}</span>;
}
