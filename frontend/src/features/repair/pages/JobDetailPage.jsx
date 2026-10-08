import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { errorMessage } from '../../../api/client'
import { useAuth } from '../../../auth/AuthContext'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import Field from '../../../components/Field'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import Plate from '../../../components/Plate'
import { EmptyState, ErrorBanner, Loading, Notice } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { useToast } from '../../../components/Toast'
import { dateTime, label, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import RequestPartDialog from '../../inventory/components/RequestPartDialog'
import WorkflowTracker from '../components/WorkflowTracker'
import { STAGE_LABELS } from '../components/stages'

/** Next-stage buttons for each stage (the State pattern rules are checked again by the backend). */
const NEXT = {
  DIAGNOSIS: [
    { to: 'AWAITING_APPROVAL', label: 'Send for approval', icon: 'send', variant: 'outline' },
    { to: 'IN_PROGRESS', label: 'Start repair', icon: 'build' },
  ],
  AWAITING_APPROVAL: [{ to: 'IN_PROGRESS', label: 'Start repair', icon: 'build' }],
  IN_PROGRESS: [{ to: 'QUALITY_CHECK', label: 'Move to quality check', icon: 'fact_check' }],
  QUALITY_CHECK: [
    { to: 'IN_PROGRESS', label: 'Quality check failed – back to repair', icon: 'undo', variant: 'danger-outline' },
    { to: 'READY', label: 'Mark ready', icon: 'task_alt', askTime: true },
  ],
}

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']

/** Mechanic job page (Stitch S4); the receptionist and admin see it too. */
export default function JobDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const detail = useApi(`/api/jobcards/${id}`)
  const parts = useApi(`/api/part-requests?jobCardId=${id}`)
  const [insp, setInsp] = useState({ findings: '', diagnosis: '', recommendedAction: '' })
  const [task, setTask] = useState({ description: '', labourHours: '', additional: false })
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const [requesting, setRequesting] = useState(false)
  const [readyAsk, setReadyAsk] = useState(false)
  const [readyAt, setReadyAt] = useState('')
  const [wf, setWf] = useState(0)

  useEffect(() => {
    const i = detail.data?.inspection
    if (i) setInsp({ findings: i.findings || '', diagnosis: i.diagnosis || '', recommendedAction: i.recommendedAction || '' })
  }, [detail.data?.inspection])

  if (detail.loading) return <Loading />
  if (detail.error) return <ErrorBanner error={detail.error} />
  const { job, tasks, history, problemDescription } = detail.data
  const isMine = user.role === 'ADMIN' || (user.role === 'MECHANIC' && job.mechanicId === user.id)
  const closed = job.status === 'READY' || job.status === 'COLLECTED'
  const canInspect = isMine && (job.status === 'INSPECTION' || job.status === 'DIAGNOSIS')

  const run = async (key, fn, msg) => {
    setBusy(key)
    setError(null)
    try {
      await fn()
      if (msg) toast.success(msg)
      detail.reload()
      parts.reload()
      setWf((n) => n + 1)
      return true
    } catch (e) {
      setError(errorMessage(e))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return false
    } finally {
      setBusy(null)
    }
  }

  const move = (to, estimatedCompletion) => run(to, () => api.patch(`/api/jobcards/${id}/stage`, { status: to, estimatedCompletion }), `Moved to ${STAGE_LABELS[to]}`)

  return (
    <div className="space-y-6">
      <Link to={user.role === 'MECHANIC' ? '/staff/my-jobs' : '/staff/jobs'} className="flex items-center gap-1 text-label-lg text-navy hover:text-orange">
        <Icon name="arrow_back" /> {user.role === 'MECHANIC' ? 'My jobs' : 'Job board'}
      </Link>

      <header className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-body-sm text-slate-400">Job card #{job.id} · checked in {dateTime(job.checkInAt)} at {job.checkInMileage.toLocaleString()} km</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Plate value={job.registrationNo} size="lg" />
            <h1 className="text-headline-lg text-navy">{job.vehicleName.split('–')[1]}</h1>
          </div>
          <p className="mt-1 text-body-md text-slate-600">{job.customerName} · {job.packageName} · Mechanic: <b>{job.mechanicName}</b></p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <StatusBadge status={job.status} text={STAGE_LABELS[job.status]} />
          <p className="text-body-sm text-slate-500">Collect: {dateTime(job.estimatedCompletion)}</p>
        </div>
      </header>

      <ErrorBanner error={error} />
      {!isMine && user.role === 'MECHANIC' && <Notice tone="info">This job is assigned to {job.mechanicName}. You can view it but not change it.</Notice>}

      <Card title="Workflow" icon="timeline"><WorkflowTracker key={wf} jobCardId={job.id} /></Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="1 · Inspection" icon="search" subtitle={problemDescription ? `Customer said: “${problemDescription}”` : undefined}>
            <div className="space-y-4">
              <Field label="Findings" required>
                <textarea className="input" rows={3} maxLength={255} disabled={!canInspect} value={insp.findings} onChange={(e) => setInsp({ ...insp, findings: e.target.value })}
                  placeholder="What you found when inspecting the vehicle" />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Diagnosis"><textarea className="input" rows={2} maxLength={255} disabled={!canInspect} value={insp.diagnosis} onChange={(e) => setInsp({ ...insp, diagnosis: e.target.value })} /></Field>
                <Field label="Recommended action"><textarea className="input" rows={2} maxLength={255} disabled={!canInspect} value={insp.recommendedAction} onChange={(e) => setInsp({ ...insp, recommendedAction: e.target.value })} /></Field>
              </div>
              {canInspect && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-body-sm text-slate-500">{job.status === 'INSPECTION' ? 'Saving moves the job to Diagnosis.' : detail.data.inspection ? `Saved ${dateTime(detail.data.inspection.inspectedAt)}` : ''}</p>
                  <Button icon="save" loading={busy === 'insp'} disabled={!insp.findings.trim()}
                    onClick={() => run('insp', () => api.put(`/api/jobcards/${id}/inspection`, insp), 'Inspection saved')}>Save inspection</Button>
                </div>
              )}
            </div>
          </Card>

          <Card title="2 · Repair tasks" icon="checklist" bodyClassName="p-0">
            {!tasks.length ? <EmptyState icon="checklist" title="No tasks yet" text="Add the package work and any extra work found during diagnosis." /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="table-head"><tr><th>#</th><th>Task</th><th className="!text-right">Hours</th><th>Type</th><th>Approval</th><th>Status</th><th /></tr></thead>
                  <tbody className="table-body">
                    {tasks.map((t) => (
                      <tr key={t.taskNo}>
                        <td className="num">{String(t.taskNo).padStart(2, '0')}</td>
                        <td className="text-navy">{t.description}{t.additional && t.estimatedCost && <p className="text-body-sm text-slate-500 num">Est. {money(t.estimatedCost)}</p>}</td>
                        <td className="text-right num">{Number(t.labourHours)}</td>
                        <td>{t.additional ? <span className="rounded-full bg-orange-light px-2 py-0.5 text-label-sm text-orange-dark">Extra work</span> : <span className="text-body-sm text-slate-500">Package</span>}</td>
                        <td><StatusBadge status={t.approvalStatus} /></td>
                        <td>
                          {isMine && !closed ? (
                            <select className="input h-8 w-36 text-body-sm" value={t.taskStatus}
                              onChange={(e) => run(`t${t.taskNo}`, () => api.put(`/api/jobcards/${id}/tasks/${t.taskNo}`, { description: t.description, labourHours: t.labourHours, taskStatus: e.target.value }), 'Task updated')}>
                              {TASK_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                            </select>
                          ) : <StatusBadge status={t.taskStatus} />}
                        </td>
                        <td className="text-right">
                          {isMine && !closed && t.taskStatus === 'PENDING' && (
                            <button type="button" title="Delete task" className="rounded p-1 text-danger hover:bg-danger-bg"
                              onClick={() => run(`d${t.taskNo}`, () => api.delete(`/api/jobcards/${id}/tasks/${t.taskNo}`), 'Task deleted')}><Icon name="delete" /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {isMine && !closed && (
              <div className="grid gap-3 border-t border-line bg-page p-4 md:grid-cols-12 md:items-end">
                <Field label="New task" className="md:col-span-6"><input className="input" maxLength={150} value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} placeholder="e.g. Replace front brake pads" /></Field>
                <Field label="Hours" className="md:col-span-2"><input className="input num" type="number" min="0.1" step="0.1" value={task.labourHours} onChange={(e) => setTask({ ...task, labourHours: e.target.value })} /></Field>
                <label className="flex h-10 items-center gap-2 text-body-sm md:col-span-2">
                  <input type="checkbox" className="h-4 w-4 accent-orange" checked={task.additional} onChange={(e) => setTask({ ...task, additional: e.target.checked })} /> Extra work (needs approval)
                </label>
                <Button className="md:col-span-2" icon="add" loading={busy === 'task'} disabled={!task.description.trim() || !task.labourHours}
                  onClick={() => run('task', () => api.post(`/api/jobcards/${id}/tasks`, task), 'Task added').then((ok) => ok && setTask({ description: '', labourHours: '', additional: false }))}>Add task</Button>
              </div>
            )}
          </Card>

          <Card title="3 · Parts" icon="inventory_2" bodyClassName="p-0"
            actions={isMine && !closed && <Button size="sm" variant="outline" icon="add" onClick={() => setRequesting(true)}>Request part</Button>}>
            {!parts.data?.length ? <EmptyState icon="inventory_2" title="No parts requested" /> : (
              <ul className="divide-y divide-line">
                {parts.data.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-label-lg text-navy">{p.partName} × {p.quantity}</p>
                      <p className="text-body-sm text-slate-500">{p.partCode} · requested {dateTime(p.requestedAt)}{p.rejectReason ? ` · ${p.rejectReason}` : ''}</p>
                    </div>
                    <StatusBadge status={p.status} />
                    {isMine && p.status === 'PENDING' && (
                      <button type="button" title="Withdraw request" className="rounded p-1 text-danger hover:bg-danger-bg"
                        onClick={() => run(`p${p.id}`, () => api.delete(`/api/part-requests/${p.id}`), 'Request withdrawn')}><Icon name="undo" /></button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {isMine && NEXT[job.status] && (
            <Card title="Next stage" icon="double_arrow">
              <div className="flex flex-col gap-2">
                {NEXT[job.status].map((n) => (
                  <Button key={n.to} variant={n.variant || 'primary'} icon={n.icon} loading={busy === n.to} size="lg"
                    onClick={() => (n.askTime ? (setReadyAt(job.estimatedCompletion?.slice(0, 16) || ''), setReadyAsk(true)) : move(n.to))}>{n.label}</Button>
                ))}
              </div>
              {job.pendingApprovals > 0 && <p className="mt-3 text-body-sm text-warning">{job.pendingApprovals} extra task(s) still waiting for the customer.</p>}
            </Card>
          )}
          <Card title="Stage history" icon="history">
            <ol className="relative space-y-4 border-l-2 border-beige-border pl-5">
              {history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-orange" />
                  <p className="text-label-lg text-navy">{h.label}</p>
                  <p className="text-body-sm text-slate-500">{dateTime(h.changedAt)}{h.changedByName ? ` · ${h.changedByName}` : ''}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <RequestPartDialog open={requesting} onClose={() => setRequesting(false)} jobCardId={job.id} onRequested={parts.reload} />
      <Modal open={readyAsk} onClose={() => setReadyAsk(false)} title="Mark vehicle ready" icon="task_alt"
        footer={<><Button variant="outline" onClick={() => setReadyAsk(false)}>Cancel</Button>
          <Button icon="task_alt" loading={busy === 'READY'} onClick={() => { setReadyAsk(false); move('READY', readyAt ? `${readyAt}:00` : null) }}>Mark ready</Button></>}>
        <p className="mb-4 text-body-md text-slate-600">The customer gets a “vehicle ready” message. Confirm when they can collect it.</p>
        <Field label="Collection time"><input className="input" type="datetime-local" value={readyAt} onChange={(e) => setReadyAt(e.target.value)} /></Field>
      </Modal>
    </div>
  )
}
