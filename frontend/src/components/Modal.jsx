import { useEffect } from 'react'
import Icon from './Icon.jsx'

const WIDTHS = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

/** Centred dialog. footer usually holds Cancel / Confirm buttons. */
export default function Modal({ open, onClose, title, icon, children, footer, size = 'md', tone }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}>
      <div className={`w-full ${WIDTHS[size]} max-h-[92vh] overflow-hidden rounded-card bg-white shadow-overlay flex flex-col`}
        onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${tone === 'danger' ? 'bg-danger-bg border-danger-border' : 'border-line'}`}>
          <div className="flex items-center gap-2">
            {icon && <Icon name={icon} className={tone === 'danger' ? 'text-danger' : 'text-navy'} />}
            <h2 className="text-headline-sm text-navy">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <Icon name="close" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line bg-page px-5 py-3">{footer}</footer>}
      </div>
    </div>
  )
}
