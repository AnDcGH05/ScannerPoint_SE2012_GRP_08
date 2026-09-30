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
import { dateTime } from '../components/ui/format';
import Input from '../components/ui/Input';
import Notice from '../components/ui/Notice';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import StatusSelect from '../components/ui/StatusSelect';
import { useAuth } from '../context/AuthContext';
import * as sample from '../data/sample';

const STATUSES = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
const EMPTY = { vehicleId: '', appointmentDate: '', serviceType: '', notes: '' };

export default function Appointments() {
    const { user } = useAuth();
    const canWrite = can(user.role, 'appointments.write');
    const list = useResource('/appointments', sample.appointments);
    const picker = useCustomerVehicles();
    const create = useAction();
    const update = useAction();
    const [form, setForm] = useState(EMPTY);
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await create.run(() => API.post('/appointments', {
            customerId: Number(picker.customerId),
            vehicleId: Number(form.vehicleId),
            appointmentDate: form.appointmentDate.length === 16 ? `${form.appointmentDate}:00` : form.appointmentDate,
            serviceType: form.serviceType.trim(),
            notes: form.notes.trim() || null,
        }), (r) => `Appointment booked for ${dateTime(r.data.appointmentDate)}.`);
        if (res) { list.setData((rows) => [...rows, res.data]); setForm(EMPTY); }
    };

    const changeStatus = async (row, status) => {
        const res = await update.run(() => API.patch(`/appointments/${row.id}/status`, null, { params: { status } }));
        if (res) list.setData((rows) => rows.map((r) => (r.id === row.id ? res.data : r)));
    };

    const rows = [...list.data].sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
    const columns = [
        { key: 'appointmentDate', label: 'When', className: 'tnum strong', render: (r) => dateTime(r.appointmentDate) },
        { key: 'customerName', label: 'Customer' },
        { key: 'licensePlate', label: 'Vehicle', className: 'plate' },
        { key: 'serviceType', label: 'Service', render: (r) => <>{r.serviceType}{r.notes && <div className="small muted">{r.notes}</div>}</> },
        { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
        ...(canWrite ? [{ key: 'change', label: 'Change status', render: (r) => <StatusSelect value={r.status} options={STATUSES} label={`Status for appointment ${r.id}`} onChange={(s) => changeStatus(r, s)} /> }] : []),
    ];

    return (
        <>
            <PageHeader eyebrow="Front desk · Appointments" title="Appointments" description="Service visits booked for customers' vehicles.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                {canWrite && (
                    <Card title="Book appointment">
                        <form className="form-grid" onSubmit={handleSubmit}>
                            <CustomerSelect picker={picker} vehicleId={form.vehicleId} onVehicle={(v) => setForm((f) => ({ ...f, vehicleId: v }))} />
                            <Input label="Date and time" type="datetime-local" value={form.appointmentDate} onChange={set('appointmentDate')} required hint="Must be in the future." />
                            <Input label="Service type" value={form.serviceType} onChange={set('serviceType')} placeholder="e.g. Full service" required />
                            <Input className="span-2" label="Notes" labelAside={<small>Optional</small>} value={form.notes} onChange={set('notes')} />
                            <FormFooter action={create} label="Book appointment" busyLabel="Booking…" />
                        </form>
                    </Card>
                )}
                <Notice>{update.error}</Notice>
                <Card flush title={`All appointments (${rows.length})`}>
                    <DataTable columns={columns} rows={rows} source={list} empty="No appointments yet." />
                </Card>
            </div>
        </>
    );
}
