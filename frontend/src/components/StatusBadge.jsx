import { label } from '../lib/format.js'

const GREEN = 'bg-success-bg text-success border-success-border'
const RED = 'bg-danger-bg text-danger border-danger-border'
const AMBER = 'bg-warning-bg text-warning border-warning-border'
const BEIGE = 'bg-beige text-beige-text border-beige-border'
const BLUE = 'bg-blue-50 text-navy border-blue-200'
const GREY = 'bg-slate-100 text-slate-600 border-slate-200'

const COLOURS = {
  PENDING: AMBER, NOT_UPLOADED: GREY, AWAITING_APPROVAL: AMBER, BACK_ORDERED: AMBER, DRAFT: GREY, PARTIAL: AMBER,
  VERIFIED: GREEN, CONFIRMED: GREEN, PAID: GREEN, APPROVED: GREEN, DONE: GREEN, ISSUED: GREEN, REFUNDED: GREEN,
  SENT: GREEN, COLLECTED: GREEN, READY: GREEN, ACTIVE: GREEN, NOT_REQUIRED: GREY,
  REJECTED: RED, CANCELLED: RED, FAILED: RED, NO_SHOW: RED, INACTIVE: RED,
  CHECKED_IN: BEIGE, INSPECTION: BEIGE, DIAGNOSIS: BEIGE, IN_PROGRESS: BLUE, QUALITY_CHECK: BLUE,
  DEPOSIT: BLUE, FINAL: BEIGE, RECEIPT: GREEN, ISSUE: RED, OPENING: GREY, RETURN: BLUE, ADJUSTMENT: AMBER,
}

/** Pill-shaped status badge: PENDING amber, VERIFIED/CONFIRMED/PAID green, REJECTED/CANCELLED red. */
export default function StatusBadge({ status, text, className = '' }) {
  if (!status) return null
  const colour = COLOURS[status] || GREY
  return (
    <span className={`inline-flex h-6 items-center rounded-full border px-2.5 text-label-sm uppercase tracking-wider whitespace-nowrap ${colour} ${className}`}>
      {text || label(status)}
    </span>
  )
}
