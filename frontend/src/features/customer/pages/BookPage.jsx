import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import { EmptyState, ErrorBanner, Loading, Notice } from '../../../components/States'
import { dateTime, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import PackageCard from '../../billing/components/PackageCard'
import PaymentPanel from '../../billing/components/PaymentPanel'
import SlotPicker from '../components/SlotPicker.jsx'

const STEPS = ['Choose package', 'Vehicle & problem', 'Date & time', 'Pay deposit']

/** Four-step booking wizard (Stitch A4). */
export default function BookPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const packages = useApi('/api/packages')
  const vehicles = useApi('/api/vehicles')
  const [step, setStep] = useState(0)
  const [pkg, setPkg] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [problem, setProblem] = useState('')
  const [slot, setSlot] = useState(null)
  const [booking, setBooking] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const id = Number(params.get('vehicleId'))
    if (id && vehicles.data && !vehicle) setVehicle(vehicles.data.find((v) => v.id === id) || null)
  }, [params, vehicles.data, vehicle])

  const canNext = [!!pkg, !!vehicle, !!slot][step]

  const book = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.post('/api/appointments', { serviceTypeId: pkg.id, vehicleId: vehicle.id, scheduledAt: slot, problemDescription: problem || null })
      setBooking(res.data)
      setStep(3)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Book a service" title="Book a service appointment" subtitle="Choose a package, your vehicle and a time, then pay the deposit to secure your bay." />

      <ol className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-3 rounded-card border-2 p-3 ${i === step ? 'border-orange bg-white shadow-glow' : i < step ? 'border-success-border bg-success-bg' : 'border-line bg-white'}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-label-lg ${i < step ? 'bg-success text-white' : i === step ? 'bg-orange text-white' : 'bg-slate-100 text-slate-500'}`}>
              {i < step ? <Icon name="check" className="text-[18px]" /> : i + 1}
            </span>
            <span className="min-w-0"><span className="block text-label-sm uppercase tracking-wider text-slate-500">Step {i + 1}</span><span className="block truncate text-label-lg text-navy">{s}</span></span>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {step === 0 && (
            <section className="card p-5">
              <h2 className="mb-4 text-headline-md text-navy">Select a package</h2>
              {packages.loading ? <Loading /> : (
                <div className="grid gap-4 md:grid-cols-3">
                  {packages.data.map((p) => <PackageCard key={p.id} pkg={p} selected={pkg?.id === p.id} onSelect={setPkg} />)}
                </div>
              )}
            </section>
          )}
          {step === 1 && (
            <section className="card p-5">
              <h2 className="mb-4 text-headline-md text-navy">Vehicle & problem</h2>
              {vehicles.loading ? <Loading /> : !vehicles.data.length ? (
                <EmptyState icon="directions_car" title="Add your vehicle first" action={<Button icon="add" onClick={() => navigate('/app/vehicles')}>Add vehicle</Button>} />
              ) : (
                <div className="mb-5 grid gap-3 md:grid-cols-2">
                  {vehicles.data.map((v) => (
                    <button key={v.id} type="button" onClick={() => setVehicle(v)}
                      className={`flex items-center gap-3 rounded-card border-2 p-4 text-left ${vehicle?.id === v.id ? 'border-orange shadow-glow' : 'border-line hover:border-navy'}`}>
                      <Icon name="directions_car" className="text-navy" />
                      <div className="min-w-0 flex-1"><Plate value={v.registrationNo} size="sm" /><p className="mt-1 text-label-lg text-navy">{v.make} {v.model} · {v.manufactureYear}</p>
                        <p className="text-body-sm text-slate-500 num">{v.currentMileage.toLocaleString()} km</p></div>
                      {vehicle?.id === v.id && <Icon name="check_circle" fill className="text-orange" />}
                    </button>
                  ))}
                  <Link to="/app/vehicles" className="flex items-center justify-center gap-2 rounded-card border-2 border-dashed border-slate-300 p-4 text-label-lg text-navy hover:border-navy"><Icon name="add" /> Add another vehicle</Link>
                </div>
              )}
              <Field label="Describe the problem (optional)" hint={`${problem.length}/255`}>
                <textarea className="input" rows={4} maxLength={255} value={problem} onChange={(e) => setProblem(e.target.value)}
                  placeholder="e.g. Brakes squeal when stopping; warning light on the dashboard" />
              </Field>
            </section>
          )}
          {step === 2 && (
            <section className="card p-5">
              <h2 className="mb-4 text-headline-md text-navy">Date & time</h2>
              <SlotPicker value={slot} onChange={setSlot} />
            </section>
          )}
          {step === 3 && booking && (
            <div className="space-y-4">
              <Notice tone="success" icon="event_available">Booking {booking.paymentReference} saved for {dateTime(booking.scheduledAt)} (bay {booking.bayNo}). Pay the deposit to confirm it.</Notice>
              <PaymentPanel type="DEPOSIT" targetId={booking.id} amount={booking.depositAmount} reference={booking.paymentReference} />
              <div className="flex justify-end"><Button variant="navy" iconRight="arrow_forward" onClick={() => navigate('/app/bookings')}>Go to my bookings</Button></div>
            </div>
          )}
          <ErrorBanner error={error} className="mt-4" />
          {step < 3 && (
            <div className="mt-4 flex justify-between">
              <Button variant="outline" icon="arrow_back" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
              {step < 2 ? (
                <Button iconRight="arrow_forward" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</Button>
              ) : (
                <Button icon="event_available" disabled={!canNext} loading={busy} onClick={book}>Book and pay deposit</Button>
              )}
            </div>
          )}
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <section className="card overflow-hidden">
            <header className="bg-navy px-5 py-4 text-white"><p className="text-headline-sm">Booking summary</p></header>
            <dl className="space-y-3 p-5 text-body-md">
              <div><dt className="text-label-sm uppercase tracking-wider text-slate-500">Package</dt><dd className="text-label-lg text-navy">{pkg?.name || '—'}</dd></div>
              <div><dt className="text-label-sm uppercase tracking-wider text-slate-500">Vehicle</dt><dd className="text-label-lg text-navy">{vehicle ? `${vehicle.registrationNo} – ${vehicle.make} ${vehicle.model}` : '—'}</dd></div>
              <div><dt className="text-label-sm uppercase tracking-wider text-slate-500">Date & time</dt><dd className="text-label-lg text-navy">{slot ? dateTime(slot) : '—'}</dd></div>
              <div className="flex items-center justify-between rounded-control bg-beige px-3 py-2">
                <dt className="text-label-md text-beige-text">Deposit due</dt><dd className="text-headline-sm text-navy num">{pkg ? money(pkg.depositAmount) : '—'}</dd>
              </div>
            </dl>
            <p className="border-t border-line bg-page px-5 py-3 text-body-sm text-slate-500">Your booking is confirmed once the receptionist verifies your payment slip.</p>
          </section>
        </aside>
      </div>
    </>
  )
}
