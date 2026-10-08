import Icon from './Icon.jsx'

const TONES = {
  navy: 'bg-blue-50 text-navy',
  orange: 'bg-orange-light text-orange-dark',
  green: 'bg-success-bg text-success',
  red: 'bg-danger-bg text-danger',
  amber: 'bg-warning-bg text-warning',
}

/** Summary card used across dashboards. */
export default function StatCard({ label, value, icon, hint, tone = 'navy', onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag onClick={onClick} className={`card p-5 text-left ${onClick ? 'hover:shadow-raised transition-shadow' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label-sm uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-headline-lg text-navy num">{value}</p>
          {hint && <p className="mt-1 text-body-sm text-slate-500">{hint}</p>}
        </div>
        {icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${TONES[tone]}`}>
            <Icon name={icon} />
          </span>
        )}
      </div>
    </Tag>
  )
}
