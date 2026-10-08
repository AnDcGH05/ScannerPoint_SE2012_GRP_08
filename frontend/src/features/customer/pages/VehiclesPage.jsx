import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../../../api/client'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import Modal from '../../../components/Modal'
import PageHeader from '../../../components/PageHeader'
import Plate from '../../../components/Plate'
import { EmptyState, ErrorBanner, Loading, Notice } from '../../../components/States'
import { useToast } from '../../../components/Toast'
import { date, label } from '../../../lib/format'
import useApi from '../../../lib/useApi'
import DocumentChip, { latestDocs } from '../components/DocumentChip.jsx'
import HistoryModal from '../components/HistoryModal.jsx'
import UploadDocumentModal from '../components/UploadDocumentModal.jsx'
import VehicleDrawer from '../components/VehicleDrawer.jsx'

const FUEL_ICONS = { PETROL: 'local_gas_station', DIESEL: 'oil_barrel', HYBRID: 'electric_bolt', ELECTRIC: 'ev_station' }

/** My vehicles and add vehicle (Stitch A3). */
export default function VehiclesPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const vehicles = useApi('/api/vehicles')
  const [drawer, setDrawer] = useState(null)
  const [history, setHistory] = useState(null)
  const [upload, setUpload] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)

  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`/api/vehicles/${removing.id}`)
      toast.success(`${removing.registrationNo} removed`)
      setRemoving(null)
      vehicles.reload()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const list = vehicles.data || []
  const actionNeeded = list.filter((v) => {
    const d = latestDocs(v.documents)
    return !d.DRIVING_LICENCE || !d.INSURANCE || [d.DRIVING_LICENCE, d.INSURANCE].some((x) => x?.status === 'REJECTED' || x?.expiringSoon)
  }).length

  return (
    <>
      <PageHeader eyebrow="My garage" title="My vehicles" subtitle="Your vehicles, their service history and the documents the receptionist checks at drop-off."
        actions={<Button icon="add_circle" onClick={() => setDrawer({})}>Add vehicle</Button>} />
      {actionNeeded > 0 && <Notice tone="warning" className="mb-6">{actionNeeded} vehicle(s) need a document uploaded or renewed before the next check-in.</Notice>}
      {vehicles.loading ? <Loading /> : vehicles.error ? <ErrorBanner error={vehicles.error} /> : !list.length ? (
        <div className="card"><EmptyState icon="directions_car" title="No vehicles yet" text="Add your vehicle to book a service." action={<Button icon="add_circle" onClick={() => setDrawer({})}>Add vehicle</Button>} /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {list.map((v) => {
            const docs = latestDocs(v.documents)
            return (
              <article key={v.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Plate value={v.registrationNo} size="lg" />
                    <h2 className="mt-2 text-headline-md text-navy">{v.make} {v.model}</h2>
                    <p className="text-body-md text-slate-500">{v.manufactureYear} · {label(v.fuelType)}</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-card bg-beige text-beige-text"><Icon name={FUEL_ICONS[v.fuelType]} /></span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 rounded-card bg-page p-4 text-body-md">
                  <div><dt className="text-label-sm uppercase tracking-wider text-slate-500">Mileage</dt><dd className="font-semibold text-navy num">{v.currentMileage.toLocaleString()} km</dd></div>
                  <div><dt className="text-label-sm uppercase tracking-wider text-slate-500">Last service</dt><dd className="font-semibold text-navy">{v.lastServiceDate ? date(v.lastServiceDate) : 'Not recorded'}</dd></div>
                </dl>
                <p className="mb-2 mt-4 text-label-sm uppercase tracking-wider text-slate-500">Documents</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <DocumentChip type="DRIVING_LICENCE" doc={docs.DRIVING_LICENCE} />
                  <DocumentChip type="INSURANCE" doc={docs.INSURANCE} />
                </div>
                {[docs.DRIVING_LICENCE, docs.INSURANCE].filter((d) => d?.status === 'REJECTED').map((d) => (
                  <p key={d.id} className="mt-2 text-body-sm text-danger">Rejected: {d.rejectReason}</p>
                ))}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button size="sm" variant="outline" icon="edit" onClick={() => setDrawer({ vehicle: v })}>Edit</Button>
                  <Button size="sm" variant="outline" icon="upload_file" onClick={() => setUpload(v)}>Upload document</Button>
                  <Button size="sm" variant="outline" icon="history" onClick={() => setHistory(v)}>View history</Button>
                  <Button size="sm" variant="ghost" icon="calendar_add_on" onClick={() => navigate(`/app/book?vehicleId=${v.id}`)}>Book</Button>
                  <span title={v.hasServiceHistory ? 'Vehicles with service history cannot be removed' : ''} className="ml-auto">
                    <Button size="sm" variant="danger-outline" icon="delete" disabled={v.hasServiceHistory} onClick={() => setRemoving(v)}>Remove</Button>
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      )}
      <VehicleDrawer open={!!drawer} vehicle={drawer?.vehicle} onClose={() => setDrawer(null)} onSaved={vehicles.reload} />
      <HistoryModal vehicle={history} onClose={() => setHistory(null)} />
      <UploadDocumentModal vehicle={upload} onClose={() => setUpload(null)} onDone={vehicles.reload} />
      <Modal open={!!removing} onClose={() => setRemoving(null)} title="Remove vehicle?" icon="warning" tone="danger"
        footer={<><Button variant="outline" onClick={() => setRemoving(null)}>Keep</Button><Button variant="danger" loading={busy} onClick={remove}>Remove</Button></>}>
        Remove {removing?.registrationNo} and its uploaded documents from your account?
      </Modal>
    </>
  )
}
