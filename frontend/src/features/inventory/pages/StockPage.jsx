import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { date, dateTime, label, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import StockMovementModal from '../components/StockMovementModal.jsx'

/** Stock movements and the stock card for one part (Stitch T4). */
export default function StockPage() {
  const { partId } = useParams()
  const navigate = useNavigate()
  const parts = useApi('/api/parts')
  const card = useApi(partId ? `/api/parts/${partId}/stock-card` : null)
  const [recording, setRecording] = useState(false)

  return (
    <>
      <PageHeader eyebrow="Stores" title="Stock movements & stock card"
        subtitle="Every delivery, issue, return and adjustment, with the running balance."
        actions={<Button icon="add_circle" onClick={() => setRecording(true)}>Record stock movement</Button>} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-label-lg text-navy" htmlFor="part">Stock card for</label>
        <select id="part" className="input max-w-md" value={partId || ''} onChange={(e) => navigate(e.target.value ? `/staff/stock/${e.target.value}` : '/staff/stock')}>
          <option value="">Choose a part…</option>
          {(parts.data || []).map((p) => <option key={p.id} value={p.id}>{p.partCode} – {p.partName}</option>)}
        </select>
      </div>

      {!partId ? (
        <div className="card"><EmptyState icon="monitoring" title="Choose a part to see its stock card" text="Or record a delivery, return or adjustment with the button above." /></div>
      ) : card.loading ? <Loading /> : card.error ? <ErrorBanner error={card.error} /> : (
        <StockCard data={card.data} />
      )}

      <StockMovementModal open={recording} onClose={() => setRecording(false)} partId={partId} onSaved={() => { card.reload(); parts.reload() }} />
    </>
  )
}

function StockCard({ data }) {
  const { part, entries } = data
  const chart = entries.map((e) => ({ day: date(e.txnAt).slice(0, 6), balance: Number(e.balance) }))
  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center gap-6 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-label-sm uppercase tracking-wider text-slate-500 num">{part.partCode} · {label(part.category)}</p>
          <h2 className="text-headline-lg text-navy">{part.partName}</h2>
          {part.preferredSupplier && <p className="text-body-md text-slate-500">Preferred supplier: {part.preferredSupplier}</p>}
        </div>
        {part.lowStock ? <StatusBadge status="REJECTED" text="Below re-order level" /> : <StatusBadge status="ACTIVE" text="Healthy" />}
        <Link to="/staff/parts" className="text-label-lg text-orange hover:underline">Edit part</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="In stock" value={part.quantityInStock} icon="inventory_2" tone={part.lowStock ? 'red' : 'green'} hint={`Re-order level ${part.reorderLevel}`} />
        <StatCard label="Selling price" value={money(part.unitPrice)} icon="sell" />
        <StatCard label="Stock value" value={money(part.unitPrice * part.quantityInStock)} icon="account_balance_wallet" />
      </div>
      <Card title="Balance over time" icon="show_chart">
        {chart.length < 2 ? <EmptyState icon="show_chart" title="Not enough movements for a chart" /> : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chart} margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <ReferenceLine y={part.reorderLevel} stroke="#C0392B" strokeDasharray="4 4" label={{ value: 'Re-order', fontSize: 11, fill: '#C0392B', position: 'insideTopRight' }} />
              <Line type="stepAfter" dataKey="balance" stroke="#1F3A63" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
      <Card title="Stock ledger" icon="receipt_long" bodyClassName="p-0">
        {!entries.length ? <EmptyState icon="inventory" title="No movements yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="table-head"><tr><th>Date</th><th>Type</th><th className="!text-right">Quantity</th><th className="!text-right">Balance</th><th>Details</th><th>By</th></tr></thead>
              <tbody className="table-body">
                {[...entries].reverse().map((e) => (
                  <tr key={e.transactionId}>
                    <td className="whitespace-nowrap">{dateTime(e.txnAt)}</td>
                    <td><StatusBadge status={e.txnType} /></td>
                    <td className={`text-right font-semibold num ${e.quantity > 0 ? 'text-success' : 'text-danger'}`}>{e.quantity > 0 ? '+' : ''}{e.quantity}</td>
                    <td className="text-right font-semibold text-navy num">{Number(e.balance)}</td>
                    <td>{e.details}</td>
                    <td className="text-slate-500"><Icon name="person" className="text-[14px]" /> {e.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
