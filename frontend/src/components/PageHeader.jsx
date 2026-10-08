/** Big page title with an optional eyebrow line and action buttons on the right. */
export default function PageHeader({ eyebrow, title, subtitle, actions, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-label-sm uppercase tracking-widest text-orange">{eyebrow}</p>}
        <h1 className="text-headline-lg md:text-headline-xl text-navy">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-body-md text-slate-500">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
