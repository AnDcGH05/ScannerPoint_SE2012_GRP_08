/** Underlined tab bar with optional counts. */
export default function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 overflow-x-auto border-b border-line ${className}`}>
      {tabs.map((t) => {
        const active = t.key === value
        return (
          <button key={t.key} type="button" onClick={() => onChange(t.key)}
            className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-label-lg transition-colors ${
              active ? 'border-orange text-navy' : 'border-transparent text-slate-500 hover:text-navy'}`}>
            {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-2 text-label-sm ${active ? 'bg-orange text-white' : 'bg-slate-100 text-slate-600'}`}>{t.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
