import { Link, useParams } from 'react-router-dom'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import { ErrorBanner, Loading, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { dateTime, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import PaymentPanel from '../components/PaymentPanel'

/** Pay deposit / upload payment slip for a booking (Stitch W1). */
export default function PayDepositPage() {
  const { id } = useParams()
  const booking = useApi(`/api/appointments/${id}`)
  if (booking.loading) return <Loading />
  if (booking.error) return <ErrorBanner error={booking.error} />
  const b = booking.data

  return (
    <>
      <nav className="mb-3 flex items-center gap-1 text-body-sm text-slate-500">
        <Link to="/app/bookings" className="hover:text-navy">My Bookings</Link><Icon name="chevron_right" className="text-[16px]" />
        <span>{b.paymentReference}</span><Icon name="chevron_right" className="text-[16px]" /><span className="text-navy">Pay deposit</span>
      </nav>
      <PageHeader title="Pay deposit & confirm booking"
        subtitle="Transfer the deposit, then upload the slip. Your booking is confirmed once the receptionist verifies it." />

      <div className="card mb-6 flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <div><p className="text-label-sm uppercase tracking-wider text-slate-500">Vehicle</p><Plate value={b.registrationNo} /> <span className="ml-1 text-body-md text-slate-600">{b.vehicleName.split('–')[1]}</span></div>
        <div><p className="text-label-sm uppercase tracking-wider text-slate-500">Package</p><p className="text-label-lg text-navy">{b.packageName}</p></div>
        <div><p className="text-label-sm uppercase tracking-wider text-slate-500">Booked for</p><p className="text-label-lg text-navy">{dateTime(b.scheduledAt)} · Bay {b.bayNo}</p></div>
        <div><p className="text-label-sm uppercase tracking-wider text-slate-500">Deposit</p><p className="text-label-lg text-navy num">{money(b.depositAmount)}</p></div>
        <div className="ml-auto"><StatusBadge status={b.status} /></div>
      </div>

      {b.status === 'PENDING' ? (
        <PaymentPanel type="DEPOSIT" targetId={b.id} amount={b.depositAmount} reference={b.paymentReference} onChanged={booking.reload} />
      ) : (
        <Notice tone={b.status === 'CANCELLED' ? 'danger' : 'success'}>
          {b.status === 'CANCELLED' ? 'This booking was cancelled.' : 'The deposit for this booking has been verified – nothing more to pay now.'}
        </Notice>
      )}
    </>
  )
}
