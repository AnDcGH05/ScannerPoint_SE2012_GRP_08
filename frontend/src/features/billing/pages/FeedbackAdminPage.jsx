import { useState } from 'react'
import PageHeader from '../../../components/PageHeader'
import StatCard from '../../../components/StatCard'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import Tabs from '../../../components/Tabs'
import { dateTime } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import { Stars } from '../components/FeedbackForm'

/** Admin: every customer rating with vehicle, mechanic and date (Stitch W5 admin view). */
export default function FeedbackAdminPage() {
  const feedback = useApi('/api/feedback')
  const [tab, setTab] = useState('ALL')
  const all = feedback.data || []
  const avg = all.length ? all.reduce((s, f) => s + f.rating, 0) / all.length : 0
  const list = all.filter((f) => tab === 'ALL' || (tab === 'FIVE' && f.rating === 5) || (tab === 'LOW' && f.rating <= 3))

  return (
    <>
      <PageHeader eyebrow="Admin" title="Customer feedback" subtitle="Ratings customers leave after collecting their vehicle." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average rating" value={all.length ? `${avg.toFixed(2)} / 5` : '–'} icon="star" tone="orange" hint={`${all.length} reviews`} />
        {[5, 4, 3].map((n) => (
          <StatCard key={n} label={`${n} stars${n === 3 ? ' or less' : ''}`} icon="reviews"
            value={all.filter((f) => (n === 3 ? f.rating <= 3 : f.rating === n)).length} tone={n === 3 ? 'red' : 'green'} />
        ))}
      </div>
      <section className="card">
        <Tabs className="px-3" value={tab} onChange={setTab} tabs={[
          { key: 'ALL', label: 'All reviews', count: all.length },
          { key: 'FIVE', label: '5 stars', count: all.filter((f) => f.rating === 5).length },
          { key: 'LOW', label: 'Needs attention', count: all.filter((f) => f.rating <= 3).length },
        ]} />
        {feedback.loading ? <Loading /> : feedback.error ? <ErrorBanner error={feedback.error} className="m-4" /> : !list.length ? (
          <EmptyState icon="reviews" title="No feedback here" />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((f) => (
              <li key={f.jobCardId} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Stars value={f.rating} size={20} />
                  <p className="mt-1 text-body-md text-on-surface">{f.comments || <span className="text-slate-400">No comment</span>}</p>
                  <p className="mt-1 text-body-sm text-slate-500">{f.customerName} · {f.vehicleName} · {f.packageName}</p>
                </div>
                <div className="shrink-0 text-body-sm text-slate-500 sm:text-right">
                  <p>Mechanic: <span className="font-semibold text-navy">{f.mechanicName || '—'}</span></p>
                  <p>{dateTime(f.submittedAt)} · Job #{f.jobCardId}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
