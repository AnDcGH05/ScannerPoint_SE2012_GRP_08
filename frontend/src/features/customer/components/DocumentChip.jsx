import Icon from '../../../components/Icon'
import StatusBadge from '../../../components/StatusBadge'
import { date } from '../../../lib/format'

/** "Driving licence – VERIFIED – expires 30 Jun 2030" chip on a vehicle card. */
export default function DocumentChip({ type, doc }) {
  const name = type === 'INSURANCE' ? 'Insurance' : 'Driving licence'
  return (
    <div className="flex items-center justify-between gap-2 rounded-control border border-line bg-page px-3 py-2" title={doc?.rejectReason || ''}>
      <div className="flex min-w-0 items-center gap-2">
        <Icon name={type === 'INSURANCE' ? 'verified_user' : 'badge'} className="text-[18px] text-navy" />
        <div className="min-w-0">
          <p className="text-label-md text-navy">{name}</p>
          <p className={`text-body-sm ${doc?.expiringSoon ? 'font-semibold text-danger' : 'text-slate-500'}`}>
            {doc ? `Expires ${date(doc.expiryDate)}` : 'Not uploaded'}
          </p>
        </div>
      </div>
      {doc ? <StatusBadge status={doc.status} /> : <StatusBadge status="NOT_UPLOADED" text="Missing" />}
    </div>
  )
}

/** The newest document of each type. */
export function latestDocs(documents = []) {
  const pick = (t) => documents.filter((d) => d.docType === t).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0]
  return { DRIVING_LICENCE: pick('DRIVING_LICENCE'), INSURANCE: pick('INSURANCE') }
}
