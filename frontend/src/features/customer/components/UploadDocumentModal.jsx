import { useEffect, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Field from '../../../components/Field'
import FileUpload from '../../../components/FileUpload'
import Modal from '../../../components/Modal'
import { ErrorBanner } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { isoDate } from '../../../lib/format'

/** Upload (or re-upload) a driving licence or insurance certificate for one vehicle. */
export default function UploadDocumentModal({ vehicle, docType: initialType, onClose, onDone }) {
  const toast = useToast()
  const [docType, setDocType] = useState('DRIVING_LICENCE')
  const [file, setFile] = useState(null)
  const [documentNo, setDocumentNo] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (vehicle) { setDocType(initialType || 'DRIVING_LICENCE'); setFile(null); setDocumentNo(''); setExpiryDate(''); setError(null) }
  }, [vehicle, initialType])

  const upload = async () => {
    setBusy(true)
    setError(null)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('docType', docType)
      data.append('documentNo', documentNo)
      data.append('expiryDate', expiryDate)
      await api.post(`/api/vehicles/${vehicle.id}/documents`, data)
      toast.success('Document uploaded – waiting for verification')
      onDone?.()
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={!!vehicle} onClose={onClose} title={`Upload document – ${vehicle?.registrationNo || ''}`} icon="upload_file" size="lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button icon="upload" loading={busy} disabled={!file || !documentNo || !expiryDate} onClick={upload}>Upload</Button></>}>
      <div className="space-y-4">
        <Field label="Document">
          <select className="input" value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="DRIVING_LICENCE">Driving licence</option><option value="INSURANCE">Insurance certificate</option>
          </select>
        </Field>
        <FileUpload file={file} onChange={setFile} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Document number"><input className="input" maxLength={30} value={documentNo} onChange={(e) => setDocumentNo(e.target.value)} /></Field>
          <Field label="Expiry date"><input className="input" type="date" min={isoDate()} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></Field>
        </div>
        <ErrorBanner error={error} />
      </div>
    </Modal>
  )
}
