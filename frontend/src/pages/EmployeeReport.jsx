import { useEffect, useState } from 'react';
import API from '../api/axios';
import { getErrorMessage } from '../api/errors';
import { money } from '../utils';
import Notice from '../components/Notice';

export default function EmployeeReport() {
    const [report, setReport] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get('/reports/employees')
            .then((res) => setReport(res.data))
            .catch((err) => setError(getErrorMessage(err)));
    }, []);

    if (error) return <Notice>{error}</Notice>;
    if (!report) return <p className="muted">Loading…</p>;

    const stats = [
        ['Total revenue', money(report.totalRevenue)],
        ['Salaries paid', money(report.totalSalaryPaid)],
        ['Net income', money(report.netIncome)],
        ['Monthly payroll', money(report.monthlyPayroll)],
        ['Active employees', report.activeEmployees],
    ];

    return (
        <>
            <h2>Employee report</h2>
            <div className="stats">
                {stats.map(([label, value]) => (
                    <div className="card stat" key={label}>
                        <span className="muted">{label}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </div>

            <div className="card">
                <h3>Per employee</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th><th>Position</th><th>Status</th>
                            <th>Jobs assigned</th><th>Jobs completed</th><th>Salary paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.employees.map((r) => (
                            <tr key={r.employeeId} className={r.active ? '' : 'row-inactive'}>
                                <td>{r.fullName}</td>
                                <td>{r.position}</td>
                                <td>
                                    <span className={`badge ${r.active ? 'badge-ok' : 'badge-off'}`}>
                                        {r.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{r.jobCardsAssigned}</td>
                                <td>{r.jobCardsCompleted}</td>
                                <td>{money(r.salaryPaid)}</td>
                            </tr>
                        ))}
                        {report.employees.length === 0 && (
                            <tr><td colSpan="6" className="muted">No employees yet.</td></tr>
                        )}
                    </tbody>
                </table>
                <p className="muted small">
                    Jobs are counted for employees linked to a login account. A job counts as completed when its status is COMPLETED.
                </p>
            </div>
        </>
    );
}
