import Icon from './Icon.jsx'

const VARIANTS = {
  primary: 'bg-orange text-white hover:bg-orange-dark shadow-sm',
  navy: 'bg-navy text-white hover:bg-navy-dark shadow-sm',
  outline: 'bg-white border border-slate-300 text-navy hover:bg-slate-50',
  ghost: 'text-navy hover:bg-slate-100',
  success: 'bg-success text-white hover:brightness-95 shadow-sm',
  danger: 'bg-danger text-white hover:brightness-95 shadow-sm',
  'danger-outline': 'bg-white border border-danger-border text-danger hover:bg-danger-bg',
}

const SIZES = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-10 px-4 text-label-lg gap-2',
  lg: 'h-11 px-5 text-label-lg gap-2',
}

/** Orange = key action, navy = navigation / submit, outline = cancel. */
export default function Button({
  variant = 'primary', size = 'md', icon, iconRight, loading = false, disabled, className = '', children, ...rest
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-control font-semibold transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? <Icon name="progress_activity" className="animate-spin text-[18px]" /> : icon && <Icon name={icon} className="text-[18px]" />}
      {children}
      {iconRight && !loading && <Icon name={iconRight} className="text-[18px]" />}
    </button>
  )
}
