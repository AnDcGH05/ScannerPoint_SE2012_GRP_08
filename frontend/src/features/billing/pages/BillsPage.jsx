import { Link } from 'react-router-dom'
import Card from '../../../components/Card'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { date, dateTime, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'

/** Customer: "Bills & Payments". */
export default function BillsPage() {
  const bills = useApi('/api/invoices/mine')
  const payments = useApi('/api/payments/mine')
  const due = (bills.data || []).reduce((s, b) => s + Math.max(0, Number(b.balanceDue)), 0)
  const verified = (payments.data || []).filter((p) => p.status === 'VERIFIED').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <>
      <PageHeader eyebrow="Billing" title="Bills & Payments" subtitle="Your itemised bills and every payment slip you have uploaded." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Balance due" value={money(due)} icon="account_balance_wallet" tone={due > 0 ? 'orange' : 'green'} />
        <StatCard label="Bills" value={bills.data?.length ?? '–'} icon="receipt_long" />
        <StatCard label="Verified payments" value={money(verified)} icon="verified" tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="My bills" icon="receipt_long" className="lg:col-span-3" bodyClassName="p-0">
          {bills.loading ? <Loading /> : bills.error ? <ErrorBanner error={bills.error} className="m-4" /> : !bills.data.length ? (
            <EmptyState icon="receipt" title="No bills yet" text="Your bill appears here when your vehicle is ready." />
          ) : (
            <ul className="divide-y divide-line">
              {bills.data.map((b) => (
                <li key={b.id}>
                  <Link to={`/app/bills/${b.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-page">
                    <span className="flex h-10 w-10 items-center justify-center rounded-control bg-beige text-beige-text"><Icon name="receipt_long" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-label-lg text-navy">{b.invoiceNo} · {b.vehicleName}</p>
                      <p className="text-body-sm text-slate-500">{b.packageName} · {date(b.invoiceDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-label-lg text-navy num">{money(b.total)}</p>
                      {Number(b.balanceDue) > 0 ? <p className="text-body-sm text-orange-dark num">Due {money(b.balanceDue)}</p> : <StatusBadge status="PAID" />}
                    </div>
                    <Icon name="chevron_right" className="text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Payment slips" icon="payments" className="lg:col-span-2" bodyClassName="p-0">
          {payments.loading ? <Loading /> : !payments.data?.length ? (
            <EmptyState icon="payments" title="No payments yet" />
          ) : (
            <ul className="divide-y divide-line">
              {payments.data.map((p) => (
                <li key={p.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-label-lg text-navy">{p.payingFor}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-body-sm text-slate-500 num">{money(p.amount)} · {p.type === 'DEPOSIT' ? 'Deposit' : 'Final payment'} · {dateTime(p.uploadedAt)}</p>
                  {p.rejectReason && <p className="mt-1 text-body-sm text-danger">{p.rejectReason}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
