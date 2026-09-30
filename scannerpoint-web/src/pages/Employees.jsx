import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useResource } from '../api/useResource';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import FormFooter from '../components/ui/FormFooter';
import { date, money } from '../components/ui/format';
import Input from '../components/ui/Input';
import Notice from '../components/ui/Notice';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import * as sample from '../data/sample';

const POSITIONS = ['MECHANIC', 'RECEPTIONIST', 'STOREKEEPER', 'MANAGER'];
const EMPTY = { fullName: '', nic: '', phone: '', email: '', position: 'MECHANIC', hireDate: '', monthlySalary: '', userId: '' };
const title = (s) => s.charAt(0) + s.slice(1).toLowerCase();

export default function Employees() {
    const employees = useResource('/employees', sample.employees);
    const users = useResource('/users', sample.users);
    const save = useAction();
    const toggle = useAction();
    const [form, setForm] = useState(EMPTY);
    const [editingId, setEditingId] = useState(null);
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const startEdit = (emp) => {
        setEditingId(emp.id);
        setForm({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, emp[k] ?? ''])) });
        save.clear();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const cancelEdit = () => { setEditingId(null); setForm(EMPTY); save.clear(); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            fullName: form.fullName.trim(),
            nic: form.nic.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || null,
            position: form.position,
            hireDate: form.hireDate,
            monthlySalary: Number(form.monthlySalary),
            userId: form.userId ? Number(form.userId) : null,
        };
        const res = await save.run(
            () => (editingId ? API.put(`/employees/${editingId}`, body) : API.post('/employees', body)),
            (r) => `${r.data.fullName} ${editingId ? 'updated' : 'added'}.`);
        if (!res) return;
        employees.setData((list) => (editingId ? list.map((x) => (x.id === editingId ? res.data : x)) : [...list, res.data]));
        setEditingId(null);
        setForm(EMPTY);
    };

    const setActive = async (emp, active) => {
        const res = await toggle.run(() => API.patch(`/employees/${emp.id}/active`, null, { params: { active } }));
        if (res) employees.setData((list) => list.map((x) => (x.id === emp.id ? res.data : x)));
    };

    const columns = [
        { key: 'fullName', label: 'Employee', render: (e) => <><div className="strong">{e.fullName}</div><div className="small muted mono">{e.nic}</div></> },
        { key: 'position', label: 'Position', render: (e) => title(e.position) },
        { key: 'phone', label: 'Phone', className: 'tnum' },
        { key: 'username', label: 'Login account', render: (e) => e.username || '—' },
        { key: 'hireDate', label: 'Hired', className: 'tnum', render: (e) => date(e.hireDate) },
        { key: 'monthlySalary', label: 'Monthly salary', num: true, render: (e) => money(e.monthlySalary) },
        { key: 'active', label: 'Status', render: (e) => <Badge>{e.active ? 'ACTIVE' : 'INACTIVE'}</Badge> },
        { key: 'actions', label: 'Actions', render: (e) => (
            <div className="row" style={{ flexWrap: 'nowrap' }}>
                <Button variant="secondary" size="sm" onClick={() => startEdit(e)}>Edit</Button>
                <Button variant={e.active ? 'danger' : 'secondary'} size="sm" disabled={toggle.busy} onClick={() => setActive(e, !e.active)}>
                    {e.active ? 'Deactivate' : 'Activate'}
                </Button>
            </div>
        ) },
    ];

    return (
        <>
            <PageHeader eyebrow="Administration · Employees" title="Employees" description="Workshop staff records, positions and salaries.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Card title={editingId ? 'Edit employee' : 'Add employee'}>
                    <form className="form-grid" onSubmit={handleSubmit}>
                        <Input label="Full name" value={form.fullName} onChange={set('fullName')} required />
                        <Input label="NIC" value={form.nic} onChange={set('nic')} required pattern="([0-9]{9}[vVxX]|[0-9]{12})"
                               title="9 digits followed by V or X, or 12 digits" hint="Old format 923456789V, or new 12-digit format" />
                        <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} required pattern="\+?[0-9]{9,15}"
                               title="9 to 15 digits, with an optional + at the start" hint="Digits only, 9–15 long" />
                        <Input label="Email" labelAside={<small>Optional</small>} type="email" value={form.email} onChange={set('email')} />
                        <Input label="Position" as="select" value={form.position} onChange={set('position')}>
                            {POSITIONS.map((p) => <option key={p} value={p}>{title(p)}</option>)}
                        </Input>
                        <Input label="Hire date" type="date" value={form.hireDate} onChange={set('hireDate')} required />
                        <Input label="Monthly salary (Rs.)" type="number" min="0" step="0.01" value={form.monthlySalary} onChange={set('monthlySalary')} required />
                        <Input label="Login account" labelAside={<small>Optional</small>} as="select" value={form.userId} onChange={set('userId')} error={users.error}>
                            <option value="">Not linked</option>
                            {users.data.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
                        </Input>
                        <FormFooter action={save} label={editingId ? 'Save changes' : 'Add employee'}>
                            {editingId && <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>}
                        </FormFooter>
                    </form>
                </Card>
                <Notice>{toggle.error}</Notice>
                <Card flush title={`All employees (${employees.data.length})`}>
                    <DataTable columns={columns} rows={employees.data} source={employees} empty="No employees yet." />
                </Card>
            </div>
        </>
    );
}
