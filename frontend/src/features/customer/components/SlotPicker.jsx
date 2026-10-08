import { useMemo, useState } from 'react'
import Icon from '../../../components/Icon'
import { Loading } from '../../../components/States'
import { isoDate } from '../../../lib/format'
import useApi from '../../../lib/useApi'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Calendar on the left, free time slots on the right (taken slots greyed). value = "yyyy-MM-ddTHH:mm:00". */
export default function SlotPicker({ value, onChange }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [day, setDay] = useState(() => (value ? value.slice(0, 10) : isoDate(new Date(today.getTime() + 86400000))))
  const [month, setMonth] = useState(() => { const d = new Date(`${day}T00:00:00`); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const slots = useApi('/api/appointments/slots', { params: { date: day } })

  const cells = useMemo(() => {
    const first = (month.getDay() + 6) % 7 // Monday first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))]
  }, [month])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-card border border-line p-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" className="rounded p-1 hover:bg-slate-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)} aria-label="Previous month"><Icon name="chevron_left" /></button>
          <p className="text-label-lg text-navy">{MONTHS[month.getMonth()]} {month.getFullYear()}</p>
          <button type="button" className="rounded p-1 hover:bg-slate-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><Icon name="chevron_right" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-label-sm text-slate-500">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <span key={d} className="py-1">{d}</span>)}
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />
            const iso = isoDate(d)
            const past = d < today
            const selected = iso === day
            return (
              <button key={iso} type="button" disabled={past} onClick={() => setDay(iso)}
                className={`h-9 rounded-control text-body-md num ${selected ? 'bg-navy text-white' : past ? 'text-slate-300' : 'text-navy hover:bg-orange-light'}`}>
                {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 text-label-lg text-navy">Available times</p>
        {slots.loading ? <Loading /> : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(slots.data || []).map((s) => {
              const selected = value === s.start.slice(0, 19)
              return (
                <button key={s.start} type="button" disabled={!s.available} onClick={() => onChange(s.start.slice(0, 19), s)}
                  className={`flex flex-col items-center rounded-full border px-3 py-2 text-label-lg transition-colors ${
                    selected ? 'border-orange bg-orange text-white' : s.available ? 'border-slate-300 text-navy hover:border-navy' : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'}`}>
                  {s.label}
                  <span className={`text-label-sm font-normal no-underline ${selected ? 'text-white' : 'text-slate-500'}`}>{s.available ? `${s.freeBays.length} bay${s.freeBays.length > 1 ? 's' : ''} free` : 'Full'}</span>
                </button>
              )
            })}
          </div>
        )}
        <p className="mt-3 text-body-sm text-slate-500">Workshop hours 8:00 am – 4:00 pm · 4 service bays</p>
      </div>
    </div>
  )
}
