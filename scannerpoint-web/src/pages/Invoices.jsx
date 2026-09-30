import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useResource } from '../api/useResource';
import { Plus, Trash } from '../components/ui/icons';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import FormFooter from '../components/ui/FormFooter';
import { dateTime, money } from '../components/ui/format';
import Input from '../components/ui/Input';
import Notice from '../components/ui/Notice';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import * as sample from '../data/sample';

const METHODS = ['CASH', 'CARD', 'TRANSFER'];
const newItem = () => ({ key: crypto.randomUUID(), description: '', amount: '' });

function PayForm({ invoice, onPaid }) {
    const action = useAction();
    const [amount, setAmount] = useState(String(invoice.totalAmount ?? ''));
    const [method, setMethod] = useState('CASH');

    const submit = async (e) => {
        e.preventDefault();
        const res = await action.run(() => API.post('/payments', { invoiceId: invoice.id, amount: Number(amount), paymentMethod: method }));
        if (res) onPaid(res.data);
    };

    return (
        <form className="pay-row" onSubmit={submit}>
            <input className="input tnum" type="number" min="0.01" step="0.01" value={amount} required
                   aria-label={`Payment amount for invoice ${invoice.id}`} onChange={(e) => setAmount(e.target.value)} />
            <select className="input" value={method} aria-label="Payment method" onChange={(e) => setMethod(e.target.value)}>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <Button type="submit" variant="dark" size="sm" disabled={action.busy}>{action.busy ? 'Saving…' : 'Record payment'}</Button>
            {action.error && <span className="field-error" role="alert">{action.error}</span>}
        </form>
    );
}

export default function Invoices() {
    const customers = useResource('/customers', sample.customers);
    const jobCards = useResource('/repairs/job-cards', sample.jobCards);
    const [customerId, setCustomerId] = useState('');
    // The backend lists invoices per customer
    const invoices = useResource(customerId ? `/invoices/customer/${customerId}` : null,
        sample.invoices.filter((i) => String(i.customerId) === customerId));
    const create = useAction();
    const [jobCardId, setJobCardId] = useState('');
    const [items, setItems] = useState([newItem()]);
    const [paid, setPaid] = useState('');

    const setItem = (key, field, value) => setItems(items.map((it) => (it.key === key ? { ...it, [field]: value } : it)));
    const total = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await create.run(() => API.post('/invoices', {
            customerId: Number(customerId),
            jobCardId: jobCardId ? Number(jobCardId) : null,
            items: items.map((it) => ({ description: it.description.trim(), amount: Number(it.amount) })),
        }), (r) => `Invoice #${r.data.id} created for ${money(r.data.totalAmount)}.`);
        if (res) { invoices.setData((list) => [...list, res.data]); setItems([newItem()]); setJobCardId(''); }
    };

    const onPaid = (payment) => {
        setPaid(`Payment of ${money(payment.amount)} recorded against invoice #${payment.invoiceId}.`);
        invoices.reload();
    };

    const cardNumber = (id) => jobCards.data.find((j) => j.id === id)?.cardNumber || (id ? `#${id}` : '—');
    const rows = [...invoices.data].sort((a, b) => b.id - a.id);
    const columns = [
        { key: 'id', label: 'Invoice', className: 'mono strong', render: (i) => `#${i.id}` },
        { key: 'createdAt', label: 'Created', className: 'tnum', render: (i) => dateTime(i.createdAt) },
        { key: 'jobCardId', label: 'Job card', className: 'mono', render: (i) => cardNumber(i.jobCardId) },
        { key: 'totalAmount', label: 'Total', num: true, render: (i) => money(i.totalAmount) },
        { key: 'status', label: 'Status', render: (i) => <Badge>{i.status}</Badge> },
        { key: 'pay', label: 'Payment', render: (i) => (i.status === 'PAID' ? <span className="muted small">Settled</span> : <PayForm key={i.status} invoice={i} onPaid={onPaid} />) },
    ];

    return (
        <>
            <PageHeader eyebrow="Billing · Invoices" title="Invoices & payments" description="Choose a customer to bill them and record their payments.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Card>
                    <Input label="Customer" as="select" value={customerId} error={customers.error}
                           onChange={(e) => { setCustomerId(e.target.value); create.clear(); setPaid(''); }}>
                        <option value="">{customers.loading ? 'Loading customers…' : 'Select a customer…'}</option>
                        {customers.data.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                    </Input>
                </Card>

                {customerId && (
                    <>
                        <Card title="Create invoice" aside={<span className="strong tnum">Total {money(total)}</span>}>
                            <form className="form-grid" onSubmit={handleSubmit}>
                                <Input className="span-2" label="Job card" labelAside={<small>Optional</small>} as="select" value={jobCardId} onChange={(e) => setJobCardId(e.target.value)}>
                                    <option value="">Not linked to a job card</option>
                                    {jobCards.data.map((j) => <option key={j.id} value={j.id}>{j.cardNumber} — {j.licensePlate}</option>)}
                                </Input>
                                <div className="span-2 line-items">
                                    {items.map((it, index) => (
                                        <div className="line-item" key={it.key}>
                                            <Input label={`Item ${index + 1}`} value={it.description} placeholder="e.g. Labour — brake service" required
                                                   onChange={(e) => setItem(it.key, 'description', e.target.value)} />
                                            <Input label="Amount (Rs.)" type="number" min="0" step="0.01" value={it.amount} required
                                                   onChange={(e) => setItem(it.key, 'amount', e.target.value)} />
                                            <Button variant="ghost" aria-label={`Remove item ${index + 1}`} disabled={items.length === 1}
                                                    style={{ padding: 0, minHeight: 48 }} onClick={() => setItems(items.filter((x) => x.key !== it.key))}>
                                                <Trash aria-hidden="true" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div><Button variant="secondary" size="sm" onClick={() => setItems([...items, newItem()])}><Plus aria-hidden="true" />Add item</Button></div>
                                </div>
                                <FormFooter action={create} label="Create invoice" busyLabel="Creating…" />
                            </form>
                        </Card>

                        <Notice type="success">{paid}</Notice>
                        <Card flush title={`Invoices (${rows.length})`}>
                            <DataTable columns={columns} rows={rows} source={invoices} empty="This customer has no invoices yet." />
                        </Card>
                    </>
                )}
            </div>
        </>
    );
}
