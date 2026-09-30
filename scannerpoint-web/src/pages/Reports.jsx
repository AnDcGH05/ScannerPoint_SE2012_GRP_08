import { useResource } from '../api/useResource';
import { FileText, Receipt, Users } from '../components/ui/icons';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import { money } from '../components/ui/format';
import Notice from '../components/ui/Notice';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import Reveal from '../components/ui/Reveal';
import StatCard from '../components/ui/StatCard';
import * as sample from '../data/sample';

const NO_SUMMARY = { totalRevenue: 0, totalInvoices: 0, pendingInvoices: 0 };
const NO_REPORT = { totalRevenue: 0, totalSalaryPaid: 0, netIncome: 0, monthlyPayroll: 0, activeEmployees: 0, employees: [] };
const COLUMNS = [
    { key: 'fullName', label: 'Employee', className: 'strong' },
    { key: 'position', label: 'Position', render: (e) => e.position.charAt(0) + e.position.slice(1).toLowerCase() },
    { key: 'active', label: 'Status', render: (e) => <Badge>{e.active ? 'ACTIVE' : 'INACTIVE'}</Badge> },
    { key: 'jobCardsAssigned', label: 'Job cards assigned', num: true },
    { key: 'jobCardsCompleted', label: 'Completed', num: true },
    { key: 'salaryPaid', label: 'Salary paid', num: true, render: (e) => money(e.salaryPaid) },
];

export default function Reports() {
    const summary = useResource('/reports/summary', sample.summary, NO_SUMMARY);
    const staff = useResource('/reports/employees', sample.employeeReport, NO_REPORT);
    const s = summary.data, r = staff.data;

    return (
        <>
            <PageHeader eyebrow="Administration · Reports" title="Reports" description="Billing totals, payroll cost and work completed by each employee.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                <Notice>{summary.error || staff.error}</Notice>
                <div className="stat-grid">
                    <Reveal index={0}><StatCard label="Revenue" icon={Receipt} value={s.totalRevenue} prefix="Rs. " note="Payments received" /></Reveal>
                    <Reveal index={1}><StatCard label="Salaries paid" icon={Receipt} value={r.totalSalaryPaid} prefix="Rs. " note={`${money(r.monthlyPayroll)} monthly payroll`} /></Reveal>
                    <Reveal index={2}><StatCard label="Net income" icon={FileText} value={r.netIncome} prefix="Rs. " note="Revenue minus salaries" noteTone={r.netIncome < 0 ? 'danger' : 'success'} /></Reveal>
                    <Reveal index={3}><StatCard label="Invoices" icon={FileText} value={s.totalInvoices} note={`${s.pendingInvoices} pending payment`} noteTone={s.pendingInvoices ? 'danger' : 'success'} /></Reveal>
                    <Reveal index={4}><StatCard label="Active employees" icon={Users} value={r.activeEmployees} note={`${r.employees?.length ?? 0} on record`} /></Reveal>
                </div>
                <Card flush title="Employee performance" subtitle="Job cards handled and salary paid per employee">
                    <DataTable columns={COLUMNS} rows={r.employees || []} source={staff} rowKey="employeeId" empty="No employees on record." />
                </Card>
            </div>
        </>
    );
}
