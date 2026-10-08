import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Icon from '../../../components/Icon'
import Plate from '../../../components/Plate'
import { ErrorBanner, Loading, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { useToast } from '../../../components/Toast'
import { dateTime, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import FeedbackForm from '../../billing/components/FeedbackForm'
import WorkflowTracker from '../components/WorkflowTracker'
import { STAGE_LABELS } from '../components/stages'

/** Customer job page with the workflow and extra-work approval (Stitch S1). */
export default function CustomerJobPage() {
  const { id } = useParams()
  const toast = useToast()
  const detail = useApi(`/api/jobcards/${id}`, { pollMs: 10000 })
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)

  if (detail.loading) return <Loading />
  if (detail.error) return <ErrorBanner error={detail.error} />
  const { job, inspection, tasks, history } = detail.data
  const waiting = tasks.filter((t) => t.approvalStatus === 'PENDING')

  const answer = async (task, approved) => {
    setBusy(`${task.taskNo}${approved}`)
    setError(null)
    try {
      await api.patch(`/api/jobcards/${id}/tasks/${task.taskNo}/approval`, { approved })
      toast.success(approved ? `Approved: ${task.description}` : `Declined: ${task.description}`)
      detail.reload()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-body-sm text-slate-500">
        <Link to="/app" className="hover:text-navy">Dashboard</Link><Icon name="chevron_right" className="text-[16px]" />
        <span className="text-navy">Job #{job.id}</span>
      </nav>

      <header className="card flex flex-col gap-4 p-6 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Plate value={job.registrationNo} size="lg" />
            <h1 className="text-headline-lg text-navy">{job.vehicleName.split('–')[1]}</h1>
          </div>
          <p className="mt-2 text-body-md text-slate-600">{job.packageName} · Mechanic: <b>{job.mechanicName}</b> · Checked in {dateTime(job.checkInAt)}</p>
        </div>
        <div className="md:text-right">
          <StatusBadge status={job.status} text={STAGE_LABELS[job.status]} />
          <p className="mt-2 flex items-center gap-1 text-body-md text-navy md:justify-end"><Icon name="schedule" className="text-orange" /> Estimated collection: <b>{dateTime(job.estimatedCompletion)}</b></p>
        </div>
      </header>

      <Card title="Repair progress" icon="timeline"><WorkflowTracker jobCardId={job.id} size="lg" /></Card>

      {waiting.length > 0 && (
        <section className="rounded-card border-2 border-warning-amber bg-warning-bg p-5">
          <div className="mb-1 flex items-center gap-2 text-warning"><Icon name="notification_important" /><h2 className="text-headline-sm">Extra work awaiting your approval</h2></div>
          <p className="mb-4 text-body-md text-slate-700">Your mechanic found extra work. It will only be done if you approve it.</p>
          <ul className="space-y-3">
            {waiting.map((t) => (
              <li key={t.taskNo} className="flex flex-col gap-3 rounded-card bg-white p-4 shadow-card sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-label-lg text-navy">{t.description}</p>
                  <p className="text-body-md text-slate-600 num">{Number(t.labourHours)} h labour · estimated <b>{money(t.estimatedCost)}</b> (parts extra)</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="success" icon="thumb_up" loading={busy === `${t.taskNo}true`} onClick={() => answer(t, true)}>Approve</Button>
                  <Button variant="danger-outline" icon="thumb_down" loading={busy === `${t.taskNo}false`} onClick={() => answer(t, false)}>Decline</Button>
                </div>
              </li>
            ))}
          </ul>
          <ErrorBanner error={error} className="mt-3" />
        </section>
      )}

      {job.status === 'READY' && job.balanceDue !== null && Number(job.balanceDue) > 0 && (
        <Notice tone="warning" icon="receipt_long">
          Your vehicle is ready. Balance due <b className="num">{money(job.balanceDue)}</b> – <Link to="/app/bills" className="font-semibold underline">view the bill and pay</Link>.
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Inspection findings & diagnosis" icon="monitor_heart">
            {!inspection ? <p className="text-body-md text-slate-500">The mechanic has not finished the inspection yet.</p> : (
              <dl className="grid gap-4 sm:grid-cols-3">
                <div><dt className="text-label-sm uppercase tracking-wider text-slate-500">Findings</dt><dd className="mt-1 text-body-md">{inspection.findings}</dd></div>
                <div><dt className="text-label-sm uppercase tracking-wider text-slate-500">Diagnosis</dt><dd className="mt-1 text-body-md">{inspection.diagnosis || '—'}</dd></div>
                <div><dt className="text-label-sm uppercase tracking-wider text-slate-500">Recommended action</dt><dd className="mt-1 text-body-md">{inspection.recommendedAction || '—'}</dd></div>
              </dl>
            )}
          </Card>
          <Card title="Work on your vehicle" icon="checklist" bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {tasks.map((t) => (
                <li key={t.taskNo} className="flex items-center gap-3 px-5 py-3">
                  <Icon name={t.taskStatus === 'DONE' ? 'check_circle' : t.taskStatus === 'CANCELLED' ? 'cancel' : 'pending'} fill={t.taskStatus === 'DONE'}
                    className={t.taskStatus === 'DONE' ? 'text-success' : t.taskStatus === 'CANCELLED' ? 'text-danger' : 'text-slate-400'} />
                  <p className="flex-1 text-body-md">{t.description} {t.additional && <span className="ml-1 rounded-full bg-orange-light px-2 py-0.5 text-label-sm text-orange-dark">Extra</span>}</p>
                  <StatusBadge status={t.taskStatus} />
                </li>
              ))}
              {!tasks.length && <li className="px-5 py-6 text-center text-slate-500">No work recorded yet.</li>}
            </ul>
          </Card>
          {job.status === 'COLLECTED' && <FeedbackForm jobCardId={job.id} registrationNo={job.registrationNo} />}
        </div>
        <Card title="Stage history" icon="history">
          <ol className="relative space-y-4 border-l-2 border-beige-border pl-5">
            {history.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-orange" />
                <p className="text-label-lg text-navy">{h.label}</p>
                <p className="text-body-sm text-slate-500">{dateTime(h.changedAt)}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
