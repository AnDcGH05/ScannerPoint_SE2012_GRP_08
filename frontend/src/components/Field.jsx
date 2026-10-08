import Icon from './Icon.jsx'

/** Label + control + inline validation message. */
export default function Field({ label, error, hint, required, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="label">
          {label} {required && <span className="text-danger">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-body-sm text-danger">
          <Icon name="error" className="text-[14px]" /> {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-body-sm text-slate-500">{hint}</span>
      )}
    </label>
  )
}
