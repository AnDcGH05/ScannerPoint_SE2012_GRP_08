/** Material Symbols line icon, e.g. <Icon name="directions_car" />. */
export default function Icon({ name, fill = false, className = '', size }) {
  return (
    <span
      className={`icon ${fill ? 'icon-fill' : ''} ${className}`}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
