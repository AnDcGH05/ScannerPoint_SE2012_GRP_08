/** "In stock vs re-order level" progress bar. */
export default function StockBar({ inStock, reorderLevel }) {
  const max = Math.max(reorderLevel * 2, inStock, 1)
  const pct = Math.min(100, Math.round((inStock / max) * 100))
  const colour = inStock === 0 ? 'bg-danger' : inStock <= reorderLevel ? 'bg-orange' : 'bg-success'
  return (
    <div className="min-w-[140px]">
      <div className="mb-1 flex justify-between text-body-sm">
        <span className="font-semibold text-navy num">{inStock} in stock</span>
        <span className="text-slate-500 num">re-order {reorderLevel}</span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${colour}`} style={{ width: `${pct}%` }} />
        <div className="absolute top-[-3px] h-3.5 w-0.5 bg-navy" style={{ left: `${Math.min(100, (reorderLevel / max) * 100)}%` }} />
      </div>
    </div>
  )
}
