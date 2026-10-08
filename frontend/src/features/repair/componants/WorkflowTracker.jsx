import { Fragment } from 'react'
import Icon from '../../../components/Icon'
import { Loading, Notice } from '../../../components/States'
import { dateTime, time } from '../../../lib/format'
import useApi from '../../../lib/useApi'

/**
 * The eight workflow boxes (Stitch A2 / S1): Booked, Inspection, Diagnosis, Awaiting Approval,
 * Repair In Progress, Quality Check, Ready, Collected. Beige boxes with an orange outline;
 * finished boxes are blurred, the current box glows, upcoming boxes stay sharp.
 * Pass appointmentId or jobCardId; it refreshes every 5 seconds while it is on screen.
 */
export default function WorkflowTracker({ appointmentId, jobCardId, data: given, size = 'md', showTimes = true }) {
  const url = given ? null : jobCardId ? `/api/jobcards/${jobCardId}/workflow` : `/api/appointments/${appointmentId}/workflow`
  const { data: fetched, loading } = useApi(url, { pollMs: 5000 })
  const data = given || fetched
  if (loading && !data) return <Loading text="Loading workflow…" />
  if (!data) return null
  if (data.cancelled) return <Notice tone="danger" icon="event_busy">{data.cancelMessage}</Notice>

  const big = size === 'lg'
  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <ol className="flex min-w-max items-stretch gap-1">
          {data.boxes.map((b, i) => {
            const blurred = b.state === 'BLURRED'
            const current = b.state === 'CURRENT'
            return (
              <Fragment key={b.stageNo}>
                {i > 0 && (
                  <li aria-hidden="true" className="flex items-center text-orange">
                    <Icon name="chevron_right" className={big ? 'text-[22px]' : 'text-[18px]'} />
                  </li>
                )}
                <li className="flex flex-col items-center gap-1">
                  <div
                    title={`${b.label}${blurred ? ' – finished' : current ? ' – current stage' : ''}`}
                    className={`flex flex-col items-center justify-center rounded-card bg-beige text-center font-bold text-black transition-all
                      ${big ? 'h-20 w-28 px-2 text-label-lg' : 'h-14 w-[5.5rem] px-1.5 text-body-sm'}
                      ${current ? 'border-[3px] border-orange shadow-glow' : 'border-2 border-orange'}
                      ${blurred ? 'opacity-60 [filter:blur(1.5px)]' : ''}`}
                  >
                    {current && <span className="mb-0.5 text-label-sm uppercase tracking-wider text-orange-dark">Now</span>}
                    <span className="leading-tight">{b.label}</span>
                  </div>
                  {showTimes && (
                    <span className={`max-w-[8rem] text-center text-body-sm ${current ? 'font-semibold text-navy' : 'text-slate-500'}`}>
                      {b.reachedAt ? time(b.reachedAt) : ' '}
                    </span>
                  )}
                </li>
              </Fragment>
            )
          })}
        </ol>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-body-md">
        {data.estimatedCompletion && (
          <span className="flex items-center gap-1 text-navy"><Icon name="schedule" className="text-orange" /> Estimated collection: <b>{dateTime(data.estimatedCompletion)}</b></span>
        )}
        {data.boxes.filter((b) => b.note && !b.note.startsWith('Collect on')).map((b) => (
          <span key={b.stageNo} className="flex items-center gap-1 text-slate-600"><Icon name="info" className="text-[16px] text-slate-400" /> {b.note}</span>
        ))}
      </div>
    </div>
  )
}
