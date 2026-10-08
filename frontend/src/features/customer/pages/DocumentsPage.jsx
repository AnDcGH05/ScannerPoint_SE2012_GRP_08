import { useMemo, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import FileViewer from '../../../components/FileViewer'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import ReasonModal from '../../../components/ReasonModal'
import StatCard from '../../../components/StatCard'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { useToast } from '../../../components/Toast'
import { ago, date } from '../../../lib/format'
import useApi from '../../../lib/useApi'

const PRESETS = ['Document has expired', 'Scan is unclear – please upload a clearer copy', 'Name does not match the vehicle owner', 'Wrong document uploaded']
const NAMES = { DRIVING_LICENCE: 'Driving licence', INSURANCE: 'Insurance certificate' }

/** Receptionist: documents to verify (Stitch A7). */
export default function DocumentsPage() {
  const toast = useToast()
  const docs = useApi('/api/documents/pending')
  const [tab, setTab] = useState('PENDING')
  const [selectedId, setSelectedId] = useState(null)
  const [rejecting, setRejecting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')

  const all = docs.data || []
  const list = all.filter((d) => (tab === 'PENDING' ? d.status === 'PENDING' : d.expiringSoon)
    && `${d.registrationNo} ${d.ownerName}`.toLowerCase().includes(q.toLowerCase()))
  const groups = useMemo(() => {
    const g = {}
    list.forEach((d) => { (g[d.vehicleId] ||= { vehicle: d, docs: [] }).docs.push(d) })
    return Object.values(g)
  }, [list])
  const selected = all.find((d) => d.id === selectedId) || list[0]

  const act = async (fn, msg) => {
    setBusy(true)
    try {
      await fn()
      toast.success(msg)
      setRejecting(false)
      setSelectedId(null)
      docs.reload()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Front desk" title="Documents to verify" subtitle="Driving licences and insurance certificates uploaded by customers. Both must be verified before a vehicle can be checked in." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Waiting for verification" value={all.filter((d) => d.status === 'PENDING').length} icon="pending_actions" tone="amber" />
        <StatCard label="Expiring within 30 days" value={all.filter((d) => d.expiringSoon).length} icon="event_upcoming" tone="red" />
        <StatCard label="Vehicles waiting" value={new Set(all.filter((d) => d.status === 'PENDING').map((d) => d.vehicleId)).size} icon="directions_car" />
      </div>
      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card xl:col-span-2">
          <Tabs className="px-3" value={tab} onChange={setTab} tabs={[
            { key: 'PENDING', label: 'Pending', count: all.filter((d) => d.status === 'PENDING').length },
            { key: 'EXPIRING', label: 'Expiring ≤ 30 days', count: all.filter((d) => d.expiringSoon).length },
          ]} />
          <div className="border-b border-line p-3">
            <input className="input" placeholder="Filter by plate or owner…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {docs.loading ? <Loading /> : docs.error ? <ErrorBanner error={docs.error} className="m-4" /> : !groups.length ? (
            <EmptyState icon="task_alt" title="Nothing to check" />
          ) : (
            <ul className="divide-y divide-line">
              {groups.map((g) => (
                <li key={g.vehicle.vehicleId} className="p-4">
                  <div className="mb-2 flex items-center gap-2"><Plate value={g.vehicle.registrationNo} size="sm" /><span className="text-body-sm text-slate-500">{g.vehicle.ownerName}</span></div>
                  {g.docs.map((d) => (
                    <button key={d.id} type="button" onClick={() => setSelectedId(d.id)}
                      className={`mb-1 flex w-full items-center gap-3 rounded-control px-3 py-2 text-left ${selected?.id === d.id ? 'bg-orange-light' : 'hover:bg-page'}`}>
                      <Icon name={d.docType === 'INSURANCE' ? 'verified_user' : 'badge'} className="text-navy" />
                      <div className="min-w-0 flex-1">
                        <p className="text-label-md text-navy">{NAMES[d.docType]}</p>
                        <p className={`text-body-sm ${d.expiringSoon ? 'font-semibold text-danger' : 'text-slate-500'}`}>
                          {d.expiringSoon ? `Expires in ${d.daysToExpiry} days` : `Uploaded ${ago(d.uploadedAt)}`}
                        </p>
                      </div>
                      <StatusBadge status={d.status} />
                    </button>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5 xl:col-span-3">
          {!selected ? <EmptyState icon="description" title="Select a document" /> : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-headline-md text-navy">{NAMES[selected.docType]}</h2>
                  <p className="text-body-md text-slate-500">{selected.vehicleName} · Owner: {selected.ownerName}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <FileViewer url={selected.fileUrl} />
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-control bg-page p-3"><dt className="text-label-sm uppercase text-slate-500">Document no.</dt><dd className="text-label-lg text-navy num">{selected.documentNo}</dd></div>
                <div className={`rounded-control p-3 ${selected.expiringSoon ? 'bg-danger-bg' : 'bg-page'}`}><dt className="text-label-sm uppercase text-slate-500">Expiry date</dt><dd className="text-label-lg text-navy">{date(selected.expiryDate)}</dd></div>
                <div className="rounded-control bg-page p-3"><dt className="text-label-sm uppercase text-slate-500">Uploaded</dt><dd className="text-label-lg text-navy">{date(selected.uploadedAt)}</dd></div>
              </dl>
              {selected.status === 'PENDING' ? (
                <div className="flex gap-2">
                  <Button variant="success" icon="verified" className="flex-1" loading={busy}
                    onClick={() => act(() => api.patch(`/api/documents/${selected.id}/verify`), `${NAMES[selected.docType]} verified`)}>Verify</Button>
                  <Button variant="danger-outline" icon="block" onClick={() => setRejecting(true)}>Reject</Button>
                </div>
              ) : (
                <p className="text-body-md text-slate-600">Verified by {selected.verifiedByName}. It expires soon – remind the customer to upload the renewed document.</p>
              )}
            </div>
          )}
        </section>
      </div>
      <ReasonModal open={rejecting} onClose={() => setRejecting(false)} presets={PRESETS} loading={busy}
        title={`Reject ${selected ? NAMES[selected.docType].toLowerCase() : ''}`} description="The customer sees this reason and is asked to upload the document again."
        onSubmit={(reason) => act(() => api.patch(`/api/documents/${selected.id}/reject`, { reason }), 'Document rejected')} />
    </>
  )
}
