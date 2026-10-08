import { useEffect, useState } from 'react'
import Button from './Button.jsx'
import Modal from './Modal.jsx'

/** "Reject" dialog with quick-fill reason chips; the reason is required (max 150 characters). */
export default function ReasonModal({ open, onClose, onSubmit, title = 'Reject', description, presets = [], confirmText = 'Reject', loading }) {
  const [reason, setReason] = useState('')
  useEffect(() => { if (open) setReason('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={title} icon="block" tone="danger"
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="danger" icon="block" loading={loading} disabled={!reason.trim()} onClick={() => onSubmit(reason.trim())}>{confirmText}</Button>
      </>}>
      {description && <p className="mb-4 text-body-md text-slate-600">{description}</p>}
      {presets.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p} type="button" onClick={() => setReason(p)}
              className={`rounded-full border px-3 py-1 text-body-sm ${reason === p ? 'border-navy bg-navy text-white' : 'border-slate-300 text-navy hover:bg-slate-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
      <label className="label" htmlFor="reason">Reason</label>
      <textarea id="reason" className="input" rows={3} maxLength={150} value={reason} onChange={(e) => setReason(e.target.value)}
        placeholder="Explain why, so the customer or mechanic knows what to do next" />
      <p className="mt-1 text-right text-body-sm text-slate-400">{reason.length}/150</p>
    </Modal>
  )
}
