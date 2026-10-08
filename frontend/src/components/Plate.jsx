/** Number plate badge, e.g. WP-CAV-9548. */
export default function Plate({ value, size = 'md' }) {
  if (!value) return null
  const sizes = { sm: 'text-body-sm', md: 'text-label-lg', lg: 'text-headline-md px-3 py-1' }
  return <span className={`plate ${sizes[size]}`}>{value}</span>
}
