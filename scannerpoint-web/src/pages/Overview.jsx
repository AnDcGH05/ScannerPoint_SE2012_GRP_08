import { useResource } from '../api/useResource';
import { can } from '../components/layout/nav';
import { CalendarDays, ClipboardList, Package, Plus, Receipt, UserRound, Users } from '../components/ui/icons';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { dateTime, greeting, todayLabel } from '../components/ui/format';
import Notice from '../components/ui/Notice';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import Reveal from '../components/ui/Reveal';
import StatCard from '../components/ui/StatCard';
import { ROLE_LABEL, useAuth } from '../context/AuthContext';
import * as sample from '../data/sample';

const NO_SUMMARY = { totalRevenue: 0, totalInvoices: 0, pendingInvoices: 0 };
const NO_REPORT = { activeEmployees: 0, monthlyPayroll: 0 };
const isOpen = (j) => !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(j.status);

export default function Overview() {
    const { user } = useAuth();
    const has = (p) => can(user.role, p);
    // Each list is only requested when the signed-in role is allowed to read it
    const customers = useResource(has('customers.read') ? '/customers' : null, sample.customers);
    const jobCards = useResource(has('jobcards.read') ? '/repairs/job-cards' : null, sample.jobCards);
    const appointments = useResource(has('appointments.read') ? '/appointments' : null, sample.appointments);
    const lowStock = useResource(has('parts.lowstock') ? '/spare-parts/low-stock' : null, sample.spareParts.filter((p) => p.isLowStock));
    const summary = useResource(has('reports') ? '/reports/summary' : null, sample.summary, NO_SUMMARY);
    const staff = useResource(has('reports') ? '/reports/employees' : null, sample.employeeReport, NO_REPORT);

    const upcoming = appointments.data
        .filter((a) => new Date(a.appointmentDate) >= new Date() && a.status !== 'CANCELLED')
        .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate)).slice(0, 5);
    const openCards = jobCards.data.filter(isOpen);

    if (user.role === 'user') {
        return (
            <>
                <PageHeader eyebrow={`ScannerPoint · ${todayLabel()}`} title={<span className="greeting">{greeting()}, {user.username}</span>} />
                <Card title="Your account has no staff role yet">
                    <p className="muted">You are registered and logged in, but the workshop screens are for staff roles
                        (admin, receptionist, mechanic, storekeeper). Ask an admin to assign your role, then log in again.</p>
                </Card>
            </>
        );
    }

    return (
        <>
            <PageHeader eyebrow={`${ROLE_LABEL[user.role]} · ${todayLabel()}`} title={<span className="greeting">{greeting()}, {user.username}</span>}
                        description="Today's workshop activity at a glance.">
                <PreviewTag />
                {has('jobcards.create') && <Button to="/job-cards" pulse><Plus aria-hidden="true" />Create Job Card</Button>}
            </PageHeader>

            <div className="stack-lg">
                <div className="stat-grid">
                    {has('jobcards.read') && <Reveal index={0}><StatCard label="Open job cards" icon={ClipboardList} value={openCards.length} note={`${jobCards.data.length} in total`} /></Reveal>}
                    {has('appointments.read') && <Reveal index={1}><StatCard label="Upcoming appointments" icon={CalendarDays} value={upcoming.length} note={`${appointments.data.length} booked in total`} /></Reveal>}
                    {has('customers.read') && <Reveal index={2}><StatCard label="Customers" icon={UserRound} value={customers.data.length} note="Registered vehicle owners" /></Reveal>}
                    {has('parts.lowstock') && <Reveal index={3}><StatCard label="Low-stock parts" icon={Package} value={lowStock.data.length} noteTone={lowStock.data.length ? 'danger' : 'success'} note={lowStock.data.length ? 'At or below reorder level' : 'Stock levels are fine'} /></Reveal>}
                    {has('reports') && <Reveal index={4}><StatCard label="Revenue" icon={Receipt} value={summary.data.totalRevenue} prefix="Rs. " note={`${summary.data.pendingInvoices} of ${summary.data.totalInvoices} invoices pending`} /></Reveal>}
                    {has('reports') && <Reveal index={5}><StatCard label="Active employees" icon={Users} value={staff.data.activeEmployees} note="On the payroll" /></Reveal>}
                </div>
                <Notice>{customers.error || jobCards.error || appointments.error || lowStock.error || summary.error}</Notice>

                <div className="grid-2">
                    {has('appointments.read') && (
                        <Reveal index={1}>
                            <Card title="Upcoming appointments" aside={<Button variant="ghost" size="sm" to="/appointments">View all</Button>}>
                                {upcoming.length === 0 ? <p className="muted small">No upcoming appointments.</p> : (
                                    <ul className="list">
                                        {upcoming.map((a) => (
                                            <li key={a.id}>
                                                <div>
                                                    <div className="strong">{a.customerName} · <span className="plate">{a.licensePlate}</span></div>
                                                    <div className="small muted">{a.serviceType} · <span className="tnum">{dateTime(a.appointmentDate)}</span></div>
                                                </div>
                                                <Badge>{a.status}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                        </Reveal>
                    )}
                    {has('jobcards.read') && (
                        <Reveal index={2}>
                            <Card title="Open job cards" aside={<Button variant="ghost" size="sm" to="/job-cards">View all</Button>}>
                                {openCards.length === 0 ? <p className="muted small">No open job cards.</p> : (
                                    <ul className="list">
                                        {openCards.slice(0, 5).map((j) => (
                                            <li key={j.id}>
                                                <div>
                                                    <div className="strong mono">{j.cardNumber}</div>
                                                    <div className="small muted"><span className="plate">{j.licensePlate}</span> · {j.mechanicName}</div>
                                                </div>
                                                <Badge>{j.status}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                        </Reveal>
                    )}
                    {has('parts.lowstock') && (
                        <Reveal index={3}>
                            <Card title="Low-stock parts" aside={<Button variant="ghost" size="sm" to="/stock">Restock</Button>}>
                                {lowStock.data.length === 0 ? <p className="muted small">No parts are at their reorder level.</p> : (
                                    <ul className="list">
                                        {lowStock.data.slice(0, 5).map((p) => (
                                            <li key={p.id}>
                                                <div>
                                                    <div className="strong">{p.name}</div>
                                                    <div className="small muted tnum">{p.quantityInStock} left · reorder at {p.reorderLevel}</div>
                                                </div>
                                                <Badge tone="warning">Low stock</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                        </Reveal>
                    )}
                </div>
            </div>
        </>
    );
}
