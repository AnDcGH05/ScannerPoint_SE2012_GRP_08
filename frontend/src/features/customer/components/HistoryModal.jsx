import { Link } from 'react-router-dom'
import Modal from '../../../components/Modal'
import { EmptyState, Loading } from '../../../components/States'
import StatusBadge from '../../../components/StatusBadge'
import { useAuth } from '../../../auth/AuthContext'
import { date, money } from '../../../lib/format'
import useApi from '../../../lib/useApi'

/** Digital service history of one vehicle (query 1.2). */
export default function HistoryModal({ vehicle, onClose }) {
  const { user } = useAuth()
  const history = useApi(vehicle ? `/api/vehicles/${vehicle.id}/history` : null)
  const base = user?.role === 'CUSTOMER' ? '/app/jobs' : '/staff/jobs'
  return (
    <Modal open={!!vehicle} onClose={onClose} title={`Service history – ${vehicle?.displayName || ''}`} icon="history" size="xl">
      {history.loading ? <Loading /> : !history.data?.length ? <EmptyState icon="history" title="No visits yet" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="table-head"><tr><th>Visit</th><th className="!text-right">Mileage</th><th>Package</th><th>Diagnosis</th><th className="!text-right">Tasks</th><th className="!text-right">Bill</th><th>Status</th></tr></thead>
            <tbody className="table-body">
              {history.data.map((h) => (
                <tr key={h.jobCardId}>
                  <td><Link to={`${base}/${h.jobCardId}`} className="font-semibold text-navy hover:text-orange" onClick={onClose}>{date(h.checkInAt)}</Link></td>
                  <td className="text-right num">{h.mileage.toLocaleString()} km</td>
                  <td>{h.packageName}</td>
                  <td>{h.diagnosis || '–'}</td>
                  <td className="text-right num">{h.tasksDone}</td>
                  <td className="text-right num">{money(h.invoiceTotal)}</td>
                  <td><StatusBadge status={h.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}
