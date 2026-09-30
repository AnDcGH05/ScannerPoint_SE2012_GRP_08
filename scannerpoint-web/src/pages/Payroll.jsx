import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useResource } from '../api/useResource';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import FormFooter from '../components/ui/FormFooter';
import { date, money } from '../components/ui/format';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import * as sample from '../data/sample';

const thisMonth = () => new Date().toISOString().slice(0, 7); // YYYY-MM, the format the backend expects
const COLUMNS = [
    { key: 'payMonth', label: 'Pay month', className: 'tnum strong' },
    { key: 'employeeName', label: 'Employee' },
    { key: 'amount', label: 'Amount', num: true, render: (p) => money(p.amount) },
    { key: 'paymentDate', label: 'Paid on', className: 'tnum', render: (p) => date(p.paymentDate) },
    { key: 'notes', label: 'Notes' },
];

export default function Payroll() {
    const employees = useResource('/employees', sample.employees);
    const [month, setMonth] = useState('');
    const payments = useResource(month ? `/salary-payments?month=${month}` : '/salary-payments',
        sample.salaryPayments.filter((p) => !month || p.payMonth === month));
    const action = useAction();
    const [form, setForm] = useState({ employeeId: '', payMonth: thisMonth(), amount: '', notes: '' });
    const active = employees.data.filter((e) => e.active);

    const pickEmployee = (id) => {
        const emp = employees.data.find((e) => String(e.id) === id);
        setForm({ ...form, employeeId: id, amount: emp ? String(emp.monthlySalary) : '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await action.run(() => API.post(`/salary-payments/employee/${form.employeeId}`, {
            payMonth: form.payMonth,
            amount: Number(form.amount),
            notes: form.notes.trim() || null,
        }), (r) => `${money(r.data.amount)} recorded for ${r.data.employeeName} (${r.data.payMonth}).`);
        if (res) { payments.reload(); setForm({ ...form, employeeId: '', amount: '', notes: '' }); }
    };

    const total = payments.data.reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <>
            <PageHeader eyebrow="Administration · Payroll" title="Payroll" description="Record monthly salary payments. Each employee can be paid once per month.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Card title="Record salary payment">
                    <form className="form-grid" onSubmit={handleSubmit}>
                        <Input label="Employee" as="select" value={form.employeeId} required error={employees.error} onChange={(e) => pickEmployee(e.target.value)}
                               hint="Only active employees can be paid.">
                            <option value="">Select an employee…</option>
                            {active.map((e) => <option key={e.id} value={e.id}>{e.fullName} — {e.position.toLowerCase()}</option>)}
                        </Input>
                        <Input label="Pay month" type="month" value={form.payMonth} required onChange={(e) => setForm({ ...form, payMonth: e.target.value })} />
                        <Input label="Amount (Rs.)" type="number" min="0.01" step="0.01" value={form.amount} required onChange={(e) => setForm({ ...form, amount: e.target.value })}
                               hint="Filled in from the employee's monthly salary." />
                        <Input label="Notes" labelAside={<small>Optional</small>} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        <FormFooter action={action} label="Record payment" />
                    </form>
                </Card>
                <Card flush title={`Salary payments (${payments.data.length})`} subtitle={`Total ${money(total)}`}
                      aside={<Input label="Filter by month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />}>
                    <DataTable columns={COLUMNS} rows={payments.data} source={payments} empty={month ? 'No payments recorded for this month.' : 'No salary payments yet.'} />
                </Card>
            </div>
        </>
    );
}
