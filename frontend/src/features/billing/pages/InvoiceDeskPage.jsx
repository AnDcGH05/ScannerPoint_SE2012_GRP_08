import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import { ErrorBanner, Loading, Notice } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import BillDocument from '../components/BillDocument'

const ITEM_TYPES = [['LABOUR', 'Labour'], ['PART', 'Part'], ['PACKAGE', 'Package'], ['DIAGNOSTIC_FEE', 'Diagnostic fee']]

/** Receptionist view of a bill (Stitch W3): add line, apply discount, issue, print. */
export default function InvoiceDeskPage() {
  const { id } = useParams()
  const toast = useToast()
  const bill = useApi(`/api/invoices/${id}`)
  const [modal, setModal] = useState(null)
  const [line, setLine] = useState({ itemType: 'LABOUR', description: '', quantity: 1, unitPrice: '' })
  const [disc, setDisc] = useState({ discount: '', taxRate: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (bill.loading) return <Loading />
  if (bill.error) return <ErrorBanner error={bill.error} />
  const b = bill.data
  const draft = b.status === 'DRAFT'

  const run = async (fn, msg) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fn()
      bill.setData(res.data)
      setModal(null)
      if (msg) toast.success(msg)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link to="/staff/invoices" className="flex items-center gap-1 text-label-lg text-navy hover:text-orange"><Icon name="arrow_back" /> Bills & invoices</Link>
        <div className="flex flex-wrap gap-2">
          {draft && <Button variant="outline" icon="add_circle" onClick={() => { setError(null); setModal('line') }}>Add line</Button>}
          {draft && <Button variant="outline" icon="sell" onClick={() => { setError(null); setDisc({ discount: b.discount, taxRate: b.taxRate }); setModal('discount') }}>Apply discount</Button>}
          {draft && <Button variant="danger-outline" icon="cancel" onClick={() => run(() => api.patch(`/api/invoices/${id}/cancel`), 'Draft cancelled')}>Cancel draft</Button>}
          {draft && <Button icon="check_circle" loading={busy} onClick={() => run(() => api.patch(`/api/invoices/${id}/issue`), 'Bill issued to the customer')}>Issue bill</Button>}
          <Button variant="navy" icon="print" onClick={() => window.print()}>Print</Button>
        </div>
      </div>
      {error && !modal && <ErrorBanner error={error} />}
      {draft && <Notice tone="beige" icon="edit_note" className="no-print">This bill is a draft. The customer cannot see it until you issue it.</Notice>}
      {b.status === 'ISSUED' && Number(b.balanceDue) > 0 && (
        <Notice tone="warning" className="no-print">Balance due {money(b.balanceDue)}. The vehicle can be released once the customer's slip for this amount is verified.</Notice>
      )}
      <BillDocument bill={b} onRemoveLine={draft ? (lineNo) => run(() => api.delete(`/api/invoices/${id}/lines/${lineNo}`), 'Line removed') : undefined} />

      <Modal open={modal === 'line'} onClose={() => setModal(null)} title="Add line" icon="add_circle"
        footer={<><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={busy} onClick={() => run(() => api.post(`/api/invoices/${id}/lines`, line), 'Line added')}>Add line</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <select className="input" value={line.itemType} onChange={(e) => setLine({ ...line, itemType: e.target.value })}>
              {ITEM_TYPES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </Field>
          <Field label="Quantity / hours"><input className="input num" type="number" min="0.01" step="0.01" value={line.quantity} onChange={(e) => setLine({ ...line, quantity: e.target.value })} /></Field>
          <Field label="Description" className="sm:col-span-2"><input className="input" maxLength={150} value={line.description} onChange={(e) => setLine({ ...line, description: e.target.value })} /></Field>
          <Field label="Unit price (Rs.)"><input className="input num" type="number" min="0" step="0.01" value={line.unitPrice} onChange={(e) => setLine({ ...line, unitPrice: e.target.value })} /></Field>
        </div>
        <ErrorBanner error={error} className="mt-4" />
      </Modal>

      <Modal open={modal === 'discount'} onClose={() => setModal(null)} title="Discount and tax" icon="sell"
        footer={<><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
          <Button loading={busy} onClick={() => run(() => api.patch(`/api/invoices/${id}/discount`, { discount: disc.discount || 0, taxRate: disc.taxRate || 0 }), 'Discount applied')}>Apply</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Discount (Rs.)" hint={`Subtotal ${money(b.subtotal)}`}><input className="input num" type="number" min="0" step="0.01" value={disc.discount} onChange={(e) => setDisc({ ...disc, discount: e.target.value })} /></Field>
          <Field label="Tax rate (%)" hint="0 – 30"><input className="input num" type="number" min="0" max="30" step="0.01" value={disc.taxRate} onChange={(e) => setDisc({ ...disc, taxRate: e.target.value })} /></Field>
        </div>
        <ErrorBanner error={error} className="mt-4" />
      </Modal>
    </div>
  )
}
