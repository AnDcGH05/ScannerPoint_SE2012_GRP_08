import { useEffect, useState } from 'react';
import API from '../api/axios';
import { getErrorMessage } from '../api/errors';
import Notice from '../components/Notice';

const EMPTY = { name: '', email: '', phone: '', address: '' };

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        API.get('/customers')
            .then((res) => setCustomers(res.data))
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await API.post('/customers', {
                name: form.name.trim(),
                // empty email must be null, otherwise the unique constraint rejects a 2nd blank
                email: form.email.trim() || null,
                phone: form.phone.trim(),
                address: form.address.trim() || null,
            });
            setCustomers([...customers, res.data]);
            setForm(EMPTY);
            setSuccess(`Customer "${res.data.name}" added.`);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const q = search.toLowerCase();
    const visible = customers.filter((c) =>
        [c.name, c.email, c.phone].some((v) => (v || '').toLowerCase().includes(q))
    );

    return (
        <>
            <h2>Customers</h2>
            <Notice>{error}</Notice>
            <Notice type="success">{success}</Notice>

            <form className="card grid-form" onSubmit={handleSubmit}>
                <h3>Add customer</h3>
                <label>Name *
                    <input value={form.name} onChange={set('name')} required />
                </label>
                <label>Phone *
                    <input value={form.phone} onChange={set('phone')} required />
                </label>
                <label>Email
                    <input type="email" value={form.email} onChange={set('email')} />
                </label>
                <label>Address
                    <input value={form.address} onChange={set('address')} />
                </label>
                <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Add customer'}</button>
            </form>

            <div className="card">
                <div className="row-between">
                    <h3>All customers ({customers.length})</h3>
                    <input className="search" placeholder="Search name, email, phone…"
                           value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {loading ? <p className="muted">Loading…</p> : (
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Address</th></tr>
                        </thead>
                        <tbody>
                            {visible.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td><td>{c.name}</td><td>{c.phone}</td>
                                    <td>{c.email || '—'}</td><td>{c.address || '—'}</td>
                                </tr>
                            ))}
                            {visible.length === 0 && (
                                <tr><td colSpan="5" className="muted">No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
