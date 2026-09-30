import { useId } from 'react';

// Labelled form control. `as` can be "input", "select" or "textarea".
export default function Input({
    label, labelAside, icon: Icon, hint, hintOk, error, action, as: Tag = 'input', className = '', children, ...rest
}) {
    const id = useId();
    const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
    return (
        <div className={`field ${className}`}>
            <label className="field-label" htmlFor={id}>
                <span>{label}</span>
                {labelAside}
            </label>
            <div className={`field-control${Icon ? ' has-icon' : ''}${action ? ' has-action' : ''}`}>
                {Icon && <Icon aria-hidden="true" />}
                <Tag id={id} className="input" aria-invalid={error ? 'true' : undefined}
                     aria-describedby={describedBy} {...rest}>{children}</Tag>
                {action}
            </div>
            {hint && <p id={`${id}-hint`} className={`field-hint${hintOk ? ' is-ok' : ''}`}>{hint}</p>}
            {error && <p id={`${id}-err`} className="field-error" role="alert">{error}</p>}
        </div>
    );
}
