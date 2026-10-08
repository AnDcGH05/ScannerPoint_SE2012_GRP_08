import { useEffect } from 'react'
import Icon from './Icon.jsx'

/** Right-side panel for add / edit forms. */
export default function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-xl' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onMouseDown={onClose}>
      <aside className={`flex h-full w-full ${width} flex-col bg-white shadow-overlay`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-headline-md text-navy">{title}</h2>
            {subtitle && <p className="text-body-sm text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <Icon name="close" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line bg-page px-6 py-4">{footer}</footer>}
      </aside>
    </div>
  )
}
