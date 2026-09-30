import { AlertCircle, CheckCircle2, Info } from './icons';

const ICONS = { error: AlertCircle, success: CheckCircle2, info: Info };

export default function Notice({ type = 'error', children }) {
    if (!children) return null;
    const Icon = ICONS[type];
    return (
        <div className={`notice notice-${type}`} role={type === 'error' ? 'alert' : 'status'}>
            <Icon aria-hidden="true" /><span>{children}</span>
        </div>
    );
}
