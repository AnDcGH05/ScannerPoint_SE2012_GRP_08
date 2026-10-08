/** Formatting rules agreed in the work plan (G11). */

const moneyFmt = new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 18000 -> "Rs. 18,000.00" */
export function money(value) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  return `${n < 0 ? '-' : ''}Rs. ${moneyFmt.format(Math.abs(n))}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parse(value) {
  if (!value) return null
  if (value instanceof Date) return value
  // ISO strings from the backend have no time zone: they are already Sri Lankan time
  const [d, t = '00:00:00'] = String(value).split('T')
  const [y, m, day] = d.split('-').map(Number)
  const [hh, mm] = t.split(':').map(Number)
  return new Date(y, m - 1, day, hh || 0, mm || 0)
}

/** "08 Oct 2026" */
export function date(value) {
  const d = parse(value)
  if (!d) return '—'
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "9:30 am" */
export function time(value) {
  const d = parse(value)
  if (!d) return '—'
  let h = d.getHours()
  const ampm = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`
}

/** "08 Oct 2026, 9:30 am" */
export function dateTime(value) {
  if (!value) return '—'
  return `${date(value)}, ${time(value)}`
}

/** Local date as yyyy-MM-dd for <input type="date"> and API params. */
export function isoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Local date-time as yyyy-MM-ddTHH:mm:00 for the API. */
export function isoDateTime(d) {
  return `${isoDate(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`
}

/** "AWAITING_APPROVAL" -> "Awaiting Approval" */
export function label(value) {
  if (!value) return ''
  return String(value).toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** "2 h ago", "3 d ago" */
export function ago(value) {
  const d = parse(value)
  if (!d) return ''
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h} h ago`
  return `${Math.round(h / 24)} d ago`
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}
