import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { errorMessage, fieldErrors } from '../api/client.js'
import { homePath, useAuth } from '../auth/AuthContext.jsx'
import Button from '../components/Button.jsx'
import Field from '../components/Field.jsx'
import Icon from '../components/Icon.jsx'
import { ErrorBanner } from '../components/States.jsx'

const NIC = /^([0-9]{9}[VvXx]|[0-9]{12})$/
const MOBILE = /^0[0-9]{9}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Demo logins from 02_data.sql (password Demo@1234 after the demo-password reset). */
const DEMO = [
  { label: 'Customer', username: 'nimal.perera', icon: 'person' },
  { label: 'Receptionist', username: 'chamari.desilva', icon: 'support_agent' },
  { label: 'Mechanic', username: 'ishan.weerasinghe', icon: 'engineering' },
  { label: 'Storekeeper', username: 'lahiru.dissanayake', icon: 'inventory_2' },
  { label: 'Admin', username: 'roshan.peiris', icon: 'admin_panel_settings' },
]

const EMPTY = {
  firstName: '', lastName: '', nic: '', email: '', mobile: '', street: '', city: '', postalCode: '',
  username: '', password: '', confirmPassword: '',
}

function validate(f) {
  const e = {}
  if (!f.firstName.trim()) e.firstName = 'Enter your first name'
  if (!f.lastName.trim()) e.lastName = 'Enter your last name'
  if (!NIC.test(f.nic.trim())) e.nic = '9 digits + V/X (old) or 12 digits (new)'
  if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid e-mail address'
  if (!MOBILE.test(f.mobile.trim())) e.mobile = '10 digits starting with 0, e.g. 0771234567'
  if (!f.street.trim()) e.street = 'Enter your street address'
  if (!f.city.trim()) e.city = 'Enter your city'
  if (f.postalCode && !/^[0-9]{5}$/.test(f.postalCode)) e.postalCode = 'Postal code is 5 digits'
  if (!/^[A-Za-z0-9._-]{3,50}$/.test(f.username)) e.username = 'At least 3 letters/numbers (. _ - allowed)'
  if (f.password.length < 8) e.password = 'At least 8 characters'
  if (f.confirmPassword !== f.password) e.confirmPassword = 'The passwords do not match'
  return e
}

export default function LoginPage() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login')
  const [creds, setCreds] = useState({ usernameOrEmail: '', password: '' })
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [showPw, setShowPw] = useState(false)

  if (user) return <Navigate to={homePath(user.role)} replace />

  // go back to the page the user wanted, if it belongs to their side of the app
  const go = (u) => {
    const from = location.state?.from
    const fits = from && (u.role === 'CUSTOMER') === from.startsWith('/app')
    navigate(fits ? from : homePath(u.role), { replace: true })
  }

  const doLogin = async (e) => {
    e?.preventDefault()
    setError(null)
    setBusy(true)
    try {
      go(await login(creds.usernameOrEmail.trim(), creds.password))
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const doRegister = async (e) => {
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])))
    if (Object.keys(v).length) return
    setError(null)
    setBusy(true)
    try {
      go(await register({ ...form, nic: form.nic.trim().toUpperCase(), email: form.email.trim() }))
    } catch (err) {
      setErrors(fieldErrors(err))
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  const set = (k) => (e) => {
    const next = { ...form, [k]: e.target.value }
    setForm(next)
    if (touched[k]) setErrors(validate(next))
  }
  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors(validate(form))
  }
  const err = (k) => (touched[k] ? errors[k] : undefined)
  const ok = (k) => touched[k] && !errors[k] && form[k]

  const input = (k, props = {}) => (
    <div className="relative">
      <input className={`input pr-9 ${err(k) ? 'border-danger' : ''}`} value={form[k]} onChange={set(k)} onBlur={blur(k)} {...props} />
      {ok(k) && <Icon name="check_circle" fill className="absolute right-2.5 top-2.5 text-[20px] text-success" />}
    </div>
  )

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* left: brand panel */}
      <div className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-card bg-white/10 text-orange"><Icon name="build_circle" fill size={30} /></span>
          <div>
            <p className="text-headline-md">ScannerPoint</p>
            <p className="text-body-md text-on-primary-container">Smart Diagnostics. Smarter Repairs.</p>
          </div>
        </div>
        <div className="my-auto">
          <div className="relative mx-auto mb-10 h-56 w-full max-w-md">
            <div className="absolute inset-x-6 bottom-6 h-3 rounded-full bg-orange/80" />
            <div className="absolute bottom-9 left-16 h-24 w-3 rounded bg-slate-400/60" />
            <div className="absolute bottom-9 right-16 h-24 w-3 rounded bg-slate-400/60" />
            <div className="absolute inset-x-10 bottom-32 h-2 rounded-full bg-slate-300/70" />
            <Icon name="directions_car" fill className="absolute bottom-[8.4rem] left-1/2 -translate-x-1/2 text-white" size={128} />
            <Icon name="build" className="absolute right-6 top-2 rotate-12 text-orange" size={40} />
          </div>
          <h2 className="text-headline-xl">Your vehicle's service, start to finish.</h2>
          <ul className="mt-6 space-y-4 text-body-lg text-slate-200">
            <li className="flex gap-3"><Icon name="event_available" className="text-orange" /> Book a service package and pay the deposit online</li>
            <li className="flex gap-3"><Icon name="timeline" className="text-orange" /> Follow every repair stage live, from inspection to collection</li>
            <li className="flex gap-3"><Icon name="receipt_long" className="text-orange" /> Approve extra work and see clear, itemised bills in rupees</li>
          </ul>
        </div>
        <p className="text-body-sm text-on-primary-container">ScannerPoint · Kurunegala, Sri Lanka</p>
      </div>

      {/* right: forms */}
      <div className="flex items-center justify-center bg-page p-4 sm:p-8">
        <div className="w-full max-w-xl">
        <Link to="/" className="mb-3 inline-flex items-center gap-1 text-label-lg text-navy hover:text-orange">
          <Icon name="arrow_back" className="text-[18px]" /> Back to home
        </Link>
        <div className="card w-full p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <Icon name="build_circle" fill className="text-orange" size={30} />
            <p className="text-headline-md text-navy">ScannerPoint</p>
          </div>
          <div className="mb-6 grid grid-cols-2 rounded-control bg-slate-100 p-1">
            {[['login', 'Log in', 'login'], ['register', 'Create account', 'person_add']].map(([k, t, i]) => (
              <button key={k} type="button" onClick={() => { setTab(k); setError(null) }}
                className={`flex items-center justify-center gap-2 rounded-control py-2 text-label-lg ${tab === k ? 'bg-white text-navy shadow-card' : 'text-slate-500'}`}>
                <Icon name={i} className="text-[18px]" /> {t}
              </button>
            ))}
          </div>

          <ErrorBanner error={error} className="mb-4" />

          {tab === 'login' ? (
            <form onSubmit={doLogin} className="space-y-4">
              <div>
                <h1 className="text-headline-lg text-navy">Welcome back</h1>
                <p className="text-body-md text-slate-500">Log in to see your vehicles, bookings and bills.</p>
              </div>
              <Field label="Username or e-mail">
                <input className="input" autoComplete="username" value={creds.usernameOrEmail} required
                  onChange={(e) => setCreds({ ...creds, usernameOrEmail: e.target.value })} placeholder="e.g. nimal.perera" />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <input className="input pr-10" type={showPw ? 'text' : 'password'} autoComplete="current-password" required
                    value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} />
                  <button type="button" className="absolute right-2 top-2 text-slate-500" onClick={() => setShowPw((s) => !s)} aria-label="Show password">
                    <Icon name={showPw ? 'visibility_off' : 'visibility'} />
                  </button>
                </div>
              </Field>
              <div className="flex justify-end">
                <button type="button" className="text-body-sm text-orange hover:underline"
                  onClick={() => setError('Please contact the ScannerPoint front desk to reset your password.')}>Forgot password?</button>
              </div>
              <Button type="submit" className="w-full" size="lg" loading={busy} iconRight="arrow_forward">Log in</Button>

              <div className="rounded-card border border-line bg-page p-4">
                <p className="mb-2 flex items-center gap-2 text-label-md text-slate-600"><Icon name="badge" className="text-[18px]" /> Demo accounts (password Demo@1234)</p>
                <div className="flex flex-wrap gap-2">
                  {DEMO.map((d) => (
                    <button key={d.username} type="button" onClick={() => setCreds({ usernameOrEmail: d.username, password: 'Demo@1234' })}
                      className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-body-sm text-navy hover:border-navy">
                      <Icon name={d.icon} className="text-[16px]" /> {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={doRegister} noValidate className="space-y-4">
              <div>
                <h1 className="text-headline-lg text-navy">Create your account</h1>
                <p className="text-body-md text-slate-500">Register once, then book services and track repairs online.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" error={err('firstName')}>{input('firstName', { placeholder: 'Kasun' })}</Field>
                <Field label="Last name" error={err('lastName')}>{input('lastName', { placeholder: 'Perera' })}</Field>
                <Field label="NIC" error={err('nic')} hint="Old (881234567V) or new (199214502831)">{input('nic', { placeholder: '199214502831' })}</Field>
                <Field label="E-mail" error={err('email')}>{input('email', { type: 'email', placeholder: 'kasun@gmail.com' })}</Field>
                <Field label="Mobile number (10 digits)" error={err('mobile')}>{input('mobile', { type: 'tel', placeholder: '0771234567', maxLength: 10 })}</Field>
                <Field label="Street" error={err('street')}>{input('street', { placeholder: '45/2 Temple Road' })}</Field>
                <Field label="City" error={err('city')}>{input('city', { placeholder: 'Kurunegala' })}</Field>
                <Field label="Postal code" error={err('postalCode')}>{input('postalCode', { placeholder: '60000', maxLength: 5 })}</Field>
                <Field label="Username" error={err('username')} className="sm:col-span-2">{input('username', { placeholder: 'kasun.perera', autoComplete: 'username' })}</Field>
                <Field label="Password" error={err('password')}>{input('password', { type: 'password', autoComplete: 'new-password' })}</Field>
                <Field label="Confirm password" error={err('confirmPassword')}>{input('confirmPassword', { type: 'password', autoComplete: 'new-password' })}</Field>
              </div>
              <Button type="submit" className="w-full" size="lg" loading={busy} icon="person_check">Create account</Button>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
