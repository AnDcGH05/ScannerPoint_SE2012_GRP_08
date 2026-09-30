export default function PageHeader({ eyebrow, title, description, children }) {
    return (
        <header className="page-header">
            <div>
                {eyebrow && <div className="eyebrow">{eyebrow}</div>}
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {children && <div className="page-header-actions">{children}</div>}
        </header>
    );
}
