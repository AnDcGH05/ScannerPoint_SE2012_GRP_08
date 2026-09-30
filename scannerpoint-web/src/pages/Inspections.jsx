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
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import { useAuth } from '../context/AuthContext';
import * as sample from '../data/sample';

const RESULTS = ['PASSED', 'NEEDS_ATTENTION', 'FAILED', 'PENDING'];
const COLUMNS = [
    { key: 'inspectionDate', label: 'Date', className: 'tnum strong', render: (i) => dateTime(i.inspectionDate) },
    { key: 'details', label: 'Findings' },
    { key: 'resultStatus', label: 'Result', render: (i) => <Badge>{i.resultStatus}</Badge> },
];

export default function Inspections() {
    const { user } = useAuth();
    const picker = useCustomerVehicles();
    const [vehicleId, setVehicleId] = useState('');
    const inspections = useResource(vehicleId ? `/inspections/vehicle/${vehicleId}` : null, vehicleId ? sample.inspections : []);
    const action = useAction();
    const [form, setForm] = useState({ details: '', status: 'PASSED' });
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // This endpoint takes request parameters, not a JSON body
        const res = await action.run(() => API.post('/inspections', null, {
            params: { vehicleId: Number(vehicleId), details: form.details.trim(), status: form.status },
        }), 'Inspection recorded.');
        if (res) { inspections.reload(); setForm({ details: '', status: 'PASSED' }); }
    };

    const rows = [...inspections.data].sort((a, b) => String(b.inspectionDate).localeCompare(String(a.inspectionDate)));

    return (
        <>
            <PageHeader eyebrow="Workshop · Inspections" title="Vehicle inspections" description="Inspection results recorded against a vehicle.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Card>
                    <div className="form-grid">
                        <CustomerSelect picker={picker} vehicleId={vehicleId} onVehicle={(v) => { setVehicleId(v); action.clear(); }} />
                    </div>
                </Card>
                {vehicleId && (
                    <>
                        {can(user.role, 'inspections.write') && (
                            <Card title="Record inspection">
                                <form className="form-grid" onSubmit={handleSubmit}>
                                    <Input className="span-2" label="Findings" as="textarea" value={form.details} onChange={set('details')} required maxLength={250} />
                                    <Input label="Result" as="select" value={form.status} onChange={set('status')}>
                                        {RESULTS.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                                    </Input>
                                    <FormFooter action={action} label="Record inspection" />
                                </form>
                            </Card>
                        )}
                        <Card flush title={`Inspection history (${rows.length})`}>
                            <DataTable columns={COLUMNS} rows={rows} source={inspections} empty="No inspections recorded for this vehicle." />
                        </Card>
                    </>
                )}
            </div>
        </>
    );
}
