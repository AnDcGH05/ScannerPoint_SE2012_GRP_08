import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { homePath, useAuth } from '../auth/AuthContext.jsx'
import Icon from '../components/Icon.jsx'
import { money } from '../lib/format.js'
import useApi from '../lib/useApi.js'

/*
 * Public landing page (from the Stitch "Landing page" screen).
 * The photos are the Stitch placeholder images. To use your own, put the files in
 * frontend/public/landing/ and change the `image` paths below to e.g. '/landing/slide-1.jpg'.
 */
const SLIDES = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdB2w74Vxu-vJKnztFKD4N56ewOnXM-Pc4XGcAdHdFs0YgOA9dRlhoRmOSTfSVs883jLN9PTtymbjlyrbmlXxFAOYp6HRMrWw6gYsYRpvdo1EliMA-wXr0iRiX8COlzVTwwiM5CuT6XcRh34DhMGHEPHKSeRJMQKtAnQmumC-Zqbm0BaOROn5PL-AgxmuJqz2dP6AtSG4TiK60fphXFX4cdrYKnxznHvnBBuWTq3_o9h24wk_Xc4N2',
    alt: 'Mechanic checking a car with a diagnostic scanner',
    tag: 'Vehicle service & diagnostics',
    title: <>Smart Diagnostics.<br /><span className="text-orange">Smarter Repairs.</span></>,
    text: 'Book your service online and follow every repair stage live, from inspection to collection.',
    second: 'login',
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYXafW0kQRIN3tf8qmKFrq2F8lu1FclA3x4JGtSXyvcNe80jylH4MkVzhiO750nZpOkFdftURvkazD-Nu76_zZxCDxNCHYdQJPCGmpt0BtOXk1NhOf47c3kbVtqgRkcZm7hMvWkbb6JrIClBtC5KGD28CHUeI6BJ4hdSpUkftrj6wbgH4a7Usmxdxm_ygniD5ExH85dZV9em4HsdqxhgvCvm7xrH2SGDIX-cDFrqolQdcbNG7bsgil',
    alt: 'Car raised on a hydraulic lift in a service bay',
    tag: 'Book your own time slot',
    title: <>Four bays. One-hour slots.<br /><span className="text-orange">No waiting.</span></>,
    text: 'Choose a date and time that suits you and secure it with a 50% deposit.',
    second: 'how',
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzud1DYbi_DBUGGlt59NKRUshzfYjcp53YYaZkVFFQSo4pR7WdB6VOBOkLt-FRJzpTxremZKBGaiUmhQMRPcj45n7-pBhcMVfvbFLPAdYbpiOSJp3D2Z_nKE4LJVcMiA-veaQYXRt-D0EKS9dgapaJDYZ2O9U4xrYB_XTk1xZ0xf73tDxlt6DlPAP-EPpwAq_M4NUNIEoESSBtTFA_I1pHMeM20DKzKdXh0AJtX2Iyo1fsEVZ-jfgy',
    alt: 'Customer receiving car keys at the service counter',
    tag: 'No surprises',
    title: <>Clear bills in <span className="text-orange">rupees.</span></>,
    text: 'Approve any extra work before it is done and see an itemised bill for every visit.',
    second: 'login',
  },
]

const ABOUT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRSfZTPQPGOkJ_Ft1zM9bUlhxj2oqUlkRNW61ICp34BQFnX2tMcxmJ0zw_VrfoXi_wXFpU-viiJFUBY41eNOWUtA_PCPFkVHASrJvQT_MyUz_0-GubkcnxubjZHUJdVp4G5G9RnQUF4mffCNc25hYkvJk6IPty_fQ40SaRUynCbdRuJk2bwHw39mIokh0sf3I0zmSaVWmq5uS--5li9GIQSCwC__8mhlVBBOIhcGtAzkopaUsbrTLW'

const HIGHLIGHTS = [
  { icon: 'event_available', title: 'Online booking', text: 'Pick a package, vehicle and time slot' },
  { icon: 'timeline', title: 'Live repair tracking', text: 'Follow 8 stages from Booked to Collected' },
  { icon: 'verified_user', title: 'You approve extra work', text: 'Nothing extra is done without your OK' },
  { icon: 'notifications_active', title: 'Service reminders', text: 'We remind you every 6 months or 5,000 km' },
]

const STEPS = [
  { title: 'Create your account', text: 'Sign up in a minute and add your vehicle and its documents.' },
  { title: 'Book a package and pay the deposit', text: 'Choose a date and time slot, then upload your bank-transfer slip.' },
  { title: 'Drop off your vehicle and track the repair live', text: 'Follow all 8 stages and approve any extra work from your phone.' },
  { title: 'Pay the bill and collect your vehicle', text: 'Pay the balance on the itemised bill and pick up your vehicle.' },
]

/** Shown if the database is not reachable, so the page never looks empty. */
const FALLBACK_PACKAGES = [
  { id: 1, name: 'Full Service + Cleanup', includesWork: 'Vacuuming, washing, engine tune-up and general repair', pricingType: 'FIXED', basePrice: 18000, depositAmount: 9000 },
  { id: 2, name: 'General Repair + Brake Maintenance', includesWork: 'Brake system cleaning, engine oil and oil filter change', pricingType: 'FIXED', basePrice: 12000, depositAmount: 6000 },
  { id: 3, name: 'Diagnostics + Specific Repairs', includesWork: 'Fault diagnosis; repairs priced after diagnosis and added to the bill', pricingType: 'VARIABLE', basePrice: 5000, depositAmount: 2500 },
]

const NAV = [['home', 'Home'], ['services', 'Services'], ['how-it-works', 'How It Works'], ['about', 'About Us'], ['contact', 'Contact']]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Photo with a navy fallback if the image cannot load. */
function Photo({ src, alt, className }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className={`${className} bg-gradient-to-br from-navy to-navy-light`} aria-label={alt} />
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
}

function Logo({ light = false }) {
  return (
    <span className="flex items-center gap-3">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-md ${light ? 'border border-white/20 bg-white/10' : 'bg-navy'}`}>
        <Icon name="build" className="text-orange" fill />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-navy'}`}>ScannerPoint</span>
        <span className={`mt-1 text-xs ${light ? 'text-slate-300' : 'text-slate-500'}`}>Smart Diagnostics. Smarter Repairs.</span>
      </span>
    </span>
  )
}

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const packages = useApi('/api/packages')
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [menu, setMenu] = useState(false)

  const next = useCallback(() => setSlide((s) => (s + 1) % SLIDES.length), [])
  const prev = () => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [paused, next, slide])

  const login = () => navigate('/login')
  const register = () => navigate('/login?tab=register')
  const book = () => navigate(user?.role === 'CUSTOMER' ? '/app/book' : user ? homePath(user.role) : '/login?tab=register')
  const list = packages.data?.length ? packages.data : FALLBACK_PACKAGES

  const authButtons = user ? (
    <button type="button" onClick={() => navigate(homePath(user.role))}
      className="rounded-lg bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-dark">
      My dashboard
    </button>
  ) : (
    <>
      <button type="button" onClick={login}
        className="rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-navy hover:text-white">
        Log in
      </button>
      <button type="button" onClick={register}
        className="rounded-lg bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-dark">
        Register
      </button>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col bg-page text-navy">
      {/* top navigation */}
      <header className="sticky top-0 z-50 border-b border-line bg-white shadow-sm">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-6 lg:px-12">
          <button type="button" onClick={() => scrollTo('home')} className="group"><Logo /></button>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map(([id, label]) => (
              <button key={id} type="button" onClick={() => scrollTo(id)}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-orange">{label}</button>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">{authButtons}</div>
          <button type="button" className="rounded p-2 sm:hidden" onClick={() => setMenu((m) => !m)} aria-label="Menu">
            <Icon name={menu ? 'close' : 'menu'} />
          </button>
        </div>
        {menu && (
          <div className="space-y-3 border-t border-line px-6 py-4 sm:hidden">
            {NAV.map(([id, label]) => (
              <button key={id} type="button" onClick={() => { setMenu(false); scrollTo(id) }} className="block text-sm font-medium text-slate-600">{label}</button>
            ))}
            <div className="flex gap-3 pt-2">{authButtons}</div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* hero slideshow */}
        <section id="home" className="mx-auto max-w-[1440px] scroll-mt-24 px-6 pb-12 pt-6 lg:px-12">
          <div className="relative h-[520px] w-full overflow-hidden rounded-card border border-line shadow-lg"
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {SLIDES.map((s, i) => (
              <div key={s.alt} className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                aria-hidden={i !== slide}>
                <Photo src={s.image} alt={s.alt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center bg-gradient-to-r from-navy/95 via-navy/75 to-transparent">
                  <div className="max-w-2xl space-y-5 px-10 text-white md:px-16">
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
                      {s.tag}
                    </span>
                    {i === 0
                      ? <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{s.title}</h1>
                      : <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{s.title}</h2>}
                    <p className="max-w-xl text-base leading-relaxed text-slate-100 md:text-lg">{s.text}</p>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button type="button" onClick={book}
                        className="rounded-lg bg-orange px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-dark">
                        Book a Service
                      </button>
                      <button type="button" onClick={s.second === 'how' ? () => scrollTo('how-it-works') : user ? () => navigate(homePath(user.role)) : login}
                        className="rounded-lg border-2 border-white px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white hover:text-navy">
                        {s.second === 'how' ? 'How It Works' : user ? 'My dashboard' : 'Log in'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={prev} aria-label="Previous slide"
              className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/60">
              <Icon name="chevron_left" />
            </button>
            <button type="button" onClick={next} aria-label="Next slide"
              className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/60">
              <Icon name="chevron_right" />
            </button>
            <div className="absolute bottom-6 left-10 z-20 flex items-center gap-2.5 md:left-16">
              {SLIDES.map((s, i) => (
                <button key={s.alt} type="button" onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === slide ? 'w-7 bg-orange' : 'w-2.5 bg-white/60 hover:bg-white'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* highlights */}
        <section className="mx-auto max-w-[1440px] px-6 pb-16 lg:px-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="rounded-xl border border-line bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10 text-orange"><Icon name={h.icon} /></div>
                <h3 className="mb-1 text-base font-bold">{h.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{h.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* packages – live from the database */}
        <section id="services" className="mx-auto max-w-[1440px] scroll-mt-24 border-t border-line px-6 py-16 lg:px-12">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-orange">Transparent rates</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Our Service Packages</h2>
            <p className="mt-2 text-sm text-slate-500">Fixed prices for routine work, and a diagnostic fee when we need to find the fault first.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {list.map((p, i) => {
              const featured = list.length === 3 && i === 1
              const variable = p.pricingType === 'VARIABLE'
              return (
                <div key={p.id} className={`relative flex flex-col justify-between rounded-card bg-white p-8 transition-all ${
                  featured ? 'border-2 border-navy shadow-md hover:shadow-lg' : 'border border-line shadow-sm hover:shadow-md'}`}>
                  {featured && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-navy px-3.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Recommended</span>
                  )}
                  <div className="space-y-4">
                    <span className="inline-flex items-center rounded-md bg-navy/5 px-3 py-1 text-xs font-semibold">
                      {variable ? 'Priced after diagnosis' : 'Fixed price'}
                    </span>
                    <h3 className="text-2xl font-bold">{p.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold num">{money(p.basePrice)}</span>
                      {variable && <span className="text-xs font-medium text-slate-500">diagnostic fee</span>}
                    </div>
                    <p className="border-t border-slate-100 pt-2 text-sm leading-relaxed text-slate-500">{p.includesWork}</p>
                    <div className="space-y-1 rounded-lg border border-line bg-page p-4">
                      <span className="text-xs font-semibold uppercase text-slate-500">Deposit to book</span>
                      <p className="text-sm font-bold num">{money(p.depositAmount)}</p>
                    </div>
                  </div>
                  <div className="pt-8">
                    <button type="button" onClick={book}
                      className="w-full rounded-lg bg-orange py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-dark">
                      Book now
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* how it works */}
        <section id="how-it-works" className="scroll-mt-20 border-y border-line/60 bg-beige py-20">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-orange">Four simple steps</span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">How It Works</h2>
              <p className="mt-2 text-sm text-slate-600">No surprises – you see every stage and approve every extra cost.</p>
            </div>
            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative flex flex-col items-center gap-4 text-center">
                  {i < STEPS.length - 1 && (
                    <Icon name="arrow_forward" className="absolute -right-6 top-5 hidden text-[28px] text-orange md:block" />
                  )}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-2xl font-bold text-white shadow-md">{i + 1}</div>
                  <div className="max-w-[220px] space-y-1">
                    <h3 className="text-lg font-bold">{s.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-600">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* about */}
        <section id="about" className="mx-auto max-w-[1440px] scroll-mt-24 px-6 py-20 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="group relative overflow-hidden rounded-2xl border border-line shadow-md">
                <Photo src={ABOUT_IMAGE} alt="The ScannerPoint workshop" className="h-[400px] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute bottom-4 left-4 rounded-lg bg-navy/90 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">ScannerPoint workshop, Kurunegala</div>
              </div>
            </div>
            <div className="space-y-6 lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-orange">About us</span>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">About ScannerPoint</h2>
              <p className="text-base leading-relaxed text-slate-600">
                ScannerPoint is a modern vehicle service and diagnostics garage in Kurunegala, Sri Lanka. Our certified
                mechanics find the fault first and explain it, you approve any extra work before it is done, and every
                visit ends with a clear, itemised bill in rupees.
              </p>
              <div className="grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-3">
                {[['garage', '4 service bays', 'One-hour booking slots'], ['schedule', 'Open 8:00 am – 4:00 pm', 'Book online any time'],
                  ['engineering', 'Certified mechanics', 'Engine, hybrid & brakes']].map(([icon, title, text]) => (
                  <div key={title} className="flex items-start gap-3 rounded-lg border border-line bg-white p-3">
                    <span className="rounded bg-orange/10 p-2 text-orange"><Icon name={icon} className="text-[20px]" /></span>
                    <div><h4 className="text-sm font-bold">{title}</h4><p className="text-xs text-slate-500">{text}</p></div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => scrollTo('services')} className="inline-flex items-center gap-2 text-sm font-bold text-orange hover:text-orange-dark">
                See our service packages <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* contact & footer */}
      <footer id="contact" className="border-t border-navy-light bg-navy pb-12 pt-16 text-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-14 md:grid-cols-12">
            <div className="space-y-4 md:col-span-4">
              <Logo light />
              <p className="max-w-sm pt-2 text-xs leading-relaxed text-slate-300">
                Online booking, live repair tracking, customer approval for extra work and clear bills in Sri Lankan rupees.
              </p>
            </div>
            <div className="space-y-3 md:col-span-5">
              <h4 className="text-sm font-bold uppercase tracking-wider text-orange">Garage & contact details</h4>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-3"><Icon name="location_on" className="text-[18px] text-orange" />Kurunegala, Sri Lanka</li>
                <li className="flex items-center gap-3"><Icon name="call" className="text-[18px] text-orange" />+94 37 222 8490 / +94 77 123 4567</li>
                <li className="flex items-center gap-3"><Icon name="mail" className="text-[18px] text-orange" />service@scannerpoint.lk</li>
                <li className="flex items-center gap-3"><Icon name="schedule" className="text-[18px] text-orange" />Monday – Saturday: 8:00 am – 4:00 pm (Sunday closed)</li>
              </ul>
            </div>
            <div className="space-y-3 md:col-span-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-orange">Quick links</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><button type="button" onClick={() => scrollTo('home')} className="hover:text-white">Home</button></li>
                <li><button type="button" onClick={() => scrollTo('services')} className="hover:text-white">Services & pricing</button></li>
                <li><button type="button" onClick={() => scrollTo('how-it-works')} className="hover:text-white">How it works</button></li>
                <li><Link to="/login" className="hover:text-white">Log in</Link></li>
                <li><Link to="/login?tab=register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>
          </div>
          <p className="pt-8 text-center text-xs text-slate-400">© 2026 ScannerPoint. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
