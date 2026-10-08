import { useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Field from '../../../components/Field'
import FileUpload from '../../../components/FileUpload'
import Icon from '../../../components/Icon'
import { ErrorBanner, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { useToast } from '../../../components/Toast'
import { dateTime, isoDate, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'

function CopyRow({ label, value, big }) {
  const toast = useToast()
  return (
    <div className="flex items-center justify-between gap-3 rounded-control border border-line bg-page px-3 py-2">
      <div className="min-w-0">
        <p className="text-label-sm uppercase tracking-wider text-slate-500">{label}</p>
        <p className={`${big ? 'text-headline-sm' : 'text-label-lg'} text-navy num break-all`}>{value}</p>
      </div>
      <button type="button" className="rounded p-1.5 text-navy hover:bg-white" title="Copy"
        onClick={() => navigator.clipboard?.writeText(value).then(() => toast.info(`${label} copied`))}>
        <Icon name="content_copy" className="text-[18px]" />
      </button>
    </div>
  )
}

/**
 * Pay by bank transfer + upload the slip (Stitch W1). Used for booking deposits
 * (type="DEPOSIT", targetId = booking id) and final bills (type="FINAL", targetId = bill id).
 */
export default function PaymentPanel({ type, targetId, amount, reference, onChanged }) {
  const toast = useToast()
  const bank = useApi('/api/payments/bank-details')
  const history = useApi(`/api/payments?${type === 'DEPOSIT' ? 'appointmentId' : 'invoiceId'}=${targetId}`)
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ amount: amount ?? '', paidOn: isoDate(), bankReference: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [reupload, setReupload] = useState(false)

  const payments = history.data || []
  const latest = payments[0]
  const waiting = latest?.status === 'PENDING'
  const verifiedTotal = payments.filter((p) => p.status === 'VERIFIED').reduce((s, p) => s + Number(p.amount), 0)
  const done = type === 'DEPOSIT' ? verifiedTotal >= Number(amount) : Number(amount) <= 0
  const showForm = !waiting && !done && (!latest || latest.status !== 'REJECTED' || reupload)

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please attach the payment slip')
    setBusy(true)
    setError(null)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append(type === 'DEPOSIT' ? 'appointmentId' : 'invoiceId', targetId)
      data.append('amount', form.amount)
      data.append('paidOn', form.paidOn)
      if (form.bankReference) data.append('bankReference', form.bankReference)
      await api.post(`/api/payments/${type === 'DEPOSIT' ? 'deposit' : 'final'}`, data)
      toast.success('Slip uploaded – the receptionist will verify it shortly')
      setFile(null)
      setReupload(false)
      history.reload()
      onChanged?.()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="account_balance" className="text-navy" />
          <h2 className="text-headline-sm text-navy">Pay by bank transfer</h2>
        </div>
        <div className="mb-4 rounded-card bg-navy p-5 text-white">
          <p className="text-label-sm uppercase tracking-wider text-on-primary-container">Amount to pay</p>
          <p className="mt-1 text-headline-xl num">{money(amount)}</p>
        </div>
        {bank.data && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <CopyRow label="Bank" value={bank.data.bankName} />
              <CopyRow label="Branch" value={bank.data.branch} />
            </div>
            <CopyRow label="Account name" value={bank.data.accountName} />
            <CopyRow label="Account number" value={bank.data.accountNo} big />
          </div>
        )}
        <div className="mt-4 rounded-card border-2 border-orange bg-orange-light p-4">
          <p className="text-label-sm uppercase tracking-wider text-orange-dark">Write this reference on the transfer</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-headline-md text-navy num">{reference}</p>
            <Button size="sm" variant="outline" icon="content_copy"
              onClick={() => navigator.clipboard?.writeText(reference).then(() => toast.info('Reference copied'))}>Copy</Button>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="receipt_long" className="text-navy" />
          <h2 className="text-headline-sm text-navy">Upload your payment slip</h2>
        </div>

        {done && <Notice tone="success" icon="verified">Payment verified. Thank you!</Notice>}
        {waiting && (
          <Notice tone="warning" icon="hourglass_top">
            <p className="font-semibold">Waiting for verification</p>
            <p>Your slip for {money(latest.amount)} was uploaded {dateTime(latest.uploadedAt)}. We will let you know once it is checked.</p>
          </Notice>
        )}
        {!waiting && !done && latest?.status === 'REJECTED' && !reupload && (
          <Notice tone="danger" icon="block">
            <p className="font-semibold">Rejected – {latest.rejectReason}</p>
            <p className="mb-3">Please upload a new slip.</p>
            <Button size="sm" variant="danger" icon="refresh" onClick={() => setReupload(true)}>Upload again</Button>
          </Notice>
        )}

        {showForm && (
          <form onSubmit={submit} className="space-y-4">
            <FileUpload file={file} onChange={setFile} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount paid (Rs.)" required>
                <input className="input num" type="number" min="1" step="0.01" required value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </Field>
              <Field label="Date on slip" required>
                <input className="input" type="date" required max={isoDate()} value={form.paidOn}
                  onChange={(e) => setForm({ ...form, paidOn: e.target.value })} />
              </Field>
            </div>
            <Field label="Bank reference number" hint="Printed on the slip or shown in your banking app">
              <input className="input" maxLength={30} value={form.bankReference} placeholder="e.g. HNB-700112"
                onChange={(e) => setForm({ ...form, bankReference: e.target.value })} />
            </Field>
            <ErrorBanner error={error} />
            <Button type="submit" className="w-full" size="lg" icon="upload" loading={busy}>Submit slip</Button>
          </form>
        )}

        {payments.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="mb-2 text-label-md text-slate-500">Slips uploaded</p>
            <ul className="space-y-2">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-body-md">
                  <span className="num">{money(p.amount)} · {dateTime(p.uploadedAt)}</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
