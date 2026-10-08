import { useEffect, useState } from 'react'
import api, { errorMessage, fieldErrors } from '../../../api/client'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import { ErrorBanner, Loading } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { date } from '../../../lib/format'
import useApi from '../../../lib/useApi'

/** Customer profile – edit own details and phone numbers. */
export default function ProfilePage() {
  const toast = useToast()
  const me = useApi('/api/customers/me')
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (me.data) setForm({ ...me.data, postalCode: me.data.postalCode || '', phones: me.data.phones.map((p) => ({ ...p })) })
  }, [me.data])

  if (me.loading || !form) return <Loading />
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setPhone = (i, k, v) => setForm({ ...form, phones: form.phones.map((p, j) => (j === i ? { ...p, [k]: v } : p)) })

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await api.put('/api/customers/me', {
        firstName: form.firstName, lastName: form.lastName, email: form.email, street: form.street, city: form.city,
        postalCode: form.postalCode, phones: form.phones.filter((p) => p.phoneNo),
      })
      me.setData(res.data)
      toast.success('Profile saved')
    } catch (e) {
      setErrors(fieldErrors(e))
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="My profile" subtitle={`Customer since ${date(form.registeredDate)} · username ${form.username}`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Personal details" icon="person" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" error={errors.firstName}><input className="input" value={form.firstName} onChange={set('firstName')} /></Field>
            <Field label="Last name" error={errors.lastName}><input className="input" value={form.lastName} onChange={set('lastName')} /></Field>
            <Field label="NIC" hint="Ask the front desk to correct your NIC"><input className="input" value={form.nic} disabled /></Field>
            <Field label="E-mail" error={errors.email}><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
            <Field label="Street" error={errors.street} className="sm:col-span-2"><input className="input" value={form.street} onChange={set('street')} /></Field>
            <Field label="City" error={errors.city}><input className="input" value={form.city} onChange={set('city')} /></Field>
            <Field label="Postal code" error={errors.postalCode}><input className="input" maxLength={5} value={form.postalCode} onChange={set('postalCode')} /></Field>
          </div>
        </Card>
        <Card title="Phone numbers" icon="call">
          <div className="space-y-3">
            {form.phones.map((p, i) => (
              <div key={i} className="flex gap-2">
                <select className="input w-28" value={p.phoneType} onChange={(e) => setPhone(i, 'phoneType', e.target.value)}>
                  <option value="MOBILE">Mobile</option><option value="HOME">Home</option><option value="WORK">Work</option>
                </select>
                <input className="input num" maxLength={10} value={p.phoneNo} onChange={(e) => setPhone(i, 'phoneNo', e.target.value)} />
                <button type="button" disabled={form.phones.length === 1} onClick={() => setForm({ ...form, phones: form.phones.filter((_, j) => j !== i) })}
                  className="rounded p-2 text-danger hover:bg-danger-bg disabled:opacity-30" aria-label="Remove phone"><Icon name="delete" /></button>
              </div>
            ))}
            {errors.phones && <p className="text-body-sm text-danger">{errors.phones}</p>}
            <Button size="sm" variant="ghost" icon="add" onClick={() => setForm({ ...form, phones: [...form.phones, { phoneNo: '', phoneType: 'HOME' }] })}>Add number</Button>
          </div>
        </Card>
      </div>
      <ErrorBanner error={error} className="mt-6" />
      <div className="mt-6 flex justify-end"><Button icon="save" loading={busy} onClick={save}>Save profile</Button></div>
    </>
  )
}
