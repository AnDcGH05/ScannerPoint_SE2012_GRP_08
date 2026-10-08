import { useEffect, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Modal from '../../../components/Modal'
import { ErrorBanner } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { dateTime } from '../../../lib/format'
import SlotPicker from './SlotPicker.jsx'

export default function RescheduleModal({ booking, onClose, onDone }) {
  const toast = useToast()
  const [slot, setSlot] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => { setSlot(null); setError(null) }, [booking])

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.patch(`/api/appointments/${booking.id}/reschedule`, { scheduledAt: slot })
      toast.success(`Moved to ${dateTime(slot)}`)
      onDone?.()
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title={`Reschedule ${booking?.paymentReference || ''}`} icon="event_repeat" size="xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button icon="event_available" disabled={!slot} loading={busy} onClick={save}>Move booking</Button></>}>
      {booking && <p className="mb-4 text-body-md text-slate-600">Currently {dateTime(booking.scheduledAt)} · Bay {booking.bayNo}</p>}
      {booking && <SlotPicker value={slot} onChange={setSlot} />}
      <ErrorBanner error={error} className="mt-4" />
    </Modal>
  )
}
