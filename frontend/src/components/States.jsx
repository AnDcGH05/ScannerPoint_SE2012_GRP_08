import { errorMessage } from '../api/client.js'
import Button from './Button.jsx'
import Icon from './Icon.jsx'

export function Loading({ text = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-12 text-slate-500 ${className}`}>
      <Icon name="progress_activity" className="animate-spin" /> {text}
    </div>
  )
}

export function ErrorBanner({ error, onRetry, className = '' }) {
  if (!error) return null
  return (
    <div className={`flex items-start gap-3 rounded-card border border-danger-border bg-danger-bg p-4 text-danger ${className}`}>
      <Icon name="error" />
      <p className="flex-1 text-body-md">{typeof error === 'string' ? error : errorMessage(error)}</p>
      {onRetry && <Button size="sm" variant="danger-outline" onClick={onRetry}>Try again</Button>}
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon name={icon} size={28} />
      </span>
      <p className="text-headline-sm text-navy">{title}</p>
      {text && <p className="mt-1 max-w-md text-body-md text-slate-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Notice({ tone = 'info', icon, children, className = '' }) {
  const tones = {
    info: 'bg-blue-50 border-blue-200 text-navy',
    warning: 'bg-warning-bg border-warning-border text-warning',
    success: 'bg-success-bg border-success-border text-success',
    danger: 'bg-danger-bg border-danger-border text-danger',
    beige: 'bg-beige border-beige-border text-beige-text',
  }
  const icons = { info: 'info', warning: 'warning', success: 'check_circle', danger: 'error', beige: 'info' }
  return (
    <div className={`flex items-start gap-3 rounded-card border p-4 text-body-md ${tones[tone]} ${className}`}>
      <Icon name={icon || icons[tone]} className="mt-px" />
      <div className="flex-1">{children}</div>
    </div>
  )
}
