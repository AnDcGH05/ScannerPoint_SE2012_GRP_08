import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import StatCard from '../../../components/StatCard'
import { ErrorBanner, Loading } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { initials, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import CheckInModal from '../components/CheckInModal'
import { inStage, STAGE_ICONS, STAGE_LABELS, STAGES } from '../components/stages'

/** Receptionist job board (Stitch S2): one column per stage. */
export default function JobBoardPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const jobs = useApi('/api/jobcards', { pollMs: 10000 })
  const mechanics = useApi('/api/staff', { params: { role: 'MECHANIC' } })
  const [checkIn, setCheckIn] = useState(false)
  const [q, setQ] = useState('')
  const [mechanicFilter, setMechanicFilter] = useState('')
  const [busy, setBusy] = useState(null)

  const list = useMemo(() => (jobs.data || []).filter((j) =>
    (!q || `${j.registrationNo} ${j.customerName} ${j.id}`.toLowerCase().includes(q.toLowerCase())) &&
    (!mechanicFilter || String(j.mechanicId) === mechanicFilter)), [jobs.data, q, mechanicFilter])

  const assign = async (job, mechanicId) => {
    try {
      await api.patch(`/api/jobcards/${job.id}/mechanic`, { mechanicId: Number(mechanicId) })
      toast.success('Mechanic assigned')
      jobs.reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const release = async (job) => {
    setBusy(job.id)
    try {
      await api.post(`/api/jobcards/${job.id}/release`)
      toast.success(`${job.registrationNo} released to the customer`)
      jobs.reload()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  const all = jobs.data || []
  return (
    <>
      <PageHeader eyebrow="Front desk" title="Workshop job board" subtitle="Every vehicle in the workshop by stage. Check vehicles in, assign mechanics and release paid vehicles."
        actions={<Button icon="add_circle" onClick={() => setCheckIn(true)}>Check in vehicle</Button>} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="In the workshop" value={all.length} icon="garage" />
        <StatCard label="Awaiting approval" value={all.filter((j) => j.status === 'AWAITING_APPROVAL').length} icon="hourglass_top" tone="amber" />
        <StatCard label="Being repaired" value={all.filter((j) => j.status === 'IN_PROGRESS').length} icon="build" tone="orange" />
        <StatCard label="Ready for collection" value={all.filter((j) => j.status === 'READY').length} icon="task_alt" tone="green"
          hint={`${all.filter((j) => j.canRelease).length} paid and ready to release`} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Icon name="search" className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input pl-10" placeholder="Search plate, customer or job number…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={mechanicFilter} onChange={(e) => setMechanicFilter(e.target.value)}>
          <option value="">All mechanics</option>
          {(mechanics.data || []).map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
        </select>
      </div>

      {jobs.loading ? <Loading /> : jobs.error ? <ErrorBanner error={jobs.error} /> : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const col = list.filter((j) => j.status === stage)
            return (
              <section key={stage} className="flex w-72 shrink-0 flex-col rounded-card border border-beige-border bg-beige/50">
                <header className="flex items-center justify-between rounded-t-card bg-beige px-4 py-3">
                  <span className="flex items-center gap-2 text-label-lg text-navy"><Icon name={STAGE_ICONS[stage]} className="text-[18px] text-orange" />{STAGE_LABELS[stage]}</span>
                  <span className="rounded-full bg-white px-2 text-label-md text-navy">{col.length}</span>
                </header>
                <div className="flex flex-1 flex-col gap-3 p-3">
                  {col.map((j) => (
                    <article key={j.id} className="rounded-card border border-line bg-white p-3 shadow-card">
                      <div className="flex items-start justify-between gap-2">
                        <Plate value={j.registrationNo} size="sm" />
                        <span className="text-body-sm text-slate-400">#{j.id}</span>
                      </div>
                      <Link to={`/staff/jobs/${j.id}`} className="mt-2 block text-label-lg text-navy hover:text-orange">{j.vehicleName.split('–')[1]?.trim() || j.vehicleName}</Link>
                      <p className="flex items-center gap-1 text-body-sm text-slate-500"><Icon name="person" className="text-[14px]" />{j.customerName}</p>
                      <span className="mt-2 inline-block rounded-full bg-beige px-2 py-0.5 text-label-sm text-beige-text">{j.packageName}</span>
                      <div className="mt-3 flex items-center gap-2 border-t border-line pt-2">
                        {j.mechanicId ? (
                          <>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-label-sm text-white">{initials(j.mechanicName)}</span>
                            <span className="min-w-0 flex-1 truncate text-body-sm">{j.mechanicName}</span>
                          </>
                        ) : (
                          <select className="input h-8 flex-1 text-body-sm" value="" onChange={(e) => assign(j, e.target.value)}>
                            <option value="">Unassigned – assign…</option>
                            {(mechanics.data || []).map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                          </select>
                        )}
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-body-sm text-slate-500"><Icon name="schedule" className="text-[14px]" />{inStage(j.hoursInStage)}</p>
                      {j.pendingApprovals > 0 && <p className="mt-1 text-body-sm font-semibold text-warning">{j.pendingApprovals} extra task(s) waiting for the customer</p>}
                      {stage === 'READY' && (
                        <div className="mt-3 space-y-2">
                          {j.balanceDue !== null && <p className={`text-body-sm num ${j.canRelease ? 'text-success' : 'text-orange-dark'}`}>{j.canRelease ? 'Bill paid' : `Balance ${money(j.balanceDue)}`}</p>}
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" icon="receipt_long" className="flex-1" onClick={() => navigate('/staff/invoices')}>Bill</Button>
                            <Button size="sm" variant="success" icon="key" className="flex-1" disabled={!j.canRelease} loading={busy === j.id}
                              title={j.canRelease ? '' : 'Release is possible once the bill is fully paid'} onClick={() => release(j)}>Release</Button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                  {!col.length && <p className="py-6 text-center text-body-sm text-slate-400">No vehicles</p>}
                </div>
              </section>
            )
          })}
        </div>
      )}
      <CheckInModal open={checkIn} onClose={() => setCheckIn(false)} onDone={jobs.reload} />
    </>
  )
}
