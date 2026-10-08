import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Field from '../../../components/Field'
import Modal from '../../../components/Modal'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { date, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'

/** Receptionist: bills list + "Bill" button for jobs that are Ready. */
export default function InvoicesPage() {
  const navigate = useNavigate()
  const invoices = useApi('/api/invoices')
  const ready = useApi('/api/jobcards', { params: { status: 'READY' } })
  const [tab, setTab] = useState('ALL')
  const [generating, setGenerating] = useState(null)
  const [warranty, setWarranty] = useState(3)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const billed = new Set((invoices.data || []).filter((i) => i.status !== 'CANCELLED').map((i) => i.jobCardId))
  const toBill = (ready.data || []).filter((j) => !billed.has(j.id))
  const list = (invoices.data || []).filter((i) => tab === 'ALL' || i.status === tab ||
    (tab === 'DUE' && i.status === 'ISSUED' && Number(i.balanceDue) > 0))

  const generate = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.post('/api/invoices', { jobCardId: generating.id, warrantyMonths: Number(warranty) || 0 })
      navigate(`/staff/invoices/${res.data.id}`)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Billing" title="Bills & invoices" subtitle="Generate the bill when a vehicle is Ready, adjust it while it is a draft, then issue it to the customer." />

      <Card title="Ready vehicles waiting for a bill" icon="garage" className="mb-6" bodyClassName="p-0">
        {ready.loading ? <Loading /> : !toBill.length ? (
          <EmptyState icon="task_alt" title="No vehicles waiting" text="Vehicles appear here when the mechanic marks them Ready." />
        ) : (
          <ul className="divide-y divide-line">
            {toBill.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <Plate value={j.registrationNo} />
                <div className="min-w-0 flex-1">
                  <p className="text-label-lg text-navy">{j.vehicleName}</p>
                  <p className="text-body-sm text-slate-500">{j.customerName} · {j.packageName} · Job #{j.id}</p>
                </div>
                <Button icon="request_quote" onClick={() => { setGenerating(j); setError(null) }}>Bill</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <section className="card">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[
          { key: 'ALL', label: 'All', count: invoices.data?.length },
          { key: 'DRAFT', label: 'Drafts', count: invoices.data?.filter((i) => i.status === 'DRAFT').length },
          { key: 'DUE', label: 'Balance due', count: invoices.data?.filter((i) => i.status === 'ISSUED' && Number(i.balanceDue) > 0).length },
          { key: 'PAID', label: 'Paid', count: invoices.data?.filter((i) => i.status === 'PAID').length },
        ]} />
        {invoices.loading ? <Loading /> : invoices.error ? <ErrorBanner error={invoices.error} className="m-4" /> : !list.length ? (
          <EmptyState icon="receipt" title="No bills here" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="table-head"><tr><th>Invoice</th><th>Customer & vehicle</th><th>Date</th><th className="!text-right">Total</th><th className="!text-right">Balance</th><th>Status</th><th /></tr></thead>
              <tbody className="table-body">
                {list.map((i) => (
                  <tr key={i.id}>
                    <td className="font-semibold text-navy num">{i.invoiceNo}</td>
                    <td><p className="text-navy">{i.customerName}</p><p className="text-body-sm text-slate-500">{i.vehicleName}</p></td>
                    <td>{date(i.invoiceDate)}</td>
                    <td className="text-right num">{money(i.total)}</td>
                    <td className={`text-right num ${Number(i.balanceDue) > 0 ? 'font-semibold text-orange-dark' : ''}`}>{money(i.balanceDue)}</td>
                    <td><StatusBadge status={i.status} /></td>
                    <td className="text-right"><Link to={`/staff/invoices/${i.id}`} className="text-label-lg text-orange hover:underline">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={!!generating} onClose={() => setGenerating(null)} title={`Generate bill – ${generating?.registrationNo || ''}`} icon="request_quote"
        footer={<><Button variant="outline" onClick={() => setGenerating(null)}>Cancel</Button><Button icon="request_quote" loading={busy} onClick={generate}>Generate draft bill</Button></>}>
        <p className="mb-4 text-body-md text-slate-600">
          The bill lines are worked out from the package ({generating?.packageName}), the approved extra work and the parts issued. You can still add lines or a discount before issuing it.
        </p>
        <Field label="Warranty (months)" hint="0 for no warranty">
          <input className="input" type="number" min="0" max="60" value={warranty} onChange={(e) => setWarranty(e.target.value)} />
        </Field>
        <ErrorBanner error={error} className="mt-4" />
      </Modal>
    </>
  )
}
