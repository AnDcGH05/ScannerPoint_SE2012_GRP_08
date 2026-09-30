import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useResource } from '../api/useResource';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import FormFooter from '../components/ui/FormFooter';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import * as sample from '../data/sample';

const EMPTY = { name: '', contactPerson: '', email: '', phone: '', address: '' };
const COLUMNS = [
    { key: 'name', label: 'Supplier', className: 'strong' },
    { key: 'contactPerson', label: 'Contact person' },
    { key: 'phone', label: 'Phone', className: 'tnum' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
];

export default function Suppliers() {
    const suppliers = useResource('/suppliers', sample.suppliers);
    const action = useAction();
    const [form, setForm] = useState(EMPTY);
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await action.run(() => API.post('/suppliers', {
            name: form.name.trim(),
            contactPerson: form.contactPerson.trim() || null,
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim() || null,
        }), (r) => `Supplier "${r.data.name}" added.`);
        if (res) { suppliers.setData((list) => [...list, res.data]); setForm(EMPTY); }
    };

    return (
        <>
            <PageHeader eyebrow="Inventory · Suppliers" title="Suppliers" description="Companies the garage buys spare parts from.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Card title="Add supplier">
                    <form className="form-grid" onSubmit={handleSubmit}>
                        <Input label="Supplier name" value={form.name} onChange={set('name')} required />
                        <Input label="Contact person" labelAside={<small>Optional</small>} value={form.contactPerson} onChange={set('contactPerson')} />
                        <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
                        <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} required pattern="\+?[0-9]{9,15}"
                               title="9 to 15 digits, with an optional + at the start" hint="Digits only, 9–15 long, e.g. 0112345678" />
                        <Input className="span-2" label="Address" labelAside={<small>Optional</small>} value={form.address} onChange={set('address')} />
                        <FormFooter action={action} label="Add supplier" />
                    </form>
                </Card>
                <Card flush title={`All suppliers (${suppliers.data.length})`}>
                    <DataTable columns={COLUMNS} rows={suppliers.data} source={suppliers} empty="No suppliers yet." />
                </Card>
            </div>
        </>
    );
}
