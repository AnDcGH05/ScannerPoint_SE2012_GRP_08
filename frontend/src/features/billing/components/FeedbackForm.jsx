import { useEffect, useState } from 'react'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import { ErrorBanner, Loading } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { dateTime } from '../../../lib/format'

const WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

export function Stars({ value, onChange, size = 36 }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} onMouseEnter={() => onChange && setHover(n)}
          className="disabled:cursor-default" aria-label={`${n} star`}>
          <Icon name="star" fill={(hover || value) >= n} size={size} className={(hover || value) >= n ? 'text-orange' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  )
}

/** "How was your service for WP-CAB-4521?" (Stitch W5). Shown on a collected job. */
export default function FeedbackForm({ jobCardId, registrationNo }) {
  const toast = useToast()
  const [existing, setExisting] = useState(undefined)
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    api.get(`/api/jobcards/${jobCardId}/feedback`)
      .then((r) => { setExisting(r.data); setRating(r.data.rating); setComments(r.data.comments || '') })
      .catch(() => setExisting(null))
  }, [jobCardId])

  const save = async () => {
    if (!rating) return setError('Tap the stars to choose a rating')
    setBusy(true)
    setError(null)
    try {
      const body = { rating, comments }
      const res = existing
        ? await api.put(`/api/jobcards/${jobCardId}/feedback`, body)
        : await api.post(`/api/jobcards/${jobCardId}/feedback`, body)
      setExisting(res.data)
      setEditing(false)
      toast.success('Thank you for your feedback!')
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`/api/jobcards/${jobCardId}/feedback`)
      setExisting(null)
      setRating(0)
      setComments('')
      setConfirmDelete(false)
      toast.success('Feedback deleted')
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (existing === undefined) return <div className="card"><Loading /></div>

  return (
    <section className="card p-6">
      <div className="mb-1 flex items-center gap-2 text-orange"><Icon name="reviews" /><span className="text-label-sm uppercase tracking-widest">Your feedback</span></div>
      <h2 className="text-headline-md text-navy">How was your service for {registrationNo}?</h2>

      {existing && !editing ? (
        <div className="mt-4">
          <Stars value={existing.rating} size={28} />
          <p className="mt-2 text-body-md text-slate-600">{existing.comments || 'No comment'}</p>
          <p className="mt-1 text-body-sm text-slate-400">Submitted {dateTime(existing.submittedAt)}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" icon="edit" onClick={() => setEditing(true)}>Edit feedback</Button>
            <Button variant="danger-outline" icon="delete" onClick={() => setConfirmDelete(true)}>Delete</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Stars value={rating} onChange={setRating} />
            <span className="text-label-lg text-navy">{WORDS[rating]}</span>
          </div>
          <textarea className="input" rows={3} maxLength={255} value={comments} onChange={(e) => setComments(e.target.value)}
            placeholder="Tell us about the work, the communication and how your vehicle feels now (optional)" />
          <ErrorBanner error={error} />
          <div className="flex gap-2">
            <Button icon="send" loading={busy} onClick={save}>{existing ? 'Update feedback' : 'Submit'}</Button>
            {editing && <Button variant="outline" onClick={() => { setEditing(false); setRating(existing.rating); setComments(existing.comments || '') }}>Cancel</Button>}
          </div>
        </div>
      )}

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your feedback?" icon="warning" tone="danger"
        footer={<><Button variant="outline" onClick={() => setConfirmDelete(false)}>Keep feedback</Button>
          <Button variant="danger" loading={busy} onClick={remove}>Yes, delete</Button></>}>
        This removes your rating and comment for this job.
      </Modal>
    </section>
  )
}
