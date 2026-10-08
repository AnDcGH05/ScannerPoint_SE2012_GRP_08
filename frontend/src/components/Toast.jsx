import { createContext, useCallback, useContext, useState } from 'react'
import Icon from './Icon.jsx'

const ToastContext = createContext(null)

/** Small pop-up confirmations: const toast = useToast(); toast.success('Saved') */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((tone, text) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, tone, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])
  const api = { success: (t) => push('success', t), error: (t) => push('error', t), info: (t) => push('info', t) }
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex w-80 flex-col gap-2 no-print">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-2 rounded-card border p-3 shadow-overlay bg-white ${
            t.tone === 'error' ? 'border-danger-border' : t.tone === 'success' ? 'border-success-border' : 'border-line'}`}>
            <Icon name={t.tone === 'error' ? 'error' : t.tone === 'success' ? 'check_circle' : 'info'}
              className={t.tone === 'error' ? 'text-danger' : t.tone === 'success' ? 'text-success' : 'text-navy'} fill />
            <p className="text-body-md text-on-surface">{t.text}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
