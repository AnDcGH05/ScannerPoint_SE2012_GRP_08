import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useCustomerVehicles } from '../api/useCustomerVehicles';
import { useResource } from '../api/useResource';
import { can } from '../components/layout/nav';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import CustomerSelect from '../components/ui/CustomerSelect';
import DataTable from '../components/ui/DataTable';
import FormFooter from '../components/ui/FormFooter';
import { money } from '../components/ui/format';
import Input from '../components/ui/Input';
import Notice from '../components/ui/Notice';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import StatusSelect from '../components/ui/StatusSelect';
import { useAuth } from '../context/AuthContext';
import * as sample from '../data/sample';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];
const EMPTY = { vehicleId: '', mechanicId: '', description: '', estimatedCost: '' };

export default function JobCards() {
    const { user } = useAuth();
    const isAdmin = can(user.role, 'users');
    const canStatus = can(user.role, 'jobcards.status');
    const cards = useResource('/repairs/job-cards', sample.jobCards);
    // Only admins may list user accounts, so only admins can assign a mechanic here
    const users = useResource(isAdmin ? '/users' : null, sample.users);
    const mechanics = users.data.filter((u) => u.roles?.includes('ROLE_MECHANIC'));
    const picker = useCustomerVehicles();
    const create = useAction();
    const update = useAction();
    const [form, setForm] = useState(EMPTY);
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await create.run(() => API.post('/repairs/job-cards', {
            vehicleId: Number(form.vehicleId),
            mechanicId: form.mechanicId ? Number(form.mechanicId) : null,
            description: form.description.trim() || null,
            estimatedCost: form.estimatedCost === '' ? null : Number(form.estimatedCost),
        }), (r) => `Job card ${r.data.cardNumber} created.`);
        if (res) { cards.reload(); setForm(EMPTY); }
    };

    const changeStatus = async (card, status) => {
        const res = await update.run(() => API.patch(`/repairs/job-cards/${card.id}/status`, null, { params: { status } }));
        if (res) cards.setData((list) => list.map((c) => (c.id === card.id ? { ...c, status: res.data.status } : c)));
    };

    const columns = [
        { key: 'cardNumber', label: 'Card no.', className: 'mono strong' },
        { key: 'licensePlate', label: 'Vehicle', className: 'plate' },
        { key: 'mechanicName', label: 'Mechanic' },
        { key: 'totalCost', label: 'Total cost', num: true, render: (c) => money(c.totalCost) },
        { key: 'status', label: 'Status', render: (c) => <Badge>{c.status}</Badge> },
        ...(canStatus ? [{ key: 'change', label: 'Change status', render: (c) => <StatusSelect value={c.status} options={STATUSES} label={`Status for ${c.cardNumber}`} onChange={(s) => changeStatus(c, s)} /> }] : []),
    ];

    return (
        <>
            <PageHeader eyebrow="Workshop · Job cards" title="Job cards" description="Open a job card for a vehicle and track the repair through to completion.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Card title="Create job card">
                    <form className="form-grid" onSubmit={handleSubmit}>
                        <CustomerSelect picker={picker} vehicleId={form.vehicleId} onVehicle={(v) => setForm((f) => ({ ...f, vehicleId: v }))} />
                        <Input label="Work description" labelAside={<small>Optional</small>} value={form.description} onChange={set('description')} placeholder="e.g. Replace front brake pads" />
                        <Input label="Estimated cost (Rs.)" labelAside={<small>Optional</small>} type="number" min="0" step="0.01" value={form.estimatedCost} onChange={set('estimatedCost')} />
                        {isAdmin && (
                            <Input label="Assign mechanic" labelAside={<small>Optional</small>} as="select" value={form.mechanicId} onChange={set('mechanicId')}>
                                <option value="">Unassigned</option>
                                {mechanics.map((m) => <option key={m.id} value={m.id}>{m.username}</option>)}
                            </Input>
                        )}
                        <FormFooter action={create} label="Create Job Card" busyLabel="Creating…" pulse />
                    </form>
                </Card>
                <Notice>{update.error}</Notice>
                <Card flush title={`All job cards (${cards.data.length})`}>
                    <DataTable columns={columns} rows={cards.data} source={cards} empty="No job cards yet." />
                </Card>
            </div>
        </>
    );
}
