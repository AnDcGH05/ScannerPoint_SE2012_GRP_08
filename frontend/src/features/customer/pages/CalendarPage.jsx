import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Drawer from '../../../components/Drawer'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import { ErrorBanner, Loading, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { useToast } from '../../../components/Toast'
import { date, dateTime, isoDate, money, time } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import CheckInModal from '../../repair/components/CheckInModal'
import CancelBookingModal from '../components/CancelBookingModal.jsx'
import RescheduleModal from '../components/RescheduleModal.jsx'
import SlotPicker from '../components/SlotPicker.jsx'

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15]
const BAYS = [1, 2, 3, 4]
const BLOCK = {
  PENDING: 'border-warning-border bg-warning-bg', CONFIRMED: 'border-success-border bg-success-bg',
  CHECKED_IN: 'border-beige-border bg-beige', CANCELLED: 'border-danger-border bg-danger-bg opacity-60', NO_SHOW: 'border-slate-300 bg-slate-100 opacity-60',
}

const addDays = (iso, n) => { const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + n); return isoDate(d) }
const monday = (iso) => { const d = new Date(`${iso}T00:00:00`); return addDays(iso, -((d.getDay() + 6) % 7)) }

/** Receptionist: bay booking calendar (Stitch A8). */
export default function CalendarPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [day, setDay] = useState(isoDate())
  const [view, setView] = useState('day')
  const from = view === 'day' ? day : monday(day)
  const to = view === 'day' ? day : addDays(from, 6)
  const bookings = useApi('/api/appointments', { params: { from, to } })
  const [selectedId, setSelectedId] = useState(null)
  const [cancel, setCancel] = useState(null)
  const [move, setMove] = useState(null)
  const [checkIn, setCheckIn] = useState(null)
  const [newBooking, setNewBooking] = useState(false)
  const [busy, setBusy] = useState(false)

  const all = bookings.data || []
  const selected = all.find((b) => b.id === selectedId)
  const at = (iso, hour, bay) => all.find((b) => b.scheduledAt.startsWith(iso) && Number(b.scheduledAt.slice(11, 13)) === hour && b.bayNo === bay && b.status !== 'CANCELLED')
    || all.find((b) => b.scheduledAt.startsWith(iso) && Number(b.scheduledAt.slice(11, 13)) === hour && b.bayNo === bay)

  const act = async (fn, msg) => {
    setBusy(true)
    try {
      await fn()
      toast.success(msg)
      bookings.reload()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const live = all.filter((b) => b.status !== 'CANCELLED')
  return (
    <>
      <PageHeader eyebrow="Front desk" title="Bay booking calendar" subtitle="Four bays, one-hour slots from 8:00 am. Confirm bookings once the deposit is verified and check vehicles in."
        actions={<Button icon="add_circle" onClick={() => setNewBooking(true)}>New booking</Button>} />

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <Button variant="outline" size="sm" icon="chevron_left" onClick={() => setDay(addDays(day, view === 'day' ? -1 : -7))} aria-label="Previous" />
        <Button variant="outline" size="sm" onClick={() => setDay(isoDate())}>Today</Button>
        <Button variant="outline" size="sm" icon="chevron_right" onClick={() => setDay(addDays(day, view === 'day' ? 1 : 7))} aria-label="Next" />
        <input type="date" className="input h-8 w-auto" value={day} onChange={(e) => setDay(e.target.value)} />
        <p className="text-headline-sm text-navy">{view === 'day' ? date(day) : `${date(from)} – ${date(to)}`}</p>
        <div className="ml-auto flex rounded-control bg-slate-100 p-1">
          {['day', 'week'].map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={`rounded-control px-3 py-1 text-label-md capitalize ${view === v ? 'bg-white text-navy shadow-card' : 'text-slate-500'}`}>{v} view</button>
          ))}
        </div>
        <span className="text-body-sm text-slate-500">{live.length} booking(s) · {view === 'day' ? `${HOURS.length * BAYS.length - live.length} free slots` : ''}</span>
      </div>

      {bookings.loading ? <Loading /> : bookings.error ? <ErrorBanner error={bookings.error} /> : view === 'day' ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed">
            <thead className="table-head"><tr><th className="w-24">Time</th>{BAYS.map((b) => <th key={b}>Bay {b}</th>)}</tr></thead>
            <tbody>
              {HOURS.map((h) => (
                <tr key={h} className="border-t border-line">
                  <td className="px-4 py-2 align-top text-label-lg text-navy">{time(`${day}T${String(h).padStart(2, '0')}:00:00`)}</td>
                  {BAYS.map((bay) => {
                    const b = at(day, h, bay)
                    return (
                      <td key={bay} className="h-24 p-1.5 align-top">
                        {b ? (
                          <button type="button" onClick={() => setSelectedId(b.id)}
                            className={`flex h-full w-full flex-col rounded-control border-l-4 border p-2 text-left transition-shadow hover:shadow-raised ${BLOCK[b.status]} ${selectedId === b.id ? 'ring-2 ring-orange' : ''}`}>
                            <span className="flex items-center justify-between gap-1"><span className="truncate text-label-md text-navy">{b.customerName}</span><span className="text-label-sm text-slate-500">#{b.id}</span></span>
                            <span className="truncate text-body-sm text-slate-600">{b.registrationNo} · {b.packageName}</span>
                            <span className="mt-auto flex flex-wrap gap-1 pt-1">
                              <StatusBadge status={b.depositStatus} text={b.depositStatus === 'NOT_UPLOADED' ? 'No slip' : b.depositStatus} className="!h-5 !px-1.5" />
                              <StatusBadge status={b.status} className="!h-5 !px-1.5" />
                            </span>
                          </button>
                        ) : (
                          <div className="flex h-full items-center justify-center rounded-control border border-dashed border-slate-200 text-body-sm text-slate-300">Free</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(from, i)).map((d) => {
            const items = all.filter((b) => b.scheduledAt.startsWith(d)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
            return (
              <section key={d} className={`card min-h-[200px] ${d === isoDate() ? 'ring-2 ring-orange' : ''}`}>
                <button type="button" onClick={() => { setDay(d); setView('day') }} className="w-full border-b border-line px-3 py-2 text-left hover:bg-page">
                  <p className="text-label-lg text-navy">{date(d).slice(0, 6)}</p><p className="text-body-sm text-slate-500">{items.length} booking(s)</p>
                </button>
                <ul className="space-y-1.5 p-2">
                  {items.map((b) => (
                    <li key={b.id}>
                      <button type="button" onClick={() => setSelectedId(b.id)} className={`w-full rounded-control border-l-4 border p-1.5 text-left ${BLOCK[b.status]}`}>
                        <p className="text-label-sm text-navy">{time(b.scheduledAt)} · Bay {b.bayNo}</p>
                        <p className="truncate text-body-sm">{b.registrationNo}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelectedId(null)} title={selected ? `${selected.paymentReference} · Bay ${selected.bayNo}` : ''} subtitle={selected ? dateTime(selected.scheduledAt) : ''}>
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2"><StatusBadge status={selected.status} /><StatusBadge status={selected.depositStatus} text={`Deposit: ${selected.depositStatus.replace('_', ' ').toLowerCase()}`} /></div>
            <dl className="space-y-3 rounded-card bg-page p-4 text-body-md">
              <div><dt className="text-label-sm uppercase text-slate-500">Customer</dt><dd className="text-label-lg text-navy">{selected.customerName}</dd></div>
              <div><dt className="text-label-sm uppercase text-slate-500">Vehicle</dt><dd><Plate value={selected.registrationNo} size="sm" /> {selected.vehicleName.split('–')[1]}</dd></div>
              <div><dt className="text-label-sm uppercase text-slate-500">Package</dt><dd className="text-navy">{selected.packageName}</dd></div>
              <div><dt className="text-label-sm uppercase text-slate-500">Deposit</dt><dd className="num">{money(selected.depositAmount)} · verified {money(selected.depositPaid)}</dd></div>
              {selected.problemDescription && <div><dt className="text-label-sm uppercase text-slate-500">Problem</dt><dd>{selected.problemDescription}</dd></div>}
              {selected.confirmedAt && <div><dt className="text-label-sm uppercase text-slate-500">Confirmed</dt><dd>{dateTime(selected.confirmedAt)} by {selected.confirmedByName}</dd></div>}
            </dl>
            {selected.depositStatus === 'PENDING' && (
              <Notice tone="warning" icon="receipt_long">A deposit slip is waiting. <button type="button" className="font-semibold underline" onClick={() => navigate('/staff/payments')}>Verify it</button> to confirm the booking.</Notice>
            )}
            <div className="grid gap-2">
              {selected.status === 'PENDING' && (
                <span title={selected.depositStatus === 'VERIFIED' ? '' : 'Deposit not verified yet'}>
                  <Button className="w-full" variant="success" icon="event_available" disabled={selected.depositStatus !== 'VERIFIED'} loading={busy}
                    onClick={() => act(() => api.patch(`/api/appointments/${selected.id}/confirm`), 'Booking confirmed')}>Confirm booking</Button>
                </span>
              )}
              {selected.status === 'CONFIRMED' && (
                <Button icon="how_to_reg" disabled={!selected.scheduledAt.startsWith(isoDate())} title="Check-in is for today's bookings" onClick={() => setCheckIn(selected)}>Check in vehicle</Button>
              )}
              {selected.jobCardId && <Button variant="outline" icon="assignment" onClick={() => navigate(`/staff/jobs/${selected.jobCardId}`)}>Open job card #{selected.jobCardId}</Button>}
              {['PENDING', 'CONFIRMED'].includes(selected.status) && (
                <>
                  <Button variant="outline" icon="event_repeat" onClick={() => setMove(selected)}>Reschedule</Button>
                  <Button variant="danger-outline" icon="cancel" onClick={() => setCancel(selected)}>Cancel booking</Button>
                  {new Date(selected.scheduledAt) < new Date() && (
                    <Button variant="ghost" icon="person_off" onClick={() => act(() => api.patch(`/api/appointments/${selected.id}/no-show`), 'Marked as no-show')}>Mark no-show</Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <CancelBookingModal booking={cancel} onClose={() => setCancel(null)} onCancelled={bookings.reload} />
      <RescheduleModal booking={move} onClose={() => setMove(null)} onDone={bookings.reload} />
      <CheckInModal open={!!checkIn} appointmentId={checkIn?.id} onClose={() => setCheckIn(null)} onDone={() => { bookings.reload(); setSelectedId(null) }} />
      <NewBookingModal open={newBooking} onClose={() => setNewBooking(false)} onDone={bookings.reload} />
    </>
  )
}

/** Booking made at the desk or by phone for an existing customer's vehicle. */
function NewBookingModal({ open, onClose, onDone }) {
  const toast = useToast()
  const packages = useApi(open ? '/api/packages' : null)
  const [plate, setPlate] = useState('')
  const [found, setFound] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [pkg, setPkg] = useState('')
  const [slot, setSlot] = useState(null)
  const [problem, setProblem] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const search = async () => {
    try { setFound((await api.get('/api/vehicles/search', { params: { plate } })).data) } catch (e) { setError(errorMessage(e)) }
  }
  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.post('/api/appointments', { vehicleId: vehicle.id, serviceTypeId: Number(pkg), scheduledAt: slot, problemDescription: problem || null })
      toast.success(`${res.data.paymentReference} booked – ask the customer to pay the ${money(res.data.depositAmount)} deposit`)
      onDone?.()
      onClose()
      setVehicle(null); setFound(null); setPlate(''); setPkg(''); setSlot(null); setProblem('')
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New booking" icon="add_circle" size="xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button icon="event_available" loading={busy} disabled={!vehicle || !pkg || !slot} onClick={save}>Book</Button></>}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input className="input uppercase" placeholder="Vehicle number plate" value={plate} onChange={(e) => setPlate(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
          <Button variant="navy" icon="search" onClick={search} disabled={!plate.trim()}>Find</Button>
        </div>
        {found && (found.length ? (
          <div className="flex flex-wrap gap-2">
            {found.map((v) => (
              <button key={v.id} type="button" onClick={() => setVehicle(v)}
                className={`flex items-center gap-2 rounded-control border-2 px-3 py-2 ${vehicle?.id === v.id ? 'border-orange' : 'border-line'}`}>
                <Plate value={v.registrationNo} size="sm" /> <span className="text-body-md">{v.ownerName}</span>
              </button>
            ))}
          </div>
        ) : <Notice tone="info">No vehicle with that plate. Register the customer on the Customers page first.</Notice>)}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Package">
            <select className="input" value={pkg} onChange={(e) => setPkg(e.target.value)}>
              <option value="">Choose…</option>{(packages.data || []).map((p) => <option key={p.id} value={p.id}>{p.name} – deposit {money(p.depositAmount)}</option>)}
            </select>
          </Field>
          <Field label="Problem (optional)"><input className="input" maxLength={255} value={problem} onChange={(e) => setProblem(e.target.value)} /></Field>
        </div>
        <SlotPicker value={slot} onChange={setSlot} />
        <ErrorBanner error={error} />
        <p className="flex items-center gap-1 text-body-sm text-slate-500"><Icon name="info" className="text-[16px]" /> The booking stays Pending until the deposit slip is verified.</p>
      </div>
    </Modal>
  )
}
