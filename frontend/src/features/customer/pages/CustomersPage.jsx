import { useEffect, useState } from 'react'
import api, { errorMessage, fieldErrors } from '../../../api/client'
import Button from '../../../components/Button'
import Drawer from '../../../components/Drawer'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import StatCard from '../../../components/StatCard'
import { EmptyState, ErrorBanner, Loading, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { useToast } from '../../../components/Toast'
import { date, dateTime, initials, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import DocumentChip, { latestDocs } from '../components/DocumentChip.jsx'
import HistoryModal from '../components/HistoryModal.jsx'
import UploadDocumentModal from '../components/UploadDocumentModal.jsx'
import VehicleDrawer, { PLATE } from '../components/VehicleDrawer.jsx'

const BLANK = { firstName: '', lastName: '', nic: '', email: '', mobile: '', street: '', city: '', postalCode: '' }
const BLANK_V = { registrationNo: '', make: '', model: '', manufactureYear: '', fuelType: 'PETROL', currentMileage: '' }

/** Receptionist: customers and vehicles (Stitch A6). */
export default function CustomersPage() {
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const customers = useApi('/api/customers', { params: { q: query || undefined } })
  const [walkIn, setWalkIn] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const list = customers.data || []
  return (
    <>
      <PageHeader eyebrow="Front desk" title="Customers & vehicles" subtitle="Find customers by name, phone, NIC or number plate, and register walk-in customers."
        actions={<Button icon="person_add" onClick={() => setWalkIn(true)}>Register walk-in customer</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Customers" value={query ? `${list.length} found` : list.length} icon="groups" />
        <StatCard label="Vehicles" value={list.reduce((s, c) => s + c.vehicleCount, 0)} icon="directions_car" tone="orange" />
        <StatCard label="Registered this month" value={list.filter((c) => c.registeredDate?.slice(0, 7) === new Date().toISOString().slice(0, 7)).length} icon="person_add" tone="green" />
      </div>
      <section className="card">
        <div className="border-b border-line p-4">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-2.5 text-slate-400" />
            <input className="input pl-10" placeholder="Search by name, phone, NIC or number plate (e.g. Nimal, 077, 1985…, WP-CAV-9548)" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {customers.loading ? <Loading /> : customers.error ? <ErrorBanner error={customers.error} className="m-4" /> : !list.length ? (
          <EmptyState icon="person_search" title="No customers found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="table-head"><tr><th>Customer</th><th>NIC</th><th>Phones</th><th>City</th><th className="!text-right">Vehicles</th><th>Registered</th><th /></tr></thead>
              <tbody className="table-body">
                {list.map((c) => (
                  <tr key={c.id} className={c.active ? '' : 'opacity-60'}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-label-md text-beige-text">{initials(c.fullName)}</span>
                        <div><p className="font-semibold text-navy">{c.fullName}</p><p className="text-body-sm text-slate-500">{c.email}</p></div>
                      </div>
                    </td>
                    <td className="num">{c.nic}</td>
                    <td className="num">{c.phones.map((p) => p.phoneNo).join(', ')}</td>
                    <td>{c.city}</td>
                    <td className="text-right num">{c.vehicleCount}</td>
                    <td>{date(c.registeredDate)}{!c.active && <StatusBadge status="INACTIVE" className="ml-2" />}</td>
                    <td className="text-right"><Button size="sm" variant="outline" icon="visibility" onClick={() => setSelected(c.id)}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <WalkInDrawer open={walkIn} onClose={() => setWalkIn(false)} onDone={customers.reload} />
      <CustomerDrawer id={selected} onClose={() => { setSelected(null); customers.reload() }} />
    </>
  )
}

function WalkInDrawer({ open, onClose, onDone }) {
  const [form, setForm] = useState(BLANK)
  const [withVehicle, setWithVehicle] = useState(true)
  const [vehicle, setVehicle] = useState(BLANK_V)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { if (open) { setForm(BLANK); setVehicle(BLANK_V); setErrors({}); setError(null); setResult(null) } }, [open])

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const body = { ...form, vehicle: withVehicle ? { ...vehicle, registrationNo: vehicle.registrationNo.toUpperCase(),
        manufactureYear: Number(vehicle.manufactureYear), currentMileage: Number(vehicle.currentMileage) } : null }
      const res = await api.post('/api/customers', body)
      setResult(res.data)
      onDone?.()
    } catch (e) {
      setErrors(fieldErrors(e))
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setV = (k) => (e) => setVehicle({ ...vehicle, [k]: e.target.value })

  return (
    <Drawer open={open} onClose={onClose} title="Register walk-in customer" subtitle="An online account is created; give the customer the temporary password."
      footer={result ? <Button variant="navy" onClick={onClose}>Done</Button> : <><Button variant="outline" onClick={onClose}>Cancel</Button><Button icon="person_add" loading={busy} onClick={save}>Register</Button></>}>
      {result ? (
        <div className="space-y-4">
          <Notice tone="success" icon="how_to_reg">{result.customer.fullName} is registered{result.vehicle ? ` with ${result.vehicle.registrationNo}` : ''}.</Notice>
          <div className="rounded-card border-2 border-orange bg-orange-light p-4">
            <p className="text-label-sm uppercase tracking-wider text-orange-dark">Login details – give these to the customer</p>
            <p className="mt-2 text-body-md">Username: <b className="num">{result.username}</b></p>
            <p className="text-body-md">Temporary password: <b className="num">{result.temporaryPassword}</b></p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" error={errors.firstName}><input className="input" value={form.firstName} onChange={set('firstName')} /></Field>
            <Field label="Last name" error={errors.lastName}><input className="input" value={form.lastName} onChange={set('lastName')} /></Field>
            <Field label="NIC" error={errors.nic}><input className="input uppercase" maxLength={12} value={form.nic} onChange={set('nic')} /></Field>
            <Field label="Mobile (10 digits)" error={errors.mobile}><input className="input" maxLength={10} value={form.mobile} onChange={set('mobile')} /></Field>
            <Field label="E-mail" error={errors.email} className="sm:col-span-2"><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
            <Field label="Street" error={errors.street} className="sm:col-span-2"><input className="input" value={form.street} onChange={set('street')} /></Field>
            <Field label="City" error={errors.city}><input className="input" value={form.city} onChange={set('city')} /></Field>
            <Field label="Postal code" error={errors.postalCode}><input className="input" maxLength={5} value={form.postalCode} onChange={set('postalCode')} /></Field>
          </div>
          <label className="flex items-center gap-2 text-label-lg text-navy"><input type="checkbox" className="h-4 w-4 accent-navy" checked={withVehicle} onChange={(e) => setWithVehicle(e.target.checked)} /> Add the first vehicle</label>
          {withVehicle && (
            <div className="grid gap-4 rounded-card border border-line p-4 sm:grid-cols-2">
              <Field label="Number plate" error={errors['vehicle.registrationNo'] || (vehicle.registrationNo && !PLATE.test(vehicle.registrationNo.toUpperCase()) ? 'e.g. WP-CAV-9548' : undefined)} className="sm:col-span-2">
                <input className="input uppercase num" maxLength={12} value={vehicle.registrationNo} onChange={setV('registrationNo')} placeholder="WP-CAV-9548" />
              </Field>
              <Field label="Make"><input className="input" value={vehicle.make} onChange={setV('make')} /></Field>
              <Field label="Model"><input className="input" value={vehicle.model} onChange={setV('model')} /></Field>
              <Field label="Year"><input className="input num" type="number" value={vehicle.manufactureYear} onChange={setV('manufactureYear')} /></Field>
              <Field label="Fuel"><select className="input" value={vehicle.fuelType} onChange={setV('fuelType')}>{['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'].map((f) => <option key={f}>{f}</option>)}</select></Field>
              <Field label="Mileage (km)"><input className="input num" type="number" value={vehicle.currentMileage} onChange={setV('currentMileage')} /></Field>
            </div>
          )}
          <ErrorBanner error={error} />
        </div>
      )}
    </Drawer>
  )
}

function CustomerDrawer({ id, onClose }) {
  const toast = useToast()
  const customer = useApi(id ? `/api/customers/${id}` : null)
  const vehicles = useApi(id ? `/api/vehicles?customerId=${id}` : null)
  const bookings = useApi(id ? `/api/appointments?customerId=${id}` : null)
  const [tab, setTab] = useState('profile')
  const [edit, setEdit] = useState(null)
  const [vehicleDrawer, setVehicleDrawer] = useState(null)
  const [history, setHistory] = useState(null)
  const [upload, setUpload] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { setTab('profile'); setEdit(null); setError(null) }, [id])
  const c = customer.data

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.put(`/api/customers/${id}`, { ...edit, postalCode: edit.postalCode || null })
      customer.setData(res.data)
      setEdit(null)
      toast.success('Customer updated')
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const toggle = async () => {
    try {
      const res = await api.patch(`/api/customers/${id}/${c.active ? 'deactivate' : 'activate'}`)
      customer.setData(res.data)
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <Drawer open={!!id} onClose={onClose} width="max-w-3xl" title={c?.fullName || 'Customer'} subtitle={c ? `#${c.id} · registered ${date(c.registeredDate)}` : ''}>
      {!c ? <Loading /> : (
        <>
          <Tabs className="mb-5" value={tab} onChange={setTab} tabs={[
            { key: 'profile', label: 'Profile' }, { key: 'vehicles', label: 'Vehicles', count: vehicles.data?.length },
            { key: 'bookings', label: 'Bookings', count: bookings.data?.length },
          ]} />
          {tab === 'profile' && (edit ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[['firstName', 'First name'], ['lastName', 'Last name'], ['nic', 'NIC'], ['email', 'E-mail'], ['street', 'Street'], ['city', 'City'], ['postalCode', 'Postal code']].map(([k, l]) => (
                  <Field key={k} label={l}><input className="input" value={edit[k] || ''} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></Field>
                ))}
                <Field label="Phones (comma separated)">
                  <input className="input" value={edit.phones.map((p) => p.phoneNo).join(', ')}
                    onChange={(e) => setEdit({ ...edit, phones: e.target.value.split(',').map((x, i) => ({ phoneNo: x.trim(), phoneType: i === 0 ? 'MOBILE' : 'HOME' })) })} />
                </Field>
              </div>
              <ErrorBanner error={error} />
              <div className="flex gap-2"><Button icon="save" loading={busy} onClick={save}>Save</Button><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button></div>
            </div>
          ) : (
            <div className="space-y-4">
              <dl className="grid gap-4 rounded-card bg-page p-4 sm:grid-cols-2">
                {[['NIC', c.nic], ['E-mail', c.email], ['Phones', c.phones.map((p) => `${p.phoneNo} (${p.phoneType.toLowerCase()})`).join(', ')],
                  ['Address', `${c.street}, ${c.city} ${c.postalCode || ''}`], ['Username', c.username], ['Status', c.active ? 'Active' : 'Deactivated']].map(([k, v]) => (
                  <div key={k}><dt className="text-label-sm uppercase tracking-wider text-slate-500">{k}</dt><dd className="text-body-md text-navy">{v}</dd></div>
                ))}
              </dl>
              <div className="flex gap-2">
                <Button variant="outline" icon="edit" onClick={() => setEdit({ ...c })}>Edit</Button>
                <Button variant={c.active ? 'danger-outline' : 'outline'} icon={c.active ? 'person_off' : 'person'} onClick={toggle}>{c.active ? 'Deactivate' : 'Activate'}</Button>
              </div>
            </div>
          ))}
          {tab === 'vehicles' && (
            <div className="space-y-4">
              <Button size="sm" icon="add" onClick={() => setVehicleDrawer({})}>Add vehicle</Button>
              {(vehicles.data || []).map((v) => {
                const d = latestDocs(v.documents)
                return (
                  <div key={v.id} className="rounded-card border border-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2"><Plate value={v.registrationNo} /><span className="text-label-lg text-navy">{v.make} {v.model} {v.manufactureYear}</span></div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" icon="upload_file" onClick={() => setUpload(v)}>Document</Button>
                        <Button size="sm" variant="ghost" icon="history" onClick={() => setHistory(v)}>History</Button>
                        <Button size="sm" variant="ghost" icon="edit" onClick={() => setVehicleDrawer({ vehicle: v })}>Edit</Button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2"><DocumentChip type="DRIVING_LICENCE" doc={d.DRIVING_LICENCE} /><DocumentChip type="INSURANCE" doc={d.INSURANCE} /></div>
                  </div>
                )
              })}
              {!vehicles.data?.length && <EmptyState icon="directions_car" title="No vehicles" />}
            </div>
          )}
          {tab === 'bookings' && (
            !bookings.data?.length ? <EmptyState icon="event" title="No bookings" /> : (
              <ul className="divide-y divide-line rounded-card border border-line">
                {bookings.data.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1"><p className="text-label-lg text-navy">{dateTime(b.scheduledAt)} · {b.registrationNo}</p><p className="text-body-sm text-slate-500">{b.packageName} · deposit {money(b.depositAmount)}</p></div>
                    <StatusBadge status={b.depositStatus} text={`Deposit ${b.depositStatus.toLowerCase().replace('_', ' ')}`} />
                    <StatusBadge status={b.status} />
                  </li>
                ))}
              </ul>
            )
          )}
        </>
      )}
      <VehicleDrawer open={!!vehicleDrawer} vehicle={vehicleDrawer?.vehicle} customerId={id} onClose={() => setVehicleDrawer(null)} onSaved={vehicles.reload} />
      <HistoryModal vehicle={history} onClose={() => setHistory(null)} />
      <UploadDocumentModal vehicle={upload} onClose={() => setUpload(null)} onDone={vehicles.reload} />
    </Drawer>
  )
}
