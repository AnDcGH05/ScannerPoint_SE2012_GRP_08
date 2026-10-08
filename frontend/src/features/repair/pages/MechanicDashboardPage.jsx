import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import StatCard from '../../../components/StatCard'
import { EmptyState, ErrorBanner, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import Tabs from '../../../components/Tabs'
import { useAuth } from '../../../auth/AuthContext'
import { dateTime, isoDate } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import { inStage, STAGE_LABELS, STAGES } from '../components/stages.js'

/** Mechanic dashboard – "My jobs" (Stitch S3). */
export default function MechanicDashboardPage() {
  const { user } = useAuth()
  const jobs = useApi('/api/jobcards/assigned', { pollMs: 10000 })
  const [stage, setStage] = useState('ALL')
  const all = jobs.data || []
  const order = (s) => STAGES.indexOf(s)
  const list = all.filter((j) => stage === 'ALL' || j.status === stage).sort((a, b) => order(a.status) - order(b.status))
  const today = isoDate()

  return (
    <>
      <PageHeader eyebrow="Workshop" title="My jobs" subtitle={`Jobs assigned to ${user.fullName}. Open a job to save the inspection, update tasks, request parts and move it on.`} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Open jobs" value={all.filter((j) => j.status !== 'READY').length} icon="build" tone="orange" />
        <StatCard label="Waiting for approval" value={all.filter((j) => j.status === 'AWAITING_APPROVAL').length} icon="hourglass_top" tone="amber" />
        <StatCard label="Ready today" value={all.filter((j) => j.status === 'READY' && j.completedAt?.startsWith(today)).length} icon="task_alt" tone="green" />
      </div>
      <Tabs className="mb-4" value={stage} onChange={setStage} tabs={[
        { key: 'ALL', label: 'All stages', count: all.length },
        ...STAGES.map((s) => ({ key: s, label: STAGE_LABELS[s], count: all.filter((j) => j.status === s).length })),
      ]} />
      {jobs.loading ? <Loading /> : jobs.error ? <ErrorBanner error={jobs.error} /> : !list.length ? (
        <div className="card"><EmptyState icon="engineering" title="No jobs here" text="New jobs appear when the receptionist assigns them to you." /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((j) => (
            <Link key={j.id} to={`/staff/jobs/${j.id}`} className="card block p-5 transition-shadow hover:shadow-raised">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-body-sm text-slate-400">Job #{j.id}</p>
                  <div className="mt-1 flex items-center gap-2"><Plate value={j.registrationNo} /><span className="text-label-lg text-navy">{j.vehicleName.split('–')[1]}</span></div>
                </div>
                <StatusBadge status={j.status} text={STAGE_LABELS[j.status]} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-body-md">
                <p className="flex items-center gap-1 text-slate-600"><Icon name="home_repair_service" className="text-[18px] text-slate-400" />{j.packageName}</p>
                <p className="flex items-center gap-1 text-slate-600"><Icon name="schedule" className="text-[18px] text-slate-400" />{inStage(j.hoursInStage)}</p>
                <p className="col-span-2 flex items-center gap-1 text-slate-600"><Icon name="event" className="text-[18px] text-slate-400" />Collect: {dateTime(j.estimatedCompletion)}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                {j.openPartRequests > 0 && <span className="rounded-full bg-warning-bg px-2.5 py-1 text-label-sm text-warning">{j.openPartRequests} part request(s) pending</span>}
                {j.pendingApprovals > 0 && <span className="rounded-full bg-warning-bg px-2.5 py-1 text-label-sm text-warning">{j.pendingApprovals} waiting for customer</span>}
                <span className="ml-auto flex items-center gap-1 text-label-lg text-orange">Open job <Icon name="arrow_forward" className="text-[18px]" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
