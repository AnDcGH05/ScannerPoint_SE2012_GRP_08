import { useEffect, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import { ErrorBanner } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import useApi from '../../../lib/useApi'
import { MOVEMENT_TYPES } from './constants.js'

/** "Record stock movement" (Stitch T4): delivery, return or adjustment. Every movement goes to the stock ledger. */
export default function StockMovementModal({ open, onClose, onSaved, partId, supplierId, type = 'receipts' }) {
  const toast = useToast()
  const parts = useApi(open ? '/api/parts' : null)
  const suppliers = useApi(open ? '/api/suppliers' : null)
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setForm({ type, partId: partId || '', quantity: '', supplierId: supplierId || '', reference: '' })
      setError(null)
    }
  }, [open, partId, supplierId, type])

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.post(`/api/stock/${form.type}`, {
        partId: Number(form.partId), quantity: Number(form.quantity),
        supplierId: form.type === 'receipts' ? Number(form.supplierId) || null : null,
        reference: form.reference,
      })
      toast.success('Stock movement saved')
      onSaved?.()
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const adjustment = form.type === 'adjustments'

  return (
    <Modal open={open} onClose={onClose} title="Record stock movement" icon="inventory" size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button icon="save" loading={busy} onClick={save}>Save</Button></>}>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {MOVEMENT_TYPES.map((t) => (
          <button key={t.key} type="button" onClick={() => setForm({ ...form, type: t.key })}
            className={`flex items-center gap-2 rounded-control border-2 px-3 py-2 text-left text-label-md ${form.type === t.key ? 'border-orange bg-orange-light text-navy' : 'border-line text-slate-600'}`}>
            <Icon name={t.icon} /> {t.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Part" className="sm:col-span-2">
          <select className="input" value={form.partId} onChange={set('partId')}>
            <option value="">Choose a part…</option>
            {(parts.data || []).map((p) => <option key={p.id} value={p.id}>{p.partCode} – {p.partName} ({p.quantityInStock} in stock)</option>)}
          </select>
        </Field>
        <Field label={adjustment ? 'Quantity (+ to add, − to remove)' : 'Quantity received'}>
          <input className="input num" type="number" step="1" min={adjustment ? undefined : 1} value={form.quantity} onChange={set('quantity')} />
        </Field>
        {form.type === 'receipts' ? (
          <Field label="Supplier" required>
            <select className="input" value={form.supplierId} onChange={set('supplierId')}>
              <option value="">Choose a supplier…</option>
              {(suppliers.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        ) : <div />}
        <Field label={adjustment ? 'Reason' : 'GRN / reference / note'} required={adjustment} className="sm:col-span-2">
          <input className="input" maxLength={150} value={form.reference} onChange={set('reference')}
            placeholder={adjustment ? 'e.g. Damaged in store' : 'e.g. GRN-1007'} />
        </Field>
      </div>
      <ErrorBanner error={error} className="mt-4" />
    </Modal>
  )
}
