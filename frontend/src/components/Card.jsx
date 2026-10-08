import Icon from './Icon.jsx'

export default function Card({ title, icon, actions, children, className = '', bodyClassName = 'p-5', subtitle }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <Icon name={icon} className="text-navy text-[20px]" />}
            <div className="min-w-0">
              <h2 className="text-headline-sm text-navy truncate">{title}</h2>
              {subtitle && <p className="text-body-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
