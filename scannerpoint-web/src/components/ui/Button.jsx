import { Link } from 'react-router-dom';

// One button for the whole app. `variant="primary"` is the single orange action per screen.
export default function Button({
    variant = 'primary', size, block, pill, pulse, to, className = '', children, ...rest
}) {
    const cls = [
        'btn', `btn-${variant}`, size && `btn-${size}`, block && 'btn-block',
        pill && 'btn-pill', pulse && 'btn-pulse', className,
    ].filter(Boolean).join(' ');
    if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
    return <button type="button" className={cls} {...rest}>{children}</button>;
}
