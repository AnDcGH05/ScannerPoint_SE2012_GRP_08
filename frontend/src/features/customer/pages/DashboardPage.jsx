import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Icon from '../../../components/Icon'
import Plate from '../../../components/Plate'
import StatCard from '../../../components/StatCard'
import { EmptyState, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { ago, dateTime, greeting, label, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import WorkflowTracker from '../../repair/components/WorkflowTracker'

const ACTIVE = ['PENDING', 'CONFIRMED', 'CHECKED_IN']
const NOTIF_ICONS = { BOOKING_CONFIRMATION: 'event_available', SERVICE_REMINDER: 'notifications_active', APPROVAL_REQUEST: 'help', VEHICLE_READY: 'task_alt', PAYMENT_RECEIPT: 'receipt_long' }

/** Customer dashboard (Stitch A2): summary, a workflow tracker per active booking, reminders and notifications. */
export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const bookings = useApi('/api/appointments/mine')
  const jobs = useApi('/api/jobcards/mine', { pollMs: 10000 })
  const vehicles = useApi('/api/vehicles')
  const bills = useApi('/api/invoices/mine')
  const due = useApi('/api/vehicles/service-due')
  const notes = useApi('/api/notifications/mine')

  const jobById = Object.fromEntries((jobs.data || []).map((j) => [j.id, j]))
  const active = (bookings.data || []).filter((b) => ACTIVE.includes(b.status) && (!b.jobCardId || jobById[b.jobCardId]?.status !== 'COLLECTED'))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const balance = (bills.data || []).reduce((s, b) => s + Math.max(0, Number(b.balanceDue)), 0)

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-headline-xl text-navy">{greeting()}, {user.fullName.split(' ')[0]}</h1>
          <p className="text-body-md text-slate-500">Here is where your vehicles and bookings stand today.</p>
        </div>
        <Button icon="calendar_add_on" onClick={() => navigate('/app/book')}>Book a service</Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active bookings" value={active.length} icon="event" tone="orange" onClick={() => navigate('/app/bookings')} />
        <StatCard label="Vehicles" value={vehicles.data?.length ?? '–'} icon="directions_car" onClick={() => navigate('/app/vehicles')}
          hint={(vehicles.data || []).map((v) => v.registrationNo).join(' · ')} />
        <StatCard label="Balance due" value={money(balance)} icon="account_balance_wallet" tone={balance > 0 ? 'red' : 'green'} onClick={() => navigate('/app/bills')} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {bookings.loading ? <div className="card"><Loading /></div> : !active.length ? (
            <div className="card"><EmptyState icon="event_available" title="No active bookings" text="Book a service and follow every stage of the repair here."
              action={<Button icon="calendar_add_on" onClick={() => navigate('/app/book')}>Book a service</Button>} /></div>
          ) : active.map((b) => {
            const job = jobById[b.jobCardId]
            return (
              <article key={b.id} className="card p-5">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><Plate value={b.registrationNo} /><span className="text-headline-sm text-navy">{b.vehicleName.split('–')[1]}</span></div>
                    <p className="mt-1 text-body-md text-slate-600">{b.packageName} · Booked {dateTime(b.scheduledAt)} · Bay {b.bayNo}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={b.status} />
                    {job && <Button size="sm" variant="outline" iconRight="arrow_forward" onClick={() => navigate(`/app/jobs/${job.id}`)}>Job details</Button>}
                  </div>
                </div>
                <WorkflowTracker appointmentId={b.id} />
                {b.status === 'PENDING' && b.depositStatus !== 'PENDING' && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-warning-border bg-warning-bg p-4">
                    <p className="text-body-md text-warning">
                      {b.depositStatus === 'REJECTED' ? 'Your deposit slip was rejected – please upload a new one.' : `Pay the ${money(b.depositAmount)} deposit to confirm this booking.`}
                    </p>
                    <Button size="sm" icon="payments" onClick={() => navigate(`/app/bookings/${b.id}/pay`)}>Pay deposit</Button>
                  </div>
                )}
                {job?.pendingApprovals > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-warning-amber bg-warning-bg p-4">
                    <p className="flex items-center gap-2 text-label-lg text-warning"><Icon name="notification_important" /> Your mechanic found extra work – review and approve</p>
                    <Button size="sm" icon="fact_check" onClick={() => navigate(`/app/jobs/${job.id}`)}>Review and approve</Button>
                  </div>
                )}
                {job?.status === 'READY' && Number(job.balanceDue) > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-success-border bg-success-bg p-4">
                    <p className="text-body-md text-success">Your vehicle is ready. Balance due {money(job.balanceDue)}.</p>
                    <Button size="sm" variant="success" icon="receipt_long" onClick={() => navigate('/app/bills')}>View bill</Button>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        <div className="space-y-6">
          <Card title="Service reminders" icon="notifications_active" bodyClassName="p-0">
            {!due.data?.length ? <EmptyState icon="verified" title="All vehicles are up to date" /> : (
              <ul className="divide-y divide-line">
                {due.data.map((d) => (
                  <li key={d.vehicleId} className="px-5 py-4">
                    <p className="text-label-lg text-navy">{d.vehicleName}</p>
                    <p className="mt-1 text-body-sm text-slate-600">{d.message.replace(`${d.vehicleName} is due`, 'Due')}</p>
                    <Button className="mt-2" size="sm" variant="outline" icon="event" onClick={() => navigate(`/app/book?vehicleId=${d.vehicleId}`)}>Book slot</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Recent notifications" icon="notifications" bodyClassName="p-0">
            {!notes.data?.length ? <EmptyState icon="notifications_off" title="No notifications yet" /> : (
              <ul className="divide-y divide-line">
                {notes.data.filter((n) => n.channel === 'SMS').slice(0, 6).map((n) => (
                  <li key={n.id} className="flex gap-3 px-5 py-3">
                    <Icon name={NOTIF_ICONS[n.type] || 'notifications'} className="mt-0.5 text-orange" />
                    <div className="min-w-0">
                      <p className="text-body-md">{n.message}</p>
                      <p className="text-body-sm text-slate-400">{label(n.type)} · {ago(n.sentAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="ScannerPoint Kurunegala" icon="location_on">
            <p className="text-body-md text-slate-600">Open 8:00 am – 4:00 pm · 4 service bays</p>
            <Link to="/app/bookings" className="mt-2 inline-block text-label-lg text-orange hover:underline">Manage my bookings →</Link>
          </Card>
        </div>
      </div>
    </>
  )
}
