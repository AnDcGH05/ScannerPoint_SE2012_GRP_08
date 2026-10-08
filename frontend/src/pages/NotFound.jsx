import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page p-6 text-center">
      <Icon name="car_crash" size={48} className="text-orange" />
      <h1 className="text-headline-lg text-navy">Page not found</h1>
      <p className="text-slate-500">This page does not exist or has moved.</p>
      <Link to="/" className="font-semibold text-orange hover:underline">Go to my home page</Link>
    </div>
  )
}
