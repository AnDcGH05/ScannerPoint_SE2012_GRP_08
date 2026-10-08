import { useEffect, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import { ErrorBanner, Loading, Notice } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { dateTime, money } from '../../../lib/format'

/** Cancel with the 24-hour rule (Stitch A5). The figures come from the server's cancel-preview. */
export default function CancelBookingModal({ booking, onClose, onCancelled }) {
  const toast = useToast()
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!booking) return
    setPreview(null)
    setError(null)
    api.get(`/api/appointments/${booking.id}/cancel-preview`).then((r) => setPreview(r.data)).catch((e) => setError(errorMessage(e)))
  }, [booking])

  const cancel = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.post(`/api/appointments/${booking.id}/cancel`)
      const r = res.data.refund
      toast.success(r ? `Booking cancelled – refund ${money(r.refundAmount)}` : 'Booking cancelled')
      onCancelled?.(res.data)
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title="Cancel booking" icon="event_busy" tone="danger"
      footer={<><Button variant="outline" onClick={onClose}>Keep booking</Button>
        <Button variant="danger" icon="cancel" loading={busy} disabled={!preview} onClick={cancel}>Cancel booking</Button></>}>
      {booking && <p className="mb-4 text-body-md text-slate-600">{booking.paymentReference} · {booking.vehicleName} · {booking.packageName}</p>}
      {!preview && !error && <Loading />}
      {preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-control bg-page p-3 text-body-md">
            <Icon name="schedule" className="text-navy" /> Booked for <b>{dateTime(preview.scheduledAt)}</b>
          </div>
          <Notice tone={preview.fullRefund ? 'success' : 'warning'} icon="gavel">{preview.message}</Notice>
          <dl className="space-y-1.5 rounded-card border border-line p-4 text-body-md">
            <div className="flex justify-between"><dt>Deposit paid</dt><dd className="num">{money(preview.depositPaid)}</dd></div>
            <div className="flex justify-between text-danger"><dt>Penalty kept (less than 24 hours' notice)</dt><dd className="num whitespace-nowrap">-{money(preview.penaltyAmount)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-label-lg text-navy"><dt>Refund</dt><dd className="num">{money(preview.refundAmount)}</dd></div>
          </dl>
          <p className="text-body-sm text-slate-500">24 hours or more before the booked time: full refund. Less than 24 hours: 50% of the deposit is kept.</p>
        </div>
      )}
      <ErrorBanner error={error} className="mt-4" />
    </Modal>
  )
}
