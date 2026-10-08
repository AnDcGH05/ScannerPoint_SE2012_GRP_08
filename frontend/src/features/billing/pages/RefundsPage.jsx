import { useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { useToast } from '../../../components/Toast'
import { dateTime, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'

/** Receptionist: refunds for cancelled bookings (Stitch W4). */
export default function RefundsPage() {
  const toast = useToast()
  const refunds = useApi('/api/refunds')
  const [tab, setTab] = useState('PENDING')
  const [paying, setPaying] = useState(null)
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const all = refunds.data || []
  const list = all.filter((r) => tab === 'ALL' || r.status === tab)
  const pending = all.filter((r) => r.status === 'PENDING')

  const markRefunded = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.patch(`/api/refunds/${paying.id}/refunded`, { bankReference: reference })
      toast.success(`Refund to ${paying.customerName} recorded`)
      setPaying(null)
      refunds.reload()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Billing" title="Deposit refunds" subtitle="Refunds for cancelled bookings, worked out by the 24-hour rule. Pay them by bank transfer and record the reference." />
      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <StatCard label="Pending refunds" value={pending.length} icon="pending_actions" tone="amber" hint={`${money(pending.reduce((s, r) => s + Number(r.refundAmount), 0))} to pay`} />
        <StatCard label="Refunded" value={all.filter((r) => r.status === 'REFUNDED').length} icon="verified" tone="green" />
        <StatCard label="Penalties kept" value={money(all.reduce((s, r) => s + Number(r.penaltyAmount), 0))} icon="gavel" tone="orange" />
        <div className="card p-5">
          <p className="mb-2 flex items-center gap-2 text-label-lg text-navy"><Icon name="rule" /> Cancellation rule</p>
          <p className="flex items-center gap-2 text-body-md"><Icon name="check_circle" className="text-success" /> 24 hours or more: full refund</p>
          <p className="mt-1 flex items-center gap-2 text-body-md"><Icon name="warning" className="text-warning" /> Less than 24 hours: 50% kept</p>
        </div>
      </div>

      <section className="card">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[
          { key: 'PENDING', label: 'Pending', count: pending.length },
          { key: 'REFUNDED', label: 'Refunded', count: all.length - pending.length },
          { key: 'ALL', label: 'All', count: all.length },
        ]} />
        {refunds.loading ? <Loading /> : refunds.error ? <ErrorBanner error={refunds.error} className="m-4" /> : !list.length ? (
          <EmptyState icon="currency_exchange" title="No refunds here" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="table-head"><tr><th>Customer</th><th>Package</th><th>Booked / cancelled</th><th className="!text-right">Notice</th>
                <th className="!text-right">Deposit</th><th className="!text-right">Penalty</th><th className="!text-right">Refund</th><th>Status</th><th /></tr></thead>
              <tbody className="table-body">
                {list.map((r) => (
                  <tr key={r.id}>
                    <td><p className="font-semibold text-navy">{r.customerName}</p><p className="text-body-sm text-slate-500">BOOKING-{String(r.appointmentId).padStart(4, '0')}</p></td>
                    <td>{r.packageName}</td>
                    <td><p>{dateTime(r.scheduledAt)}</p><p className="text-body-sm text-slate-500">Cancelled {dateTime(r.cancelledAt)}</p></td>
                    <td className="text-right">
                      <p className="num">{r.noticeHours} h</p>
                      <p className={`text-body-sm ${r.noticeHours >= 24 ? 'text-success' : 'text-warning'}`}>{r.noticeHours >= 24 ? 'Full refund' : '50% penalty'}</p>
                    </td>
                    <td className="text-right num">{money(r.depositPaid)}</td>
                    <td className="text-right num text-danger">{Number(r.penaltyAmount) ? `-${money(r.penaltyAmount)}` : money(0)}</td>
                    <td className="text-right font-semibold num">{money(r.refundAmount)}</td>
                    <td><StatusBadge status={r.status} />{r.bankReference && <p className="mt-1 text-body-sm text-slate-500">{r.bankReference}</p>}</td>
                    <td className="text-right">
                      {r.status === 'PENDING' && <Button size="sm" icon="payments" onClick={() => { setPaying(r); setReference(''); setError(null) }}>Mark refunded</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={!!paying} onClose={() => setPaying(null)} title="Mark refunded" icon="payments"
        footer={<><Button variant="outline" onClick={() => setPaying(null)}>Cancel</Button>
          <Button variant="success" icon="check" loading={busy} disabled={!reference.trim()} onClick={markRefunded}>Confirm refund</Button></>}>
        {paying && <p className="mb-4 text-body-md text-slate-600">Transfer <b className="num">{money(paying.refundAmount)}</b> to {paying.customerName}, then enter the bank transfer reference.</p>}
        <Field label="Bank transfer reference"><input className="input" maxLength={30} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. HNB-RF-500114" /></Field>
        <ErrorBanner error={error} className="mt-4" />
      </Modal>
    </>
  )
}
