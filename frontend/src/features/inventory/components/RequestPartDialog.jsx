import { useEffect, useMemo, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import { ErrorBanner, Loading } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { money } from '../../../lib/format'
import useApi from '../../../lib/useApi'

/** The mechanic's "Request part" dialog (Stitch T3): part search with stock shown, then quantity. */
export default function RequestPartDialog({ open, onClose, jobCardId, onRequested }) {
  const toast = useToast()
  const parts = useApi(open ? '/api/parts' : null)
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) { setQ(''); setPicked(null); setQuantity(1); setError(null) }
  }, [open])

  const list = useMemo(() => (parts.data || []).filter((p) =>
    `${p.partCode} ${p.partName} ${p.category}`.toLowerCase().includes(q.toLowerCase())), [parts.data, q])

  const send = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.post('/api/part-requests', { jobCardId, partId: picked.id, quantity: Number(quantity) })
      toast.success(`${picked.partName} requested from the store`)
      onRequested?.()
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Request part – job #${jobCardId}`} icon="inventory_2" size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button icon="send" disabled={!picked || quantity < 1} loading={busy} onClick={send}>Send request</Button></>}>
      <div className="relative mb-3">
        <Icon name="search" className="absolute left-3 top-2.5 text-slate-400" />
        <input className="input pl-10" autoFocus placeholder="Search part code or name…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {parts.loading ? <Loading /> : (
        <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-card border border-line">
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => setPicked(p)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-page ${picked?.id === p.id ? 'bg-orange-light' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-label-lg text-navy">{p.partName}</p>
                  <p className="text-body-sm text-slate-500 num">{p.partCode} · {money(p.unitPrice)}</p>
                </div>
                <span className={`text-label-md num ${p.quantityInStock === 0 ? 'text-danger' : p.lowStock ? 'text-orange-dark' : 'text-success'}`}>
                  {p.quantityInStock} in stock
                </span>
                {picked?.id === p.id && <Icon name="check_circle" fill className="text-orange" />}
              </button>
            </li>
          ))}
          {!list.length && <li className="px-4 py-6 text-center text-slate-500">No parts match “{q}”</li>}
        </ul>
      )}
      {picked && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Quantity" hint={picked.quantityInStock < quantity ? 'More than is in stock – the storekeeper may back-order it' : undefined}>
            <input className="input num" type="number" min="1" max="1000" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </Field>
        </div>
      )}
      <ErrorBanner error={error} className="mt-4" />
    </Modal>
  )
}
