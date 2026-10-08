import { useState } from 'react'
import api, { errorMessage, fieldErrors } from '../../../api/client'
import { useAuth } from '../../../auth/AuthContext'
import Button from '../../../components/Button'
import Drawer from '../../../components/Drawer'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import { ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { useToast } from '../../../components/Toast'
import { date, initials, isoDate, label, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'

const ROLES = ['RECEPTIONIST', 'MECHANIC', 'STOREKEEPER', 'ADMIN']
const ROLE_COLOURS = { RECEPTIONIST: 'bg-blue-50 text-navy', MECHANIC: 'bg-orange-light text-orange-dark', STOREKEEPER: 'bg-beige text-beige-text', ADMIN: 'bg-navy text-white' }
const BLANK = { firstName: '', lastName: '', role: 'MECHANIC', phoneNo: '', hireDate: isoDate(), email: '', username: '', temporaryPassword: '', specialization: '', hourlyRate: '' }

/** Admin staff management (Stitch S5). */
export default function StaffPage() {
  const { user } = useAuth()
  const toast = useToast()
  const staff = useApi('/api/staff')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const open = (s) => {
    setEditing(s || 'new')
    setForm(s ? { ...BLANK, ...s, specialization: s.specialization || '', hourlyRate: s.hourlyRate || '', temporaryPassword: '' } : BLANK)
    setErrors({})
    setError(null)
  }
  const save = async () => {
    setBusy(true)
    setError(null)
    const body = { ...form, hourlyRate: form.role === 'MECHANIC' ? form.hourlyRate || null : null,
      specialization: form.role === 'MECHANIC' ? form.specialization : null, temporaryPassword: form.temporaryPassword || null }
    try {
      if (editing === 'new') await api.post('/api/staff', body)
      else await api.put(`/api/staff/${editing.id}`, body)
      toast.success('Staff member saved')
      setEditing(null)
      staff.reload()
    } catch (e) {
      setErrors(fieldErrors(e))
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const toggle = async (s) => {
    try {
      await api.patch(`/api/staff/${s.id}/${s.active ? 'deactivate' : 'activate'}`)
      staff.reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <PageHeader eyebrow="Admin" title="Staff" subtitle="Receptionists, mechanics, storekeepers and admins. Deactivating someone stops their login but keeps their history."
        actions={<Button icon="person_add" onClick={() => open(null)}>Add staff member</Button>} />
      <section className="card">
        {staff.loading ? <Loading /> : staff.error ? <ErrorBanner error={staff.error} className="m-4" /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="table-head"><tr><th>Name</th><th>Role</th><th>Phone</th><th>Hire date</th><th>Specialisation</th><th className="!text-right">Hourly rate</th><th>Active</th><th /></tr></thead>
              <tbody className="table-body">
                {staff.data.map((s) => (
                  <tr key={s.id} className={s.active ? '' : 'opacity-60'}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-label-md text-white">{initials(s.fullName)}</span>
                        <div><p className="font-semibold text-navy">{s.fullName}</p><p className="text-body-sm text-slate-500">{s.username} · {s.email}</p></div>
                      </div>
                    </td>
                    <td><span className={`rounded-full px-2.5 py-1 text-label-sm ${ROLE_COLOURS[s.role]}`}>{label(s.role)}</span></td>
                    <td className="num">{s.phoneNo}</td>
                    <td>{date(s.hireDate)}</td>
                    <td>{s.specialization || '–'}</td>
                    <td className="text-right num">{s.hourlyRate ? money(s.hourlyRate) : '–'}</td>
                    <td>
                      <button type="button" disabled={s.id === user.id} onClick={() => toggle(s)} title={s.id === user.id ? 'You cannot deactivate yourself' : ''}
                        className="disabled:cursor-not-allowed">
                        <Icon name={s.active ? 'toggle_on' : 'toggle_off'} size={34} className={s.active ? 'text-success' : 'text-slate-400'} />
                      </button>
                    </td>
                    <td className="text-right"><button type="button" onClick={() => open(s)} className="rounded p-1.5 text-navy hover:bg-slate-100" title="Edit"><Icon name="edit" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add staff member' : `Edit ${editing?.fullName}`}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button icon="save" loading={busy} onClick={save}>Save</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName}><input className="input" value={form.firstName} onChange={set('firstName')} /></Field>
          <Field label="Last name" error={errors.lastName}><input className="input" value={form.lastName} onChange={set('lastName')} /></Field>
          <Field label="Role"><select className="input" value={form.role} onChange={set('role')}>{ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select></Field>
          <Field label="Phone (10 digits)" error={errors.phoneNo}><input className="input" maxLength={10} value={form.phoneNo} onChange={set('phoneNo')} /></Field>
          <Field label="Hire date" error={errors.hireDate}><input className="input" type="date" value={form.hireDate} onChange={set('hireDate')} /></Field>
          <Field label="E-mail" error={errors.email}><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
          {editing === 'new' && <Field label="Username" error={errors.username}><input className="input" value={form.username} onChange={set('username')} /></Field>}
          <Field label={editing === 'new' ? 'Temporary password' : 'New password (optional)'} error={errors.temporaryPassword}>
            <input className="input" type="password" value={form.temporaryPassword} onChange={set('temporaryPassword')} />
          </Field>
          {form.role === 'MECHANIC' && (
            <>
              <Field label="Specialisation"><input className="input" maxLength={50} value={form.specialization} onChange={set('specialization')} placeholder="e.g. Hybrid & Electrical" /></Field>
              <Field label="Hourly rate (Rs.)" error={errors.hourlyRate} required><input className="input num" type="number" min="1" value={form.hourlyRate} onChange={set('hourlyRate')} /></Field>
            </>
          )}
        </div>
        <ErrorBanner error={error} className="mt-4" />
      </Drawer>
    </>
  )
}
