import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import { EmptyState, Loading, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { ago, label, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import StockBar from '../components/StockBar.jsx'
import StockMovementModal from '../components/StockMovementModal.jsx'

/** Storekeeper dashboard (Stitch T1). */
export default function StoreDashboardPage() {
  const navigate = useNavigate()
  const summary = useApi('/api/stock/summary', { pollMs: 20000 })
  const low = useApi('/api/parts/low-stock')
  const moves = useApi('/api/stock/movements', { pollMs: 20000 })
  const alerts = useApi('/api/stock/alerts', { pollMs: 20000 })
  const [delivery, setDelivery] = useState(null)
  const s = summary.data
  const refresh = () => { summary.reload(); low.reload(); moves.reload() }

  return (
    <>
      <PageHeader eyebrow="Stores" title="Parts store" subtitle="Part requests, low-stock alerts, deliveries and every stock movement."
        actions={<>
          <Button variant="outline" icon="assignment_returned" onClick={() => navigate('/staff/part-requests')}>Part requests</Button>
          <Button icon="local_shipping" onClick={() => setDelivery({})}>Record delivery</Button>
        </>} />

      {alerts.data?.length > 0 && (
        <Notice tone="warning" icon="notifications_active" className="mb-6">
          <p className="font-semibold">Low-stock alerts since the server started</p>
          <p>{alerts.data.slice(0, 4).map((a) => `${a.partName} (${a.inStock} left)`).join(' · ')}</p>
        </Notice>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending part requests" value={s?.pendingPartRequests ?? '–'} icon="assignment_returned" tone="amber" onClick={() => navigate('/staff/part-requests')} />
        <StatCard label="Low-stock parts" value={s?.lowStockParts ?? '–'} icon="warning" tone="red" />
        <StatCard label="Deliveries this week" value={s?.deliveriesThisWeek ?? '–'} icon="local_shipping" tone="green" />
        <StatCard label="Stock value" value={s ? money(s.stockValue) : '–'} icon="account_balance_wallet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Low-stock alerts" icon="warning" className="xl:col-span-2" bodyClassName="p-0">
          {low.loading ? <Loading /> : !low.data?.length ? <EmptyState icon="inventory" title="All parts are above their re-order level" /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="table-head"><tr><th>Part</th><th>Stock</th><th>Preferred supplier</th><th>Lead time</th><th /></tr></thead>
                <tbody className="table-body">
                  {low.data.map((p) => (
                    <tr key={p.partId}>
                      <td><Link to={`/staff/stock/${p.partId}`} className="font-semibold text-navy hover:text-orange">{p.partName}</Link><p className="text-body-sm text-slate-500 num">{p.partCode}</p></td>
                      <td><StockBar inStock={p.inStock} reorderLevel={p.reorderLevel} /></td>
                      <td>{p.preferredSupplier ? <><p>{p.preferredSupplier}</p><p className="flex items-center gap-1 text-body-sm text-slate-500"><Icon name="call" className="text-[14px]" />{p.supplierPhone}</p></> : <span className="text-slate-400">None set</span>}</td>
                      <td>{p.leadTimeDays ? `${p.leadTimeDays} day${p.leadTimeDays > 1 ? 's' : ''}` : '–'}</td>
                      <td className="text-right"><Button size="sm" variant="outline" icon="local_shipping" onClick={() => setDelivery({ partId: p.partId, supplierId: p.supplierId })}>Record delivery</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Latest movements" icon="swap_vert" bodyClassName="p-0">
          {moves.loading ? <Loading /> : (
            <ul className="divide-y divide-line">
              {(moves.data || []).slice(0, 12).map((m) => (
                <li key={m.id} className="flex items-start gap-3 px-5 py-3">
                  <StatusBadge status={m.txnType} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-md text-navy">{m.partName}</p>
                    <p className="truncate text-body-sm text-slate-500">{m.supplierName || m.note || label(m.txnType)} · {ago(m.txnAt)}</p>
                  </div>
                  <span className={`text-label-lg num ${m.quantity > 0 ? 'text-success' : 'text-danger'}`}>{m.quantity > 0 ? '+' : ''}{m.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <StockMovementModal open={!!delivery} onClose={() => setDelivery(null)} onSaved={refresh} type="receipts"
        partId={delivery?.partId} supplierId={delivery?.supplierId} />
    </>
  )
}
