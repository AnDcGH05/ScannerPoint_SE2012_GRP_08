import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useResource } from '../api/useResource';
import { can } from '../components/layout/nav';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import { dateTime } from '../components/ui/format';
import Input from '../components/ui/Input';
import Notice from '../components/ui/Notice';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import { useAuth } from '../context/AuthContext';
import * as sample from '../data/sample';

const COLUMNS = [
    { key: 'transactionDate', label: 'When', className: 'tnum', render: (t) => dateTime(t.transactionDate) },
    { key: 'partName', label: 'Part', className: 'strong' },
    { key: 'transactionType', label: 'Type', render: (t) => <Badge>{t.transactionType}</Badge> },
    { key: 'quantity', label: 'Quantity', num: true },
    { key: 'notes', label: 'Notes' },
];

function PartOptions({ parts }) {
    return (
        <>
            <option value="">{parts.loading ? 'Loading parts…' : 'Select a part…'}</option>
            {parts.data.map((p) => <option key={p.id} value={p.id}>{p.partNumber} — {p.name} ({p.quantityInStock} in stock)</option>)}
        </>
    );
}

export default function Stock() {
    const { user } = useAuth();
    const has = (p) => can(user.role, p);
    const parts = useResource('/spare-parts', sample.spareParts);
    const history = useResource(has('stock.history') ? '/inventory/transactions' : null, sample.transactions);
    // Storekeepers cannot list job cards, so they type the job card ID instead of picking it
    const jobCards = useResource(has('jobcards.read') ? '/repairs/job-cards' : null, sample.jobCards);
    const restock = useAction();
    const dispense = useAction();
    const [inForm, setInForm] = useState({ partId: '', quantity: '', notes: '' });
    const [outForm, setOutForm] = useState({ jobCardId: '', partId: '', quantity: '' });

    const refresh = () => { parts.reload(); history.reload(); };

    // Both inventory endpoints take request parameters, not a JSON body
    const handleRestock = async (e) => {
        e.preventDefault();
        const res = await restock.run(() => API.post('/inventory/restock', null, {
            params: { partId: Number(inForm.partId), quantity: Number(inForm.quantity), notes: inForm.notes.trim() || undefined },
        }), (r) => `Restocked ${r.data.quantity} × ${r.data.partName}.`);
        if (res) { refresh(); setInForm({ partId: '', quantity: '', notes: '' }); }
    };

    const handleDispense = async (e) => {
        e.preventDefault();
        const res = await dispense.run(() => API.post('/inventory/dispense', null, {
            params: { jobCardId: Number(outForm.jobCardId), partId: Number(outForm.partId), quantity: Number(outForm.quantity) },
        }), (r) => (typeof r.data === 'string' ? r.data : 'Part dispensed.'));
        if (res) { refresh(); setOutForm({ jobCardId: '', partId: '', quantity: '' }); }
    };

    return (
        <>
            <PageHeader eyebrow="Inventory · Stock movements" title="Stock movements" description="Receive stock from suppliers and issue parts to job cards.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Notice>{parts.error}</Notice>
                <div className="grid-2">
                    {has('stock.restock') && (
                        <Card title="Restock a part" subtitle="Adds to the quantity in stock">
                            <form className="stack" onSubmit={handleRestock}>
                                <Input label="Part" as="select" value={inForm.partId} required onChange={(e) => setInForm({ ...inForm, partId: e.target.value })}><PartOptions parts={parts} /></Input>
                                <Input label="Quantity received" type="number" min="1" step="1" value={inForm.quantity} required onChange={(e) => setInForm({ ...inForm, quantity: e.target.value })} />
                                <Input label="Notes" labelAside={<small>Optional</small>} value={inForm.notes} onChange={(e) => setInForm({ ...inForm, notes: e.target.value })} />
                                <Notice>{restock.error}</Notice>
                                <Notice type="success">{restock.success}</Notice>
                                <div><Button type="submit" disabled={restock.busy}>{restock.busy ? 'Saving…' : 'Restock part'}</Button></div>
                            </form>
                        </Card>
                    )}
                    {has('stock.dispense') && (
                        <Card title="Dispense to a job card" subtitle="Takes parts out of stock for a repair">
                            <form className="stack" onSubmit={handleDispense}>
                                {has('jobcards.read') ? (
                                    <Input label="Job card" as="select" value={outForm.jobCardId} required error={jobCards.error} onChange={(e) => setOutForm({ ...outForm, jobCardId: e.target.value })}>
                                        <option value="">Select a job card…</option>
                                        {jobCards.data.map((j) => <option key={j.id} value={j.id}>{j.cardNumber} — {j.licensePlate}</option>)}
                                    </Input>
                                ) : (
                                    <Input label="Job card ID" type="number" min="1" step="1" value={outForm.jobCardId} required onChange={(e) => setOutForm({ ...outForm, jobCardId: e.target.value })} />
                                )}
                                <Input label="Part" as="select" value={outForm.partId} required onChange={(e) => setOutForm({ ...outForm, partId: e.target.value })}><PartOptions parts={parts} /></Input>
                                <Input label="Quantity" type="number" min="1" step="1" value={outForm.quantity} required onChange={(e) => setOutForm({ ...outForm, quantity: e.target.value })} />
                                <Notice>{dispense.error}</Notice>
                                <Notice type="success">{dispense.success}</Notice>
                                <div><Button type="submit" variant={has('stock.restock') ? 'dark' : 'primary'} disabled={dispense.busy}>{dispense.busy ? 'Saving…' : 'Dispense part'}</Button></div>
                            </form>
                        </Card>
                    )}
                </div>
                {has('stock.history') && (
                    <Card flush title={`Transaction history (${history.data.length})`}>
                        <DataTable columns={COLUMNS} rows={history.data} source={history} rowKey="transactionId" empty="No stock movements yet." />
                    </Card>
                )}
            </div>
        </>
    );
}
