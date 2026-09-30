import { useEffect, useState } from 'react';
import API from '../api/axios';
import { getErrorMessage } from '../api/errors';
import { money } from '../utils';
import Notice from '../components/Notice';

const POSITIONS = ['MECHANIC', 'RECEPTIONIST', 'STOREKEEPER', 'MANAGER'];
const EMPTY = {
    fullName: '', nic: '', phone: '', email: '',
    position: 'MECHANIC', hireDate: '', monthlySalary: '', userId: '',
};

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        Promise.all([API.get('/employees'), API.get('/users')])
            .then(([emp, usr]) => {
                setEmployees(emp.data);
                setUsers(usr.data);
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    // login accounts not already linked to a different employee
    const availableUsers = users.filter(
        (u) => !employees.some((e) => e.userId === u.id && e.id !== editingId)
    );

    const startEdit = (emp) => {
        setEditingId(emp.id);
        setForm({
            fullName: emp.fullName, nic: emp.nic, phone: emp.phone, email: emp.email || '',
            position: emp.position, hireDate: emp.hireDate, monthlySalary: emp.monthlySalary,
            userId: emp.userId ?? '',
        });
        setError('');
        setSuccess('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(EMPTY);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        const payload = {
            fullName: form.fullName.trim(),
            nic: form.nic.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || null,
            position: form.position,
            hireDate: form.hireDate,
            monthlySalary: Number(form.monthlySalary),
            userId: form.userId === '' ? null : Number(form.userId),
        };
        try {
            if (editingId) {
                const res = await API.put(`/employees/${editingId}`, payload);
                setEmployees(employees.map((x) => (x.id === editingId ? res.data : x)));
                setSuccess(`${res.data.fullName} updated.`);
            } else {
                const res = await API.post('/employees', payload);
                setEmployees([...employees, res.data]);
                setSuccess(`${res.data.fullName} added.`);
            }
            cancelEdit();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (emp) => {
        setError('');
        setSuccess('');
        try {
            const res = await API.patch(`/employees/${emp.id}/active`, null, {
                params: { active: !emp.active },
            });
            setEmployees(employees.map((x) => (x.id === emp.id ? res.data : x)));
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <>
            <h2>Employees</h2>
            <Notice>{error}</Notice>
            <Notice type="success">{success}</Notice>

            <form className="card grid-form" onSubmit={handleSubmit}>
                <h3>{editingId ? 'Edit employee' : 'Add employee'}</h3>
                <label>Full name *
                    <input value={form.fullName} onChange={set('fullName')} required />
                </label>
                <label>NIC *
                    <input value={form.nic} onChange={set('nic')} required />
                </label>
                <label>Phone *
                    <input value={form.phone} onChange={set('phone')} required />
                </label>
                <label>Email
                    <input type="email" value={form.email} onChange={set('email')} />
                </label>
                <label>Position *
                    <select value={form.position} onChange={set('position')}>
                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                </label>
                <label>Hire date *
                    <input type="date" value={form.hireDate} onChange={set('hireDate')} required />
                </label>
                <label>Monthly salary *
                    <input type="number" min="0" step="0.01" value={form.monthlySalary}
                           onChange={set('monthlySalary')} required />
                </label>
                <label>Login account (optional)
                    <select value={form.userId} onChange={set('userId')}>
                        <option value="">— none —</option>
                        {availableUsers.map((u) => (
                            <option key={u.id} value={u.id}>{u.username}</option>
                        ))}
                    </select>
                </label>
                <div className="actions">
                    <button className="btn" disabled={saving}>
                        {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add employee'}
                    </button>
                    {editingId && (
                        <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                    )}
                </div>
            </form>

            <div className="card">
                <h3>All employees ({employees.length})</h3>
                {loading ? <p className="muted">Loading…</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th><th>NIC</th><th>Position</th><th>Phone</th>
                                <th>Salary</th><th>Login</th><th>Status</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id} className={emp.active ? '' : 'row-inactive'}>
                                    <td>{emp.fullName}</td>
                                    <td>{emp.nic}</td>
                                    <td>{emp.position}</td>
                                    <td>{emp.phone}</td>
                                    <td>{money(emp.monthlySalary)}</td>
                                    <td>{emp.username || '—'}</td>
                                    <td>
                                        <span className={`badge ${emp.active ? 'badge-ok' : 'badge-off'}`}>
                                            {emp.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn btn-small btn-outline" onClick={() => startEdit(emp)}>Edit</button>
                                        <button className="btn btn-small btn-outline" onClick={() => toggleActive(emp)}>
                                            {emp.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr><td colSpan="8" className="muted">No employees yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
