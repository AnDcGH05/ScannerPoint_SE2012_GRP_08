import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage, fieldErrors } from '../../../api/client'
import Button from '../../../components/Button'
import Drawer from '../../../components/Drawer'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import PageHeader from '../../../components/PageHeader'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { useToast } from '../../../components/Toast'
import { label, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import { CATEGORIES, CATEGORY_ICONS } from '../components/constants.js'

/** Spare parts and suppliers (Stitch T2). */
export default function PartsPage() {
  const [tab, setTab] = useState('parts')
  return (
    <>
      <PageHeader eyebrow="Stores" title="Spare parts & suppliers" subtitle="The parts catalogue, supplier prices and the approved supplier list." />
      <Tabs className="mb-6" value={tab} onChange={setTab} tabs={[{ key: 'parts', label: 'Spare parts' }, { key: 'suppliers', label: 'Suppliers' }]} />
      {tab === 'parts' ? <Parts /> : <Suppliers />}
    </>
  )
}

const BLANK_PART = { partCode: '', partName: '', category: 'OIL', unitPrice: '', reorderLevel: 5, openingStock: 0 }

function Parts() {
  const toast = useToast()
  const [category, setCategory] = useState('')
  const [lowStock, setLowStock] = useState(false)
  const [inactive, setInactive] = useState(false)
  const [q, setQ] = useState('')
  const parts = useApi('/api/parts', { params: { category: category || undefined, lowStock, includeInactive: inactive } })
  const [editing, setEditing] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(BLANK_PART)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const list = useMemo(() => (parts.data || []).filter((p) => `${p.partCode} ${p.partName}`.toLowerCase().includes(q.toLowerCase())), [parts.data, q])

  const open = (p) => {
    setEditing(p || 'new')
    setForm(p ? { ...p, openingStock: 0 } : BLANK_PART)
    setErrors({})
    setError(null)
  }
  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      if (editing === 'new') await api.post('/api/parts', form)
      else await api.put(`/api/parts/${editing.id}`, form)
      toast.success('Part saved')
      setEditing(null)
      parts.reload()
    } catch (e) {
      setErrors(fieldErrors(e))
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const toggle = async (p) => {
    try {
      await api.patch(`/api/parts/${p.id}/${p.active ? 'deactivate' : 'activate'}`)
      parts.reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <section className="card">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <div className="relative min-w-[220px] flex-1">
          <Icon name="search" className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input pl-10" placeholder="Search part code or name…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
        </select>
        <label className="flex items-center gap-2 text-body-md"><input type="checkbox" className="accent-navy" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} /> Low stock only</label>
        <label className="flex items-center gap-2 text-body-md"><input type="checkbox" className="accent-navy" checked={inactive} onChange={(e) => setInactive(e.target.checked)} /> Show inactive</label>
        <Button icon="add_box" onClick={() => open(null)}>Add spare part</Button>
      </div>
      {parts.loading ? <Loading /> : parts.error ? <ErrorBanner error={parts.error} className="m-4" /> : !list.length ? <EmptyState icon="inventory_2" title="No parts found" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-head"><tr><th>Code</th><th>Name</th><th>Category</th><th className="!text-right">Unit price</th><th className="!text-right">In stock</th><th className="!text-right">Re-order</th><th>Status</th><th /></tr></thead>
            <tbody className="table-body">
              {list.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'opacity-60'}>
                  <td className="font-semibold text-navy num">{p.partCode}</td>
                  <td><button type="button" onClick={() => setDetail(p)} className="text-left text-navy hover:text-orange">{p.partName}</button>
                    {p.preferredSupplier && <p className="text-body-sm text-slate-500">★ {p.preferredSupplier}</p>}</td>
                  <td><span className="flex items-center gap-1"><Icon name={CATEGORY_ICONS[p.category]} className="text-[18px] text-slate-500" />{label(p.category)}</span></td>
                  <td className="text-right num">{money(p.unitPrice)}</td>
                  <td className={`text-right font-semibold num ${p.quantityInStock === 0 ? 'text-danger' : p.lowStock ? 'text-orange-dark' : 'text-success'}`}>{p.quantityInStock}</td>
                  <td className="text-right num">{p.reorderLevel}</td>
                  <td>{!p.active ? <StatusBadge status="INACTIVE" /> : p.lowStock ? <StatusBadge status="PENDING" text="Low stock" /> : <StatusBadge status="ACTIVE" text="In stock" />}</td>
                  <td className="whitespace-nowrap text-right">
                    <button type="button" title="Suppliers & prices" onClick={() => setDetail(p)} className="rounded p-1.5 text-navy hover:bg-slate-100"><Icon name="local_shipping" /></button>
                    <Link to={`/staff/stock/${p.id}`} title="Stock card" className="inline-block rounded p-1.5 text-navy hover:bg-slate-100"><Icon name="monitoring" /></Link>
                    <button type="button" title="Edit" onClick={() => open(p)} className="rounded p-1.5 text-navy hover:bg-slate-100"><Icon name="edit" /></button>
                    <button type="button" title={p.active ? 'Deactivate' : 'Activate'} onClick={() => toggle(p)} className={`rounded p-1.5 hover:bg-slate-100 ${p.active ? 'text-danger' : 'text-success'}`}>
                      <Icon name={p.active ? 'toggle_off' : 'toggle_on'} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add spare part' : `Edit ${editing?.partCode}`}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button icon="save" loading={busy} onClick={save}>Save part</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Part code" error={errors.partCode}><input className="input uppercase" maxLength={20} value={form.partCode} onChange={set('partCode')} placeholder="OIL-5W30-4L" /></Field>
          <Field label="Category"><select className="input" value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}</select></Field>
          <Field label="Name" error={errors.partName} className="sm:col-span-2"><input className="input" maxLength={100} value={form.partName} onChange={set('partName')} /></Field>
          <Field label="Unit price (Rs.)" error={errors.unitPrice}><input className="input num" type="number" min="0" step="0.01" value={form.unitPrice} onChange={set('unitPrice')} /></Field>
          <Field label="Re-order level" error={errors.reorderLevel}><input className="input num" type="number" min="0" value={form.reorderLevel} onChange={set('reorderLevel')} /></Field>
          {editing === 'new' && (
            <Field label="Opening stock" hint="Written to the stock ledger as OPENING"><input className="input num" type="number" min="0" value={form.openingStock} onChange={set('openingStock')} /></Field>
          )}
        </div>
        {editing !== 'new' && <p className="mt-4 text-body-sm text-slate-500">Stock is not edited here – record a delivery or an adjustment on the stock page.</p>}
        <ErrorBanner error={error} className="mt-4" />
      </Drawer>

      <SupplierPrices part={detail} onClose={() => { setDetail(null); parts.reload() }} />
    </section>
  )
}

function SupplierPrices({ part, onClose }) {
  const toast = useToast()
  const prices = useApi(part ? `/api/parts/${part.id}/suppliers` : null)
  const suppliers = useApi(part ? '/api/suppliers' : null)
  const [form, setForm] = useState({ supplierId: '', unitCost: '', leadTimeDays: 1, preferred: false })
  const [error, setError] = useState(null)

  const save = async (body) => {
    setError(null)
    try {
      await api.post(`/api/parts/${part.id}/suppliers`, body)
      toast.success('Supplier price saved')
      setForm({ supplierId: '', unitCost: '', leadTimeDays: 1, preferred: false })
      prices.reload()
    } catch (e) {
      setError(errorMessage(e))
    }
  }
  const remove = async (supplierId) => {
    try {
      await api.delete(`/api/parts/${part.id}/suppliers/${supplierId}`)
      prices.reload()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <Drawer open={!!part} onClose={onClose} title={part?.partName} subtitle={`${part?.partCode} · ${part?.quantityInStock} in stock · sells at ${money(part?.unitPrice)}`}>
      <h3 className="mb-2 text-headline-sm text-navy">Supplier prices</h3>
      {prices.loading ? <Loading /> : !prices.data?.length ? <p className="text-body-md text-slate-500">No suppliers yet.</p> : (
        <ul className="mb-6 divide-y divide-line rounded-card border border-line">
          {prices.data.map((sp, i) => (
            <li key={sp.supplierId} className="flex items-center gap-3 px-4 py-3">
              <button type="button" title={sp.preferred ? 'Preferred supplier' : 'Make preferred'} onClick={() => save({ ...sp, preferred: true })}>
                <Icon name="star" fill={sp.preferred} className={sp.preferred ? 'text-orange' : 'text-slate-300 hover:text-orange'} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-label-lg text-navy">{sp.supplierName} {i === 0 && <span className="ml-1 text-body-sm text-success">(cheapest)</span>}</p>
                <p className="text-body-sm text-slate-500">{sp.supplierPhone} · {sp.leadTimeDays} day lead time</p>
              </div>
              <span className="text-label-lg num">{money(sp.unitCost)}</span>
              <button type="button" onClick={() => remove(sp.supplierId)} className="rounded p-1 text-danger hover:bg-danger-bg" title="Remove"><Icon name="delete" /></button>
            </li>
          ))}
        </ul>
      )}
      <h3 className="mb-2 text-headline-sm text-navy">Add or update a price</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Supplier" className="sm:col-span-2">
          <select className="input" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
            <option value="">Choose…</option>{(suppliers.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Unit cost (Rs.)"><input className="input num" type="number" min="0" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} /></Field>
        <Field label="Lead time (days)"><input className="input num" type="number" min="0" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-body-md sm:col-span-2"><input type="checkbox" className="accent-navy" checked={form.preferred} onChange={(e) => setForm({ ...form, preferred: e.target.checked })} /> Preferred supplier</label>
      </div>
      <ErrorBanner error={error} className="mt-3" />
      <Button className="mt-4" icon="save" disabled={!form.supplierId || !form.unitCost}
        onClick={() => save({ supplierId: Number(form.supplierId), unitCost: form.unitCost, leadTimeDays: Number(form.leadTimeDays), preferred: form.preferred })}>Save price</Button>
    </Drawer>
  )
}

const BLANK_SUPPLIER = { name: '', contactPerson: '', phoneNo: '', email: '', city: '' }

function Suppliers() {
  const toast = useToast()
  const suppliers = useApi('/api/suppliers')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState(BLANK_SUPPLIER)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const open = (s) => { setEditing(s || 'new'); setForm(s ? { ...s, email: s.email || '' } : BLANK_SUPPLIER); setErrors({}); setError(null) }
  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      if (editing === 'new') await api.post('/api/suppliers', form)
      else await api.put(`/api/suppliers/${editing.id}`, form)
      toast.success('Supplier saved')
      setEditing(null)
      suppliers.reload()
    } catch (e) {
      setErrors(fieldErrors(e))
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`/api/suppliers/${deleting.id}`)
      toast.success('Supplier removed')
      setDeleting(null)
      suppliers.reload()
    } catch (e) {
      toast.error(errorMessage(e))
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <div className="mb-4 flex justify-end"><Button icon="add_business" onClick={() => open(null)}>Register supplier</Button></div>
      {suppliers.loading ? <Loading /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suppliers.data.map((s) => (
            <article key={s.id} className="card flex flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-blue-50 text-navy"><Icon name="local_shipping" /></span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => open(s)} className="rounded p-1.5 text-navy hover:bg-slate-100" title="Edit"><Icon name="edit" /></button>
                  <button type="button" onClick={() => setDeleting(s)} className="rounded p-1.5 text-danger hover:bg-danger-bg" title="Delete"><Icon name="delete" /></button>
                </div>
              </div>
              <h3 className="text-headline-sm text-navy">{s.name}</h3>
              <ul className="mt-2 space-y-1 text-body-md text-slate-600">
                <li className="flex items-center gap-2"><Icon name="person" className="text-[18px]" />{s.contactPerson}</li>
                <li className="flex items-center gap-2"><Icon name="call" className="text-[18px]" />{s.phoneNo}</li>
                {s.email && <li className="flex items-center gap-2"><Icon name="mail" className="text-[18px]" />{s.email}</li>}
                <li className="flex items-center gap-2"><Icon name="location_on" className="text-[18px]" />{s.city}</li>
              </ul>
              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-1 text-label-sm uppercase tracking-wider text-slate-500">Parts supplied ({s.partsSupplied.length})</p>
                <div className="flex flex-wrap gap-1">
                  {s.partsSupplied.map((p) => <span key={p} className="rounded-full bg-beige px-2 py-0.5 text-body-sm text-beige-text">{p}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Register supplier' : 'Edit supplier'}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button icon="save" loading={busy} onClick={save}>Save supplier</Button></>}>
        <div className="space-y-4">
          <Field label="Company name" error={errors.name}><input className="input" maxLength={100} value={form.name} onChange={set('name')} /></Field>
          <Field label="Contact person" error={errors.contactPerson}><input className="input" maxLength={80} value={form.contactPerson} onChange={set('contactPerson')} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone (10 digits)" error={errors.phoneNo}><input className="input" maxLength={10} value={form.phoneNo} onChange={set('phoneNo')} placeholder="0112456789" /></Field>
            <Field label="City" error={errors.city}><input className="input" maxLength={50} value={form.city} onChange={set('city')} /></Field>
          </div>
          <Field label="E-mail" error={errors.email}><input className="input" type="email" maxLength={100} value={form.email} onChange={set('email')} /></Field>
          <ErrorBanner error={error} />
        </div>
      </Drawer>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete supplier?" icon="warning" tone="danger"
        footer={<><Button variant="outline" onClick={() => setDeleting(null)}>Keep</Button><Button variant="danger" loading={busy} onClick={remove}>Delete</Button></>}>
        Delete {deleting?.name}? Suppliers that appear in the stock ledger cannot be deleted.
      </Modal>
    </>
  )
}
