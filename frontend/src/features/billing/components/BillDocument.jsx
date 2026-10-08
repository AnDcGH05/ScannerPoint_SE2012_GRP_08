import Icon from '../../../components/Icon'
import StatusBadge from '../../../components/StatusBadge'
import { date, label, money } from '../../../lib/format'

const TYPE_COLOURS = {
  PACKAGE: 'bg-blue-50 text-navy',
  DIAGNOSTIC_FEE: 'bg-beige text-beige-text',
  LABOUR: 'bg-orange-light text-orange-dark',
  PART: 'bg-slate-100 text-slate-700',
}

/** The printable itemised bill (Stitch W3). onRemoveLine is only passed on the receptionist's draft. */
export default function BillDocument({ bill, onRemoveLine }) {
  const rows = [
    ['Subtotal', bill.subtotal],
    ['Discount', bill.discount > 0 ? -bill.discount : 0],
    [`Tax (${Number(bill.taxRate)}%)`, bill.taxAmount],
    ['Total', bill.total, true],
    ['Less deposit paid', -bill.depositPaid],
    ['Less payments verified', -bill.amountPaid],
  ]
  return (
    <article className="card overflow-hidden">
      <header className="flex flex-col gap-4 border-b-4 border-orange bg-navy px-6 py-6 text-white sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-card bg-white/10 text-orange"><Icon name="build_circle" fill size={30} /></span>
          <div>
            <p className="text-headline-md">ScannerPoint</p>
            <p className="text-body-sm text-on-primary-container">Smart Diagnostics. Smarter Repairs. · Kurunegala</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-label-sm uppercase tracking-widest text-on-primary-container">Invoice</p>
          <p className="text-headline-lg num">{bill.invoiceNo}</p>
          <div className="mt-1"><StatusBadge status={bill.status} /></div>
        </div>
      </header>

      <div className="grid gap-4 border-b border-line px-6 py-5 sm:grid-cols-3">
        <div>
          <p className="text-label-sm uppercase tracking-wider text-slate-500">Customer</p>
          <p className="text-label-lg text-navy">{bill.customerName}</p>
        </div>
        <div>
          <p className="text-label-sm uppercase tracking-wider text-slate-500">Vehicle</p>
          <p className="text-label-lg text-navy">{bill.vehicleName}</p>
          <p className="text-body-sm text-slate-500">{bill.packageName} · Job #{bill.jobCardId}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-label-sm uppercase tracking-wider text-slate-500">Invoice date</p>
          <p className="text-label-lg text-navy">{date(bill.invoiceDate)}</p>
          {bill.warrantyUntil && <p className="text-body-sm text-success">Warranty until {date(bill.warrantyUntil)}</p>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="table-head">
            <tr><th>Type</th><th>Description</th><th className="!text-right">Qty / hrs</th><th className="!text-right">Unit price</th><th className="!text-right">Amount</th>{onRemoveLine && <th />}</tr>
          </thead>
          <tbody className="table-body">
            {bill.lines.map((l) => (
              <tr key={l.lineNo}>
                <td><span className={`rounded-full px-2.5 py-1 text-label-sm ${TYPE_COLOURS[l.itemType]}`}>{label(l.itemType)}</span></td>
                <td className="text-navy">{l.description}</td>
                <td className="text-right num">{Number(l.quantity)}</td>
                <td className="text-right num">{money(l.unitPrice)}</td>
                <td className="text-right font-semibold num">{money(l.lineAmount)}</td>
                {onRemoveLine && (
                  <td className="w-10 text-right no-print">
                    <button type="button" onClick={() => onRemoveLine(l.lineNo)} className="rounded p-1 text-danger hover:bg-danger-bg" title="Remove line">
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-line px-6 py-5">
        <dl className="w-full max-w-sm space-y-1.5">
          {rows.map(([k, v, strong]) => (
            <div key={k} className={`flex justify-between ${strong ? 'border-t border-line pt-2 text-label-lg text-navy' : 'text-body-md text-slate-600'}`}>
              <dt>{k}</dt><dd className="num">{money(v)}</dd>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between rounded-control bg-navy px-4 py-3 text-white">
            <dt className="text-label-lg">Balance due</dt>
            <dd className="text-headline-md num">{money(bill.balanceDue)}</dd>
          </div>
        </dl>
      </div>
      <footer className="border-t border-line bg-page px-6 py-3 text-body-sm text-slate-500">
        Issued by {bill.issuedByName}. Payments by bank transfer to ScannerPoint (HNB, Kurunegala) quoting {bill.invoiceNo}.
      </footer>
    </article>
  )
}
