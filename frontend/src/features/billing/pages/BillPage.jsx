import { Link, useParams } from 'react-router-dom'
import Button from '../../../components/Button'
import Icon from '../../../components/Icon'
import { ErrorBanner, Loading, Notice } from '../../../components/States'
import useApi from '../../../lib/useApi'
import BillDocument from '../components/BillDocument'
import PaymentPanel from '../components/PaymentPanel'

/** Customer view of one bill, with "Pay balance". */
export default function BillPage() {
  const { id } = useParams()
  const bill = useApi(`/api/invoices/${id}`)
  if (bill.loading) return <Loading />
  if (bill.error) return <ErrorBanner error={bill.error} />
  const b = bill.data
  const due = Number(b.balanceDue) > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <Link to="/app/bills" className="flex items-center gap-1 text-label-lg text-navy hover:text-orange"><Icon name="arrow_back" /> Bills & Payments</Link>
        <Button variant="outline" icon="print" onClick={() => window.print()}>Print</Button>
      </div>
      <BillDocument bill={b} />
      <div className="no-print">
        {due ? (
          <>
            <h2 className="mb-3 text-headline-md text-navy">Pay balance</h2>
            <PaymentPanel type="FINAL" targetId={b.id} amount={b.balanceDue} reference={b.invoiceNo} onChanged={bill.reload} />
          </>
        ) : (
          <Notice tone="success" icon="verified">This bill is fully paid. Thank you!</Notice>
        )}
      </div>
    </div>
  )
}
