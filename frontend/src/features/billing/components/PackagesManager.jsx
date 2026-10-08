import { useState } from 'react'
import api, { errorMessage, fieldErrors } from '../../../api/client'
import Button from '../../../components/Button'
import Drawer from '../../../components/Drawer'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import { ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { useToast } from '../../../components/Toast'
import { money } from '../../../lib/format'
import useApi from '../../../lib/useApi'

const BLANK = { name: '', includesWork: '', pricingType: 'FIXED', basePrice: '', depositPercent: 50, labourRate: '', serviceIntervalKm: '', serviceIntervalMonths: '' }

/** "Service packages" management cards (Stitch W6). */
export default function PackagesManager() {
  const toast = useToast()
  const packages = useApi('/api/packages/all')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const open = (p) => {
    setEditing(p || 'new')
    setForm(p ? { ...BLANK, ...p, serviceIntervalKm: p.serviceIntervalKm ?? '', serviceIntervalMonths: p.serviceIntervalMonths ?? '' } : BLANK)
    setErrors({})
    setError(null)
  }

  const save = async () => {
    setBusy(true)
    setError(null)
    const body = { ...form, serviceIntervalKm: form.serviceIntervalKm || null, serviceIntervalMonths: form.serviceIntervalMonths || null }
    try {
      if (editing === 'new') await api.post('/api/packages', body)
      else await api.put(`/api/packages/${editing.id}`, body)
      toast.success('Package saved')
      setEditing(null)
      packages.reload()
    } catch (e) {
      setErrors(fieldErrors(e))
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (p) => {
    try {
      await api.patch(`/api/packages/${p.id}/${p.active ? 'deactivate' : 'activate'}`)
      packages.reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <div className="mb-4 flex justify-end"><Button icon="add_circle" onClick={() => open(null)}>New service package</Button></div>
      {packages.loading ? <Loading /> : (
        <div className="grid gap-6 lg:grid-cols-3">
          {packages.data.map((p) => (
            <article key={p.id} className={`card flex flex-col p-5 ${p.active ? '' : 'opacity-60'}`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-beige text-beige-text">
                  <Icon name={p.pricingType === 'FIXED' ? 'home_repair_service' : 'troubleshoot'} />
                </span>
                <StatusBadge status={p.active ? 'ACTIVE' : 'INACTIVE'} />
              </div>
              <h3 className="text-headline-sm text-navy">{p.name}</h3>
              <p className="mt-1 flex-1 text-body-md text-slate-600">{p.includesWork}</p>
              <dl className="mt-4 space-y-1.5 text-body-md">
                <div className="flex justify-between"><dt className="text-slate-500">Pricing</dt><dd className="font-semibold">{p.pricingType === 'FIXED' ? 'Fixed' : 'Variable'}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">{p.pricingType === 'FIXED' ? 'Price' : 'Diagnostic fee'}</dt><dd className="font-semibold num">{money(p.basePrice)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Deposit</dt><dd className="num">{Number(p.depositPercent)}% · {money(p.depositAmount)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Extra labour</dt><dd className="num">{money(p.labourRate)} / h</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Service interval</dt>
                  <dd className="num">{p.serviceIntervalKm ? `${p.serviceIntervalKm.toLocaleString()} km / ${p.serviceIntervalMonths} mo` : '–'}</dd></div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" icon="edit" onClick={() => open(p)}>Edit</Button>
                <Button variant={p.active ? 'danger-outline' : 'outline'} size="sm" icon={p.active ? 'toggle_off' : 'toggle_on'} onClick={() => toggle(p)}>
                  {p.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New service package' : 'Edit package'}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button loading={busy} icon="save" onClick={save}>Save package</Button></>}>
        <div className="space-y-4">
          <Field label="Name" error={errors.name}><input className="input" maxLength={60} value={form.name} onChange={set('name')} /></Field>
          <Field label="Included work" error={errors.includesWork}><textarea className="input" rows={3} maxLength={255} value={form.includesWork} onChange={set('includesWork')} /></Field>
          <Field label="Pricing type">
            <select className="input" value={form.pricingType} onChange={set('pricingType')}>
              <option value="FIXED">Fixed – package price</option><option value="VARIABLE">Variable – diagnostic fee, priced after diagnosis</option>
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={form.pricingType === 'FIXED' ? 'Price (Rs.)' : 'Diagnostic fee (Rs.)'} error={errors.basePrice}><input className="input num" type="number" min="0" value={form.basePrice} onChange={set('basePrice')} /></Field>
            <Field label="Deposit %" error={errors.depositPercent}><input className="input num" type="number" min="0" max="100" value={form.depositPercent} onChange={set('depositPercent')} /></Field>
            <Field label="Labour rate for extra work (Rs./h)" error={errors.labourRate}><input className="input num" type="number" min="0" value={form.labourRate} onChange={set('labourRate')} /></Field>
            <div />
            <Field label="Service interval (km)"><input className="input num" type="number" min="1" value={form.serviceIntervalKm} onChange={set('serviceIntervalKm')} /></Field>
            <Field label="Service interval (months)"><input className="input num" type="number" min="1" max="255" value={form.serviceIntervalMonths} onChange={set('serviceIntervalMonths')} /></Field>
          </div>
          <ErrorBanner error={error} />
        </div>
      </Drawer>
    </>
  )
}
