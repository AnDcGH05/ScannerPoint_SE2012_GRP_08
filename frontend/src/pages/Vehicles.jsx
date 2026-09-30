import { useEffect, useState } from 'react';
import API from '../api/axios';
import { getErrorMessage } from '../api/errors';
import Notice from '../components/Notice';

const EMPTY = { licensePlate: '', make: '', model: '' };

export default function Vehicles() {
    const [customers, setCustomers] = useState([]);
    const [customerId, setCustomerId] = useState('');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        API.get('/customers')
            .then((res) => setCustomers(res.data))
            .catch((err) => setError(getErrorMessage(err)));
    }, []);

    const handleSelect = async (e) => {
        const id = e.target.value;
        setCustomerId(id);
        setVehicles([]);
        setError('');
        setSuccess('');
        if (!id) return;
        setLoading(true);
        try {
            const res = await API.get(`/vehicles/customer/${id}`);
            setVehicles(res.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await API.post('/vehicles', {
                customerId: Number(customerId),
                licensePlate: form.licensePlate.trim().toUpperCase(),
                make: form.make.trim(),
                model: form.model.trim(),
            });
            setVehicles([...vehicles, res.data]);
            setForm(EMPTY);
            setSuccess(`Vehicle ${res.data.licensePlate} added.`);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <h2>Vehicles</h2>
            <Notice>{error}</Notice>
            <Notice type="success">{success}</Notice>

            <div className="card">
                <label>Customer
                    <select value={customerId} onChange={handleSelect}>
                        <option value="">— select a customer —</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                        ))}
                    </select>
                </label>
            </div>

            {customerId && (
                <>
                    <form className="card grid-form" onSubmit={handleSubmit}>
                        <h3>Add vehicle</h3>
                        <label>License plate *
                            <input value={form.licensePlate} onChange={set('licensePlate')} required />
                        </label>
                        <label>Make *
                            <input value={form.make} onChange={set('make')} required />
                        </label>
                        <label>Model *
                            <input value={form.model} onChange={set('model')} required />
                        </label>
                        <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Add vehicle'}</button>
                    </form>

                    <div className="card">
                        <h3>Vehicles ({vehicles.length})</h3>
                        {loading ? <p className="muted">Loading…</p> : (
                            <table>
                                <thead>
                                    <tr><th>ID</th><th>License plate</th><th>Make</th><th>Model</th></tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((v) => (
                                        <tr key={v.id}>
                                            <td>{v.id}</td><td>{v.licensePlate}</td><td>{v.make}</td><td>{v.model}</td>
                                        </tr>
                                    ))}
                                    {vehicles.length === 0 && (
                                        <tr><td colSpan="4" className="muted">No vehicles for this customer yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
