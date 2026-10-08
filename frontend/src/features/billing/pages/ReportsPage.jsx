import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../../../components/Card'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import { EmptyState, Loading } from '../../../components/States'
import Tabs from '../../../components/Tabs'
import { date, label, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import PackagesManager from '../components/PackagesManager'

const NAVY = '#1F3A63'
const ORANGE = '#E67E22'
const short = (v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : v)

/** Admin: reports dashboard and service package management (Stitch W6). */
export default function ReportsPage() {
  const [tab, setTab] = useState('reports')
  return (
    <>
      <PageHeader eyebrow="Admin" title="Reports & service packages" subtitle="Money in, money owed, how each package performs and how busy the workshop is." />
      <Tabs className="mb-6" value={tab} onChange={setTab} tabs={[{ key: 'reports', label: 'Reports' }, { key: 'packages', label: 'Service packages' }]} />
      {tab === 'reports' ? <Reports /> : <PackagesManager />}
    </>
  )
}

function Reports() {
  const summary = useApi('/api/reports/summary')
  const packages = useApi('/api/reports/packages')
  const weekly = useApi('/api/reports/payments-weekly', { params: { weeks: 8 } })
  const outstanding = useApi('/api/reports/outstanding')
  const workload = useApi('/api/reports/mechanic-workload')
  const stages = useApi('/api/reports/stage-times')
  const s = summary.data
  const pk = packages.data || []
  const bookings = pk.reduce((a, p) => a + p.bookings, 0)
  const cancelled = pk.reduce((a, p) => a + p.cancelled, 0)

  return (
    <div className="space-y-6">
      {summary.loading ? <Loading /> : s && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Payments verified" value={money(s.totalVerifiedPayments)} icon="payments" tone="green" />
          <StatCard label="Outstanding" value={money(s.outstandingBalance)} icon="pending_actions" tone="orange" hint={`${s.outstandingBills} bills open`} />
          <StatCard label="Slips waiting / refunds pending" value={`${s.slipsWaiting} / ${s.refundsPending}`} icon="hourglass_top" tone="amber" />
          <StatCard label="Average rating" value={s.averageRating ? `${Number(s.averageRating).toFixed(2)} / 5` : '–'} icon="star" tone="navy" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Amount billed per package" icon="bar_chart" className="xl:col-span-2">
          {packages.loading ? <Loading /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pk} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="packageName" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tickFormatter={short} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="totalBilled" name="Billed" fill={NAVY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card title="Bookings vs cancellations" icon="pie_chart">
          {packages.loading ? <Loading /> : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[{ name: 'Kept', value: bookings }, { name: 'Cancelled', value: cancelled }]} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    <Cell fill={NAVY} /><Cell fill={ORANGE} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 text-body-md">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-navy" /> Kept {bookings}</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange" /> Cancelled {cancelled}</span>
              </div>
            </>
          )}
        </Card>
      </div>

      <Card title="Payments verified per week" icon="show_chart">
        {weekly.loading ? <Loading /> : !weekly.data?.length ? <EmptyState icon="show_chart" title="No verified payments in the last 8 weeks" /> : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weekly.data.map((w) => ({ ...w, week: date(w.weekStart).slice(0, 6) }))} margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={short} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => (n === 'amount' ? money(v) : v)} />
              <Line type="monotone" dataKey="amount" stroke={ORANGE} strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Outstanding bills" icon="receipt_long" bodyClassName="p-0">
          {!outstanding.data?.length ? <EmptyState icon="task_alt" title="Nothing outstanding" /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-head"><tr><th>Invoice</th><th>Customer</th><th className="!text-right">Balance</th><th className="!text-right">Days</th></tr></thead>
                <tbody className="table-body">
                  {outstanding.data.map((o) => (
                    <tr key={o.invoiceId}>
                      <td><Link to={`/staff/invoices/${o.invoiceId}`} className="font-semibold text-navy hover:text-orange num">{o.invoiceNo}</Link></td>
                      <td><p>{o.customer}</p><p className="text-body-sm text-slate-500">{o.registrationNo}</p></td>
                      <td className="text-right font-semibold text-orange-dark num">{money(o.balanceDue)}</td>
                      <td className={`text-right num ${o.daysOutstanding > 4 ? 'text-danger' : ''}`}>{o.daysOutstanding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Average rating per package" icon="star" bodyClassName="p-0">
          <table className="w-full">
            <thead className="table-head"><tr><th>Package</th><th className="!text-right">Bookings</th><th className="!text-right">Cancelled</th><th className="!text-right">Rating</th></tr></thead>
            <tbody className="table-body">
              {pk.map((p) => (
                <tr key={p.packageId}>
                  <td className="text-navy">{p.packageName}</td>
                  <td className="text-right num">{p.bookings}</td>
                  <td className="text-right num">{p.cancelled}</td>
                  <td className="text-right font-semibold num">{p.avgRating ? `${Number(p.avgRating).toFixed(2)} ★` : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Mechanic workload" icon="engineering" bodyClassName="p-0">
          <table className="w-full">
            <thead className="table-head"><tr><th>Mechanic</th><th>Specialisation</th><th className="!text-right">Open</th><th className="!text-right">Completed</th></tr></thead>
            <tbody className="table-body">
              {(workload.data || []).map((m) => (
                <tr key={m.mechanicId}><td className="text-navy">{m.mechanic}</td><td>{m.specialization || '–'}</td>
                  <td className="text-right num">{m.openJobs}</td><td className="text-right num">{m.completedJobs}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Average time in each stage" icon="timer" bodyClassName="p-0">
          <table className="w-full">
            <thead className="table-head"><tr><th>Stage</th><th className="!text-right">Times passed</th><th className="!text-right">Avg hours</th></tr></thead>
            <tbody className="table-body">
              {(stages.data || []).map((st) => (
                <tr key={st.stage}><td className="text-navy">{label(st.stage)}</td><td className="text-right num">{st.timesPassed}</td><td className="text-right num">{st.avgHours ?? '–'}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
