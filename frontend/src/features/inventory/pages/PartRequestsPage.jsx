import { useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import ReasonModal from '../../../components/ReasonModal'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { useToast } from '../../../components/Toast'
import { ago, dateTime } from '../../../lib/format'
import useApi from '../../../lib/useApi'

const PRESETS = ['Stock not available', 'Outdated stock – replaceable', 'Wrong part for this vehicle']

/** Storekeeper: part request queue (Stitch T3). */
export default function PartRequestsPage() {
  const toast = useToast()
  const [tab, setTab] = useState('OPEN')
  const params = tab === 'OPEN' ? undefined : { status: tab }
  const requests = useApi('/api/part-requests', { params, pollMs: 15000 })
  const [busyId, setBusyId] = useState(null)
  const [rejecting, setRejecting] = useState(null)

  const act = async (id, fn, msg) => {
    setBusyId(id)
    try {
      await fn()
      toast.success(msg)
      requests.reload()
      setRejecting(null)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  const list = requests.data || []

  return (
    <>
      <PageHeader eyebrow="Stores" title="Part requests" subtitle="Requests from mechanics. Issuing a part writes it to the stock ledger and lowers the stock automatically." />
      <section className="card">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[
          { key: 'OPEN', label: 'Pending' }, { key: 'ISSUED', label: 'Issued' }, { key: 'REJECTED', label: 'Rejected' },
        ]} />
        {requests.loading ? <Loading /> : requests.error ? <ErrorBanner error={requests.error} className="m-4" /> : !list.length ? (
          <EmptyState icon="task_alt" title={tab === 'OPEN' ? 'No requests waiting' : 'Nothing here yet'} />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((r) => {
              const canIssue = r.suggestedAction === 'Can issue'
              return (
                <li key={r.id} className="grid gap-4 px-5 py-4 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-3">
                    <p className="text-label-lg text-navy">Job #{r.jobCardId} · {r.vehicleName}</p>
                    <p className="text-body-sm text-slate-500"><Icon name="engineering" className="text-[14px]" /> {r.mechanicName} · {ago(r.requestedAt)}</p>
                  </div>
                  <div className="lg:col-span-4">
                    <p className="text-label-lg text-navy">{r.partName}</p>
                    <p className="text-body-sm text-slate-500 num">{r.partCode} · requested <b>{r.quantity}</b> · in stock <b>{r.inStock}</b></p>
                  </div>
                  <div className="lg:col-span-2">
                    {r.status === 'PENDING' || r.status === 'BACK_ORDERED' ? (
                      <div className="flex flex-wrap gap-1">
                        <StatusBadge status={canIssue ? 'APPROVED' : 'REJECTED'} text={r.suggestedAction} />
                        {r.status === 'BACK_ORDERED' && <StatusBadge status="BACK_ORDERED" />}
                      </div>
                    ) : (
                      <div>
                        <StatusBadge status={r.status} />
                        <p className="mt-1 text-body-sm text-slate-500">{r.handledByName} · {dateTime(r.handledAt)}</p>
                        {r.rejectReason && <p className="text-body-sm text-danger">{r.rejectReason}</p>}
                      </div>
                    )}
                  </div>
                  {(r.status === 'PENDING' || r.status === 'BACK_ORDERED') && (
                    <div className="flex flex-wrap justify-end gap-2 lg:col-span-3">
                      <Button size="sm" variant="success" icon="check_circle" disabled={!canIssue} loading={busyId === r.id}
                        onClick={() => act(r.id, () => api.patch(`/api/part-requests/${r.id}/issue`), `${r.partName} issued to job #${r.jobCardId}`)}>Approve & issue</Button>
                      {r.status === 'PENDING' && !canIssue && (
                        <Button size="sm" variant="outline" icon="schedule"
                          onClick={() => act(r.id, () => api.patch(`/api/part-requests/${r.id}/back-order`), 'Request back-ordered')}>Back-order</Button>
                      )}
                      <Button size="sm" variant="danger-outline" icon="close" onClick={() => setRejecting(r)}>Reject</Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <ReasonModal open={!!rejecting} onClose={() => setRejecting(null)} presets={PRESETS} loading={busyId === rejecting?.id}
        title={`Reject request – ${rejecting?.partName || ''}`} description="The mechanic sees this reason on the job page."
        onSubmit={(reason) => act(rejecting.id, () => api.patch(`/api/part-requests/${rejecting.id}/reject`, { reason }), 'Request rejected')} />
    </>
  )
}
