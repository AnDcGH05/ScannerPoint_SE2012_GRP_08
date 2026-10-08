import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import Icon from '../components/Icon.jsx'
import { initials } from '../lib/format.js'
import { customerNav } from '../features/registry.js'

/** Customers use a top navigation bar (Stitch Prompt 0). */
export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-control px-3 py-2 text-label-lg transition-colors ${
      isActive ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-navy'}`

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur no-print">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
          <NavLink to="/app" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-navy text-orange"><Icon name="build_circle" fill /></span>
            <span className="leading-tight">
              <span className="block text-headline-sm text-navy">ScannerPoint</span>
              <span className="block text-body-sm text-slate-500">Smart Diagnostics. Smarter Repairs.</span>
            </span>
          </NavLink>
          <nav className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
            {customerNav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>{n.label}</NavLink>)}
          </nav>
          <div className="relative ml-auto">
            <button type="button" onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-control px-2 py-1 hover:bg-slate-100">
              <span className="hidden text-right sm:block">
                <span className="block text-label-lg text-navy">{user?.fullName}</span>
                <span className="block text-body-sm text-slate-500">Customer</span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-label-lg text-white">{initials(user?.fullName)}</span>
            </button>
            {menu && (
              <div className="absolute right-0 mt-2 w-48 rounded-card border border-line bg-white py-1 shadow-overlay" onMouseLeave={() => setMenu(false)}>
                <button type="button" onClick={() => { setMenu(false); navigate('/app/profile') }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-slate-50"><Icon name="person" /> Profile</button>
                <button type="button" onClick={() => { logout(); navigate('/login') }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-danger hover:bg-danger-bg"><Icon name="logout" /> Log out</button>
              </div>
            )}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 lg:hidden">
          {customerNav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>{n.label}</NavLink>)}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-white py-5 text-center text-body-sm text-slate-500 no-print">
        ScannerPoint · Kurunegala · Smart Diagnostics. Smarter Repairs.
      </footer>
    </div>
  )
}
