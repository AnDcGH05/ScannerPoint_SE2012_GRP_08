import { useCallback, useEffect, useState } from 'react';
import API from '../api/axios';
import { getErrorMessage } from '../api/errors';
import { money } from '../utils';
import Notice from '../components/Notice';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Payroll() {
    const [employees, setEmployees] = useState([]);
    const [employeeId, setEmployeeId] = useState('');
    const [payments, setPayments] = useState([]);
    const [form, setForm] = useState({ payMonth: thisMonth(), amount: '', notes: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadPayments = useCallback(async (id) => {
        try {
            const res = await API.get(id ? `/salary-payments/employee/${id}` : '/salary-payments');
            setPayments(res.data);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    }, []);

    useEffect(() => {
        API.get('/employees')
            .then((res) => setEmployees(res.data.filter((e) => e.active)))
            .catch((err) => setError(getErrorMessage(err)));
        loadPayments('');
    }, [loadPayments]);

    const selected = employees.find((e) => String(e.id) === String(employeeId));

    const handleSelect = (e) => {
        setEmployeeId(e.target.value);
        setError('');
        setSuccess('');
        loadPayments(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await API.post(`/salary-payments/employee/${employeeId}`, {
                payMonth: form.payMonth,
                amount: form.amount === '' ? null : Number(form.amount),
                notes: form.notes.trim() || null,
            });
            setSuccess(`Recorded ${money(res.data.amount)} for ${res.data.employeeName} (${res.data.payMonth}).`);
            setForm({ ...form, amount: '', notes: '' });
            loadPayments(employeeId);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <h2>Payroll</h2>
            <Notice>{error}</Notice>
            <Notice type="success">{success}</Notice>

            <div className="card">
                <label>Employee
                    <select value={employeeId} onChange={handleSelect}>
                        <option value="">— all employees (history only) —</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.fullName} · {emp.position}</option>
                        ))}
                    </select>
                </label>
            </div>

            {employeeId && (
                <form className="card grid-form" onSubmit={handleSubmit}>
                    <h3>Record salary payment</h3>
                    <label>Month *
                        <input type="month" value={form.payMonth} required
                               onChange={(e) => setForm({ ...form, payMonth: e.target.value })} />
                    </label>
                    <label>Amount (blank = monthly salary{selected ? `: ${money(selected.monthlySalary)}` : ''})
                        <input type="number" min="0.01" step="0.01" value={form.amount}
                               onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    </label>
                    <label className="span-2">Notes
                        <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </label>
                    <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Record payment'}</button>
                </form>
            )}

            <div className="card">
                <h3>{employeeId ? 'Payment history' : 'All salary payments'} ({payments.length})</h3>
                <table>
                    <thead>
                        <tr><th>Month</th><th>Employee</th><th>Amount</th><th>Paid on</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr key={p.id}>
                                <td>{p.payMonth}</td>
                                <td>{p.employeeName}</td>
                                <td>{money(p.amount)}</td>
                                <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                <td>{p.notes || '—'}</td>
                            </tr>
                        ))}
                        {payments.length === 0 && (
                            <tr><td colSpan="5" className="muted">No payments recorded yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
