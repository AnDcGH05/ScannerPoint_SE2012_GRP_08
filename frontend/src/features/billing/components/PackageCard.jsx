import Icon from '../../../components/Icon'
import { money } from '../../../lib/format'

const ICONS = { FIXED: 'home_repair_service', VARIABLE: 'troubleshoot' }

/** One selectable service package (step 1 of the booking wizard). */
export default function PackageCard({ pkg, selected, onSelect }) {
  const variable = pkg.pricingType === 'VARIABLE'
  return (
    <button type="button" onClick={() => onSelect?.(pkg)}
      className={`relative flex h-full flex-col rounded-card border-2 bg-white p-5 text-left transition-all ${
        selected ? 'border-orange shadow-glow' : 'border-line hover:border-navy hover:shadow-raised'}`}>
      {selected && (
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-orange text-white">
          <Icon name="check" className="text-[18px]" />
        </span>
      )}
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-control bg-beige text-beige-text">
        <Icon name={ICONS[pkg.pricingType] || 'build'} />
      </span>
      <h3 className="pr-8 text-headline-sm text-navy">{pkg.name}</h3>
      <p className="mt-1 text-headline-md text-navy num">
        {variable ? <>Price after diagnosis</> : money(pkg.basePrice)}
      </p>
      {variable && <p className="text-body-sm text-slate-500">{money(pkg.basePrice)} diagnostic fee</p>}
      <p className="mt-3 flex-1 text-body-md text-slate-600">{pkg.includesWork}</p>
      <div className="mt-4 flex items-center justify-between rounded-control bg-beige px-3 py-2">
        <span className="text-label-md text-beige-text">Deposit ({Number(pkg.depositPercent)}%)</span>
        <span className="text-label-lg text-navy num">{money(pkg.depositAmount)}</span>
      </div>
    </button>
  )
}
