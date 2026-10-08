import { useEffect, useState } from 'react'
import api, { errorMessage, fieldErrors } from '../../../api/client'
import Button from '../../../components/Button'
import Drawer from '../../../components/Drawer'
import Field from '../../../components/Field'
import FileUpload from '../../../components/FileUpload'
import Icon from '../../../components/Icon'
import { ErrorBanner, Notice } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { isoDate } from '../../../lib/format'

export const PLATE = /^(WP|CP|SP|NP|EP|NW|NC|UP|SG)-[A-Z]{2,3}-[0-9]{4}$/
const FUELS = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']
const BLANK = { registrationNo: '', make: '', model: '', manufactureYear: '', fuelType: 'PETROL', currentMileage: '', lastServiceDate: '', lastServiceMileage: '' }
const BLANK_DOC = { file: null, documentNo: '', expiryDate: '' }

function DocBox({ title, value, onChange }) {
  return (
    <div className="rounded-card border border-line p-4">
      <p className="mb-2 flex items-center gap-2 text-label-lg text-navy"><Icon name={title.startsWith('Insurance') ? 'verified_user' : 'badge'} /> {title}</p>
      <FileUpload file={value.file} onChange={(file) => onChange({ ...value, file })} hint="PDF, JPG or PNG – max 5 MB" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Document number"><input className="input" maxLength={30} value={value.documentNo} onChange={(e) => onChange({ ...value, documentNo: e.target.value })} /></Field>
        <Field label="Expiry date"><input className="input" type="date" min={isoDate()} value={value.expiryDate} onChange={(e) => onChange({ ...value, expiryDate: e.target.value })} /></Field>
      </div>
    </div>
  )
}

/** Add / edit vehicle drawer (Stitch A3). New vehicles can upload the licence and insurance straight away. */
export default function VehicleDrawer({ open, vehicle, customerId, onClose, onSaved }) {
  const toast = useToast()
  const [form, setForm] = useState(BLANK)
  const [licence, setLicence] = useState(BLANK_DOC)
  const [insurance, setInsurance] = useState(BLANK_DOC)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(vehicle ? { ...BLANK, ...vehicle, lastServiceDate: vehicle.lastServiceDate || '', lastServiceMileage: vehicle.lastServiceMileage ?? '' } : BLANK)
    setLicence(BLANK_DOC)
    setInsurance(BLANK_DOC)
    setErrors({})
    setError(null)
  }, [open, vehicle])

  const plate = form.registrationNo.toUpperCase()
  const plateOk = PLATE.test(plate)

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const body = { ...form, registrationNo: plate, customerId, manufactureYear: Number(form.manufactureYear), currentMileage: Number(form.currentMileage),
        lastServiceDate: form.lastServiceDate || null, lastServiceMileage: form.lastServiceMileage === '' ? null : Number(form.lastServiceMileage) }
      const res = vehicle ? await api.put(`/api/vehicles/${vehicle.id}`, body) : await api.post('/api/vehicles', body)
      for (const [docType, d] of [['DRIVING_LICENCE', licence], ['INSURANCE', insurance]]) {
        if (!d.file) continue
        const data = new FormData()
        data.append('file', d.file)
        data.append('docType', docType)
        data.append('documentNo', d.documentNo)
        data.append('expiryDate', d.expiryDate)
        try {
          await api.post(`/api/vehicles/${res.data.id}/documents`, data)
        } catch (e) {
          toast.error(`${docType === 'INSURANCE' ? 'Insurance' : 'Licence'} not uploaded: ${errorMessage(e)}`)
        }
      }
      toast.success(vehicle ? 'Vehicle updated' : `${plate} added`)
      onSaved?.(res.data)
      onClose()
    } catch (e) {
      setErrors(fieldErrors(e))
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <Drawer open={open} onClose={onClose} title={vehicle ? `Edit ${vehicle.registrationNo}` : 'Add vehicle'} subtitle="Sri Lankan number plates look like WP-CAV-9548"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button icon="save" loading={busy} onClick={save}>{vehicle ? 'Save changes' : 'Add vehicle'}</Button></>}>
      <div className="space-y-4">
        <Field label="Number plate" error={errors.registrationNo || (plate && !plateOk ? 'Format: province-letters-4 digits, e.g. WP-CAV-9548' : undefined)}
          hint={plateOk ? `Province: ${plate.slice(0, 2)}` : 'e.g. WP-CAV-9548'}>
          <div className="relative">
            <input className="input pr-9 uppercase tracking-wider num" maxLength={12} value={form.registrationNo} onChange={set('registrationNo')} placeholder="WP-CAV-9548" />
            {plateOk && <Icon name="check_circle" fill className="absolute right-2.5 top-2.5 text-[20px] text-success" />}
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Make" error={errors.make}><input className="input" maxLength={30} value={form.make} onChange={set('make')} placeholder="Toyota" /></Field>
          <Field label="Model" error={errors.model}><input className="input" maxLength={30} value={form.model} onChange={set('model')} placeholder="Axio" /></Field>
          <Field label="Year" error={errors.manufactureYear}><input className="input num" type="number" min="1950" max="2100" value={form.manufactureYear} onChange={set('manufactureYear')} /></Field>
          <Field label="Fuel type"><select className="input" value={form.fuelType} onChange={set('fuelType')}>{FUELS.map((f) => <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>)}</select></Field>
          <Field label="Current mileage (km)" error={errors.currentMileage}><input className="input num" type="number" min="0" value={form.currentMileage} onChange={set('currentMileage')} /></Field>
          <div />
          <Field label="Last service date" hint="Optional – used for service reminders"><input className="input" type="date" max={isoDate()} value={form.lastServiceDate} onChange={set('lastServiceDate')} /></Field>
          <Field label="Mileage at last service"><input className="input num" type="number" min="0" value={form.lastServiceMileage} onChange={set('lastServiceMileage')} /></Field>
        </div>
        {!vehicle && (
          <>
            <DocBox title="Driving licence" value={licence} onChange={setLicence} />
            <DocBox title="Insurance certificate" value={insurance} onChange={setInsurance} />
            <Notice tone="info">Bring the original documents when you drop off your vehicle – the receptionist will verify them.</Notice>
          </>
        )}
        <ErrorBanner error={error} />
      </div>
    </Drawer>
  )
}
