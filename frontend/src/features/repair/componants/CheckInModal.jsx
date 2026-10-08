import { useEffect, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import Plate from '../../../components/Plate'
import { ErrorBanner, Loading, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { useToast } from '../../../components/Toast'
import { isoDate, time } from '../../../lib/format'
import useApi from '../../../lib/useApi'

/** "Check in vehicle" (Stitch S2): today's confirmed booking or a walk-in, mileage, mechanic, collection time. */
export default function CheckInModal({ open, onClose, onDone, appointmentId }) {
  const toast = useToast()
  const today = useApi(open ? '/api/appointments' : null, { params: { date: isoDate(), status: 'CONFIRMED' } })
  const mechanics = useApi(open ? '/api/staff' : null, { params: { role: 'MECHANIC' } })
  const [mode, setMode] = useState('booking')
  const [booking, setBooking] = useState(null)
  const [plate, setPlate] = useState('')
  const [found, setFound] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [form, setForm] = useState({ mileage: '', mechanicId: '', estimatedCompletion: '', docsChecked: false })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setMode('booking'); setBooking(null); setVehicle(null); setPlate(''); setFound(null); setError(null)
      setForm({ mileage: '', mechanicId: '', estimatedCompletion: `${isoDate()}T17:00`, docsChecked: false })
    }
  }, [open])

  useEffect(() => {
    if (open && appointmentId && today.data) setBooking(today.data.find((a) => a.id === appointmentId) || null)
  }, [open, appointmentId, today.data])

  const search = async () => {
    try {
      const res = await api.get('/api/vehicles/search', { params: { plate } })
      setFound(res.data)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  const target = mode === 'booking' ? booking : vehicle
  const docs = mode === 'walkin' && vehicle ? vehicle.documents : null
  const docsOk = !docs || ['DRIVING_LICENCE', 'INSURANCE'].every((t) => docs.some((d) => d.docType === t && d.status === 'VERIFIED' && d.daysToExpiry >= 0))

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      const body = {
        mileage: Number(form.mileage),
        mechanicId: form.mechanicId ? Number(form.mechanicId) : null,
        estimatedCompletion: form.estimatedCompletion ? `${form.estimatedCompletion}:00` : null,
        ...(mode === 'booking' ? { appointmentId: booking.id } : { vehicleId: vehicle.id }),
      }
      const res = await api.post('/api/jobcards', body)
      toast.success(`${res.data.registrationNo} checked in – job #${res.data.id}`)
      onDone?.(res.data)
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Check in vehicle" icon="login" size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button icon="how_to_reg" loading={busy} disabled={!target || !form.mileage || !form.docsChecked} onClick={submit}>Check in</Button></>}>
      <div className="mb-4 grid grid-cols-2 rounded-control bg-slate-100 p-1">
        {[['booking', "Today's booking", 'event_available'], ['walkin', 'Walk-in', 'directions_walk']].map(([k, t, i]) => (
          <button key={k} type="button" onClick={() => setMode(k)}
            className={`flex items-center justify-center gap-2 rounded-control py-2 text-label-lg ${mode === k ? 'bg-white text-navy shadow-card' : 'text-slate-500'}`}>
            <Icon name={i} className="text-[18px]" /> {t}
          </button>
        ))}
      </div>

      {mode === 'booking' ? (
        today.loading ? <Loading /> : !today.data?.length ? (
          <Notice tone="info">No confirmed bookings left for today. Use Walk-in for vehicles without a booking.</Notice>
        ) : (
          <ul className="mb-4 max-h-56 divide-y divide-line overflow-y-auto rounded-card border border-line">
            {today.data.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => setBooking(a)} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-page ${booking?.id === a.id ? 'bg-orange-light' : ''}`}>
                  <span className="w-16 text-label-lg text-navy">{time(a.scheduledAt)}</span>
                  <Plate value={a.registrationNo} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-body-md">{a.customerName} · {a.packageName}</span>
                  <span className="text-body-sm text-slate-500">Bay {a.bayNo}</span>
                  {booking?.id === a.id && <Icon name="check_circle" fill className="text-orange" />}
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <input className="input uppercase" placeholder="Search number plate, e.g. WP-CBK" value={plate} onChange={(e) => setPlate(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()} />
            <Button variant="navy" icon="search" onClick={search} disabled={!plate.trim()}>Search</Button>
          </div>
          {found && (found.length ? (
            <ul className="max-h-48 divide-y divide-line overflow-y-auto rounded-card border border-line">
              {found.map((v) => (
                <li key={v.id}>
                  <button type="button" onClick={() => setVehicle(v)} className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-page ${vehicle?.id === v.id ? 'bg-orange-light' : ''}`}>
                    <Plate value={v.registrationNo} size="sm" />
                    <span className="flex-1 text-body-md">{v.make} {v.model} · {v.ownerName}</span>
                    {vehicle?.id === v.id && <Icon name="check_circle" fill className="text-orange" />}
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="text-body-md text-slate-500">No vehicle found. Register the customer and vehicle first (Customers page).</p>)}
          {docs && (
            <div className="flex flex-wrap gap-2">
              {['DRIVING_LICENCE', 'INSURANCE'].map((t) => {
                const d = docs.find((x) => x.docType === t)
                return <StatusBadge key={t} status={d?.status || 'REJECTED'} text={`${t === 'INSURANCE' ? 'Insurance' : 'Licence'}: ${d?.status || 'missing'}`} />
              })}
            </div>
          )}
        </div>
      )}

      {docs && !docsOk && <Notice tone="danger" className="mb-4">Both documents must be verified before check-in. Verify them on the Documents page first.</Notice>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mileage (km)" required>
          <input className="input num" type="number" min="0" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
        </Field>
        <Field label="Assign mechanic">
          <select className="input" value={form.mechanicId} onChange={(e) => setForm({ ...form, mechanicId: e.target.value })}>
            <option value="">Assign later</option>
            {(mechanics.data || []).map((m) => <option key={m.id} value={m.id}>{m.fullName}{m.specialization ? ` – ${m.specialization}` : ''}</option>)}
          </select>
        </Field>
        <Field label="Estimated collection" className="sm:col-span-2">
          <input className="input" type="datetime-local" value={form.estimatedCompletion} onChange={(e) => setForm({ ...form, estimatedCompletion: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2 text-body-md sm:col-span-2">
          <input type="checkbox" className="h-4 w-4 accent-navy" checked={form.docsChecked} onChange={(e) => setForm({ ...form, docsChecked: e.target.checked })} />
          I have seen the original driving licence and insurance certificate
        </label>
      </div>
      <ErrorBanner error={error} className="mt-4" />
    </Modal>
  )
}
