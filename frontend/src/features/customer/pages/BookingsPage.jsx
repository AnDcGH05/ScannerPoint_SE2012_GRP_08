import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import { EmptyState, ErrorBanner, Loading, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { date, money, time } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import CancelBookingModal from '../components/CancelBookingModal.jsx'
import RescheduleModal from '../components/RescheduleModal.jsx'

/** My bookings with reschedule and cancel (Stitch A5). */
export default function BookingsPage() {
  const navigate = useNavigate()
  const bookings = useApi('/api/appointments/mine')
  const jobs = useApi('/api/jobcards/mine')
  const [tab, setTab] = useState('UPCOMING')
  const [cancelling, setCancelling] = useState(null)
  const [moving, setMoving] = useState(null)

  const jobStatus = Object.fromEntries((jobs.data || []).map((j) => [j.id, j.status]))
  const group = (b) => {
    if (b.status === 'CANCELLED') return 'CANCELLED'
    if (b.status === 'CHECKED_IN') return jobStatus[b.jobCardId] === 'COLLECTED' ? 'PAST' : 'WORKSHOP'
    if (b.status === 'NO_SHOW') return 'PAST'
    return 'UPCOMING'
  }
  const all = bookings.data || []
  const count = (g) => all.filter((b) => group(b) === g).length
  const list = all.filter((b) => group(b) === tab).sort((a, b) => (tab === 'UPCOMING' ? a.scheduledAt.localeCompare(b.scheduledAt) : b.scheduledAt.localeCompare(a.scheduledAt)))

  return (
    <>
      <PageHeader eyebrow="Appointments" title="My bookings" subtitle="Your service appointments. Reschedule or cancel upcoming bookings, or follow vehicles in the workshop."
        actions={<Button icon="calendar_add_on" onClick={() => navigate('/app/book')}>Book a service</Button>} />
      <Notice tone="info" icon="gavel" className="mb-6">
        Cancelling 24 hours or more before your booked time refunds the full deposit. With less than 24 hours' notice, 50% of the deposit is kept.
      </Notice>
      <section className="card">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[
          { key: 'UPCOMING', label: 'Upcoming', count: count('UPCOMING') },
          { key: 'WORKSHOP', label: 'In workshop', count: count('WORKSHOP') },
          { key: 'PAST', label: 'Past', count: count('PAST') },
          { key: 'CANCELLED', label: 'Cancelled', count: count('CANCELLED') },
        ]} />
        {bookings.loading ? <Loading /> : bookings.error ? <ErrorBanner error={bookings.error} className="m-4" /> : !list.length ? (
          <EmptyState icon="event" title="No bookings here" />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((b) => (
              <li key={b.id} className="grid gap-4 px-5 py-4 lg:grid-cols-12 lg:items-center">
                <div className="flex items-center gap-3 lg:col-span-2">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-card bg-beige text-beige-text">
                    <span className="text-headline-sm leading-none num">{date(b.scheduledAt).slice(0, 2)}</span>
                    <span className="text-label-sm uppercase">{date(b.scheduledAt).slice(3, 6)}</span>
                  </div>
                  <div><p className="text-label-lg text-navy">{time(b.scheduledAt)}</p><p className="text-body-sm text-slate-500">Bay {b.bayNo}</p></div>
                </div>
                <div className="lg:col-span-4">
                  <Plate value={b.registrationNo} size="sm" /> <span className="text-label-lg text-navy">{b.vehicleName.split('–')[1]}</span>
                  <p className="mt-1 text-body-md text-slate-600">{b.packageName} · {b.paymentReference}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:col-span-3">
                  <span className="flex items-center gap-1 text-body-sm text-slate-500">Deposit {money(b.depositAmount)}</span>
                  <StatusBadge status={b.depositStatus} text={`Deposit: ${b.depositStatus === 'NOT_UPLOADED' ? 'not paid' : b.depositStatus.toLowerCase()}`} />
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex flex-wrap justify-end gap-2 lg:col-span-3">
                  {b.status === 'PENDING' && b.depositStatus !== 'PENDING' && <Button size="sm" icon="payments" onClick={() => navigate(`/app/bookings/${b.id}/pay`)}>Pay deposit</Button>}
                  {b.jobCardId && <Button size="sm" variant="outline" icon="timeline" onClick={() => navigate(`/app/jobs/${b.jobCardId}`)}>View progress</Button>}
                  {tab === 'UPCOMING' && <Button size="sm" variant="outline" icon="event_repeat" onClick={() => setMoving(b)}>Reschedule</Button>}
                  {tab === 'UPCOMING' && <Button size="sm" variant="danger-outline" icon="cancel" onClick={() => setCancelling(b)}>Cancel</Button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-4 flex items-center gap-1 text-body-sm text-slate-500"><Icon name="info" className="text-[16px]" /> Refunds are paid by bank transfer within a few working days.</p>
      <CancelBookingModal booking={cancelling} onClose={() => setCancelling(null)} onCancelled={bookings.reload} />
      <RescheduleModal booking={moving} onClose={() => setMoving(null)} onDone={bookings.reload} />
    </>
  )
}
