import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useCustomerVehicles } from '../api/useCustomerVehicles';
import { can } from '../components/layout/nav';
import Card from '../components/ui/Card';
import CustomerSelect from '../components/ui/CustomerSelect';
import DataTable from '../components/ui/DataTable';
import FormFooter from '../components/ui/FormFooter';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import { useAuth } from '../context/AuthContext';

const EMPTY = { licensePlate: '', make: '', model: '' };
const COLUMNS = [
    { key: 'licensePlate', label: 'License plate', className: 'plate' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'customerName', label: 'Owner' },
];

export default function Vehicles() {
    const { user } = useAuth();
    const picker = useCustomerVehicles();
    const { customerId, vehicles } = picker;
    const action = useAction();
    const [form, setForm] = useState(EMPTY);
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await action.run(() => API.post('/vehicles', {
            customerId: Number(customerId),
            licensePlate: form.licensePlate.trim().toUpperCase(),
            make: form.make.trim(),
            model: form.model.trim(),
        }), (r) => `Vehicle ${r.data.licensePlate} added.`);
        if (res) { vehicles.setData((list) => [...list, res.data]); setForm(EMPTY); }
    };

    return (
        <>
            <PageHeader eyebrow="Front desk · Vehicles" title="Vehicles" description="Choose a customer to see their vehicles.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Card><CustomerSelect picker={picker} onChange={action.clear} /></Card>
                {customerId && (
                    <>
                        {can(user.role, 'vehicles.write') && (
                            <Card title="Add vehicle">
                                <form className="form-grid" onSubmit={handleSubmit}>
                                    <Input label="License plate" value={form.licensePlate} onChange={set('licensePlate')} placeholder="WP-CB-4821" required />
                                    <Input label="Make" value={form.make} onChange={set('make')} placeholder="Toyota" required />
                                    <Input label="Model" value={form.model} onChange={set('model')} placeholder="Axio" required />
                                    <FormFooter action={action} label="Add vehicle" />
                                </form>
                            </Card>
                        )}
                        <Card flush title={`Vehicles (${vehicles.data.length})`}>
                            <DataTable columns={COLUMNS} rows={vehicles.data} source={vehicles} empty="This customer has no vehicles yet." />
                        </Card>
                    </>
                )}
            </div>
        </>
    );
}
