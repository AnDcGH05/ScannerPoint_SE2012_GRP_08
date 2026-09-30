export default function Card({ title, subtitle, aside, flush, accent, className = '', children, ...rest }) {
    const cls = ['card', flush && 'card-flush', accent && 'card-accent', className].filter(Boolean).join(' ');
    return (
        <section className={cls} {...rest}>
            {(title || aside) && (
                <div className="card-head" style={flush ? { padding: '20px 20px 0' } : undefined}>
                    <div>
                        {title && <h2 className="card-title">{title}</h2>}
                        {subtitle && <p className="card-sub">{subtitle}</p>}
                    </div>
                    {aside}
                </div>
            )}
            {children}
        </section>
    );
}
