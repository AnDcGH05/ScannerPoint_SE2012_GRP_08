import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useResource } from '../api/useResource';
import { can } from '../components/layout/nav';
import { Search } from '../components/ui/icons';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import FormFooter from '../components/ui/FormFooter';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import { useAuth } from '../context/AuthContext';
import * as sample from '../data/sample';

const EMPTY = { name: '', email: '', phone: '', address: '' };
const COLUMNS = [
    { key: 'id', label: 'ID', className: 'tnum muted' },
    { key: 'name', label: 'Name', className: 'strong' },
    { key: 'phone', label: 'Phone', className: 'tnum' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
];

export default function Customers() {
    const { user } = useAuth();
    const customers = useResource('/customers', sample.customers);
    const action = useAction();
    const [form, setForm] = useState(EMPTY);
    const [search, setSearch] = useState('');
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await action.run(() => API.post('/customers', {
            name: form.name.trim(),
            // empty email must be null, otherwise the unique constraint rejects a 2nd blank
            email: form.email.trim() || null,
            phone: form.phone.trim(),
            address: form.address.trim() || null,
        }), (r) => `Customer "${r.data.name}" added.`);
        if (res) { customers.setData((list) => [...list, res.data]); setForm(EMPTY); }
    };

    const q = search.toLowerCase();
    const rows = customers.data.filter((c) => [c.name, c.email, c.phone].some((v) => (v || '').toLowerCase().includes(q)));

    return (
        <>
            <PageHeader eyebrow="Front desk · Customers" title="Customers" description="Vehicle owners registered with the garage.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                {can(user.role, 'customers.write') && (
                    <Card title="Add customer">
                        <form className="form-grid" onSubmit={handleSubmit}>
                            <Input label="Name" value={form.name} onChange={set('name')} required />
                            <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} required />
                            <Input label="Email" labelAside={<small>Optional</small>} type="email" value={form.email} onChange={set('email')} />
                            <Input label="Address" labelAside={<small>Optional</small>} value={form.address} onChange={set('address')} />
                            <FormFooter action={action} label="Add customer" />
                        </form>
                    </Card>
                )}
                <Card flush title={`All customers (${rows.length})`}
                      aside={<Input label={<span className="sr-only">Search customers</span>} icon={Search} type="search" placeholder="Search name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />}>
                    <DataTable columns={COLUMNS} rows={rows} source={customers} empty="No customers found." />
                </Card>
            </div>
        </>
    );
}
