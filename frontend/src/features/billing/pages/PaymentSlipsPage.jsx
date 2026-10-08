import { useMemo, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import FileViewer from '../../../components/FileViewer'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import ReasonModal from '../../../components/ReasonModal'
import StatCard from '../../../components/StatCard'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { useToast } from '../../../components/Toast'
import { date, money, time } from '../../../lib/format'
import useApi from '../../../lib/useApi'

const PRESETS = ['Amount below the required deposit', 'Incorrect booking reference', 'Unclear or unreadable slip', 'Not found in the bank statement']

/** Receptionist: "Payment slips to verify" (Stitch W2). */
export default function PaymentSlipsPage() {
  const toast = useToast()
  const queue = useApi('/api/payments/pending', { pollMs: 15000 })
  const [tab, setTab] = useState('ALL')
  const [selectedId, setSelectedId] = useState(null)
  const [checks, setChecks] = useState({})
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [error, setError] = useState(null)

  const all = queue.data || []
  const rows = useMemo(() => all.filter((p) =>
    tab === 'ALL' || (tab === 'DEPOSIT' && p.type === 'DEPOSIT') || (tab === 'FINAL' && p.type === 'FINAL') || (tab === 'DIFF' && !p.amountMatches)), [all, tab])
  const selected = all.find((p) => p.id === selectedId) || rows[0]

  const act = async (fn) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      setChecks({})
      setSelectedId(null)
      queue.reload()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const verify = () => act(async () => {
    await api.patch(`/api/payments/${selected.id}/verify`)
    toast.success(selected.type === 'DEPOSIT'
      ? `Deposit verified – ${selected.payingFor} is confirmed and the customer's "Booked" box is updated`
      : `Payment verified for ${selected.payingFor}`)
  })

  const reject = (reason) => act(async () => {
    await api.patch(`/api/payments/${selected.id}/reject`, { reason })
    setRejecting(false)
    toast.success('Slip rejected – the customer will be asked to upload a new one')
  })

  return (
    <>
      <PageHeader eyebrow="Billing" title="Payment slips to verify"
        subtitle="Check each bank-transfer slip against the booking deposit or the bill balance." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending slips" value={all.length} icon="pending_actions" tone="amber"
          hint={`${all.filter((p) => p.type === 'DEPOSIT').length} deposits · ${all.filter((p) => p.type === 'FINAL').length} final bills`} />
        <StatCard label="Amount differs" value={all.filter((p) => !p.amountMatches).length} icon="warning" tone="red" hint="Slip amount ≠ amount expected" />
        <StatCard label="Waiting longest" value={all.length ? `${Math.max(...all.map((p) => p.hoursWaiting))} h` : '–'} icon="timer" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card xl:col-span-3">
          <Tabs className="px-3" value={tab} onChange={setTab} tabs={[
            { key: 'ALL', label: 'All pending', count: all.length },
            { key: 'DEPOSIT', label: 'Deposits', count: all.filter((p) => p.type === 'DEPOSIT').length },
            { key: 'FINAL', label: 'Final bills', count: all.filter((p) => p.type === 'FINAL').length },
            { key: 'DIFF', label: 'Amount differs', count: all.filter((p) => !p.amountMatches).length },
          ]} />
          {queue.loading ? <Loading /> : queue.error ? <ErrorBanner error={queue.error} className="m-4" /> : !rows.length ? (
            <EmptyState icon="task_alt" title="All caught up" text="There are no slips waiting for verification." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead className="table-head"><tr><th>Uploaded</th><th>Customer</th><th>Type</th><th>Paying for</th><th className="!text-right">Slip vs expected</th></tr></thead>
                <tbody className="table-body">
                  {rows.map((p) => (
                    <tr key={p.id} onClick={() => { setSelectedId(p.id); setChecks({}) }}
                      className={`cursor-pointer ${selected?.id === p.id ? '[&>td]:!bg-orange-light' : ''}`}>
                      <td><p className="text-label-lg text-navy">{time(p.uploadedAt)}</p><p className="text-body-sm text-slate-500">{date(p.uploadedAt)} · {p.hoursWaiting} h</p></td>
                      <td className="text-navy">{p.customerName}</td>
                      <td><StatusBadge status={p.type} text={p.type === 'DEPOSIT' ? 'Deposit' : 'Final'} /></td>
                      <td className="num">{p.payingFor}</td>
                      <td className="text-right">
                        <p className="font-semibold num">{money(p.amount)}</p>
                        <p className={`text-body-sm num ${p.amountMatches ? 'text-success' : 'font-semibold text-danger'}`}>
                          {p.amountMatches ? 'Matches' : `Expected ${money(p.amountExpected)}`}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card p-5 xl:col-span-2">
          {!selected ? <EmptyState icon="receipt_long" title="Select a slip" /> : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-headline-sm text-navy">{selected.payingFor} · {selected.customerName}</h2>
                  <p className="text-body-sm text-slate-500">Paid on {date(selected.paidOn)} · Ref {selected.bankReference || '—'}</p>
                </div>
                <StatusBadge status={selected.type} text={selected.type === 'DEPOSIT' ? 'Deposit' : 'Final'} />
              </div>
              <FileViewer url={selected.slipUrl} height="h-[340px]" />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-control bg-page p-3"><p className="text-label-sm uppercase text-slate-500">Slip amount</p><p className="text-headline-sm text-navy num">{money(selected.amount)}</p></div>
                <div className={`rounded-control p-3 ${selected.amountMatches ? 'bg-success-bg' : 'bg-danger-bg'}`}>
                  <p className="text-label-sm uppercase text-slate-500">Expected</p><p className="text-headline-sm text-navy num">{money(selected.amountExpected)}</p>
                </div>
              </div>
              <div className="space-y-2 rounded-card border border-line p-4">
                {[['amount', 'Amount matches'], ['bank', 'Reference found in bank statement'], ['date', 'Date is correct']].map(([k, t]) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2 text-body-md">
                    <input type="checkbox" className="h-4 w-4 accent-navy" checked={!!checks[k]} onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })} /> {t}
                  </label>
                ))}
              </div>
              <ErrorBanner error={error} />
              <div className="flex gap-2">
                <Button variant="success" icon="verified" className="flex-1" loading={busy}
                  disabled={!checks.amount || !checks.bank || !checks.date} onClick={verify}>Verify payment</Button>
                <Button variant="danger-outline" icon="block" onClick={() => setRejecting(true)}>Reject</Button>
              </div>
              {(!checks.amount || !checks.bank || !checks.date) && (
                <p className="flex items-center gap-1 text-body-sm text-slate-500"><Icon name="info" className="text-[16px]" /> Tick all three checks to verify.</p>
              )}
            </div>
          )}
        </section>
      </div>

      <ReasonModal open={rejecting} onClose={() => setRejecting(false)} onSubmit={reject} loading={busy} presets={PRESETS}
        title={`Reject slip – ${selected?.payingFor || ''}`}
        description="The customer sees this reason and is asked to upload a new slip." confirmText="Reject slip" />
    </>
  )
}
