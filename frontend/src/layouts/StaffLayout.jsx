import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import Icon from '../components/Icon.jsx'
import { initials, label } from '../lib/format.js'
import { staffNav } from '../features/registry.js'

const GROUPS = ['Front desk', 'Workshop', 'Stores', 'Billing', 'Admin']

/** Staff (receptionist, mechanic, storekeeper, admin) use a left sidebar with role-specific menu items. */
export default function StaffLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const items = staffNav.filter((n) => !n.roles || n.roles.includes(user.role))

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-navy text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-white/10 text-orange"><Icon name="precision_manufacturing" /></span>
        <span className="leading-tight">
          <span className="block text-headline-sm">ScannerPoint</span>
          <span className="block text-body-sm text-on-primary-container">Garage OS · Kurunegala</span>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {GROUPS.map((g) => {
          const groupItems = items.filter((i) => (i.group || 'Workshop') === g)
          if (!groupItems.length) return null
          return (
            <div key={g} className="mb-4">
              <p className="px-3 pb-1 text-label-sm uppercase tracking-widest text-on-primary-container">{g}</p>
              {groupItems.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
                  className={({ isActive }) => `mb-0.5 flex items-center gap-3 rounded-control px-3 py-2 text-label-lg transition-colors ${
                    isActive ? 'bg-orange text-white shadow-sm' : 'text-slate-200 hover:bg-white/10'}`}>
                  <Icon name={n.icon} className="text-[20px]" /> {n.label}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange text-label-lg">{initials(user.fullName)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-label-lg">{user.fullName}</p>
            <p className="text-body-sm text-on-primary-container">{label(user.role)}</p>
          </div>
          <button type="button" title="Log out" onClick={() => { logout(); navigate('/login') }} className="rounded p-1.5 hover:bg-white/10">
            <Icon name="logout" />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-page">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block no-print">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>{sidebar}</div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur md:px-8 no-print">
          <button type="button" className="rounded p-1.5 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            <Icon name="menu" />
          </button>
          <p className="hidden items-center gap-2 text-body-md text-slate-500 sm:flex">
            <Icon name="verified" className="text-orange" /> ScannerPoint – Smart Diagnostics. Smarter Repairs.
          </p>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full bg-navy px-3 py-1 text-label-sm uppercase tracking-wider text-white">{label(user.role)}</span>
            <span className="hidden text-label-lg text-navy sm:block">{user.fullName}</span>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
