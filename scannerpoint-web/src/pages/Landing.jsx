import { ArrowRight, CalendarDays, Check, ClipboardCheck, Package, Receipt, Users, Wrench } from '../components/ui/icons';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import ParticleField from '../components/ui/ParticleField';
import Reveal from '../components/ui/Reveal';
import '../styles/landing.css';

function Feature({ id, eyebrow, title, body, points, children }) {
    return (
        <section className="feature" id={id}>
            <div className="landing-wrap feature-grid">
                <Reveal className="feature-text">
                    <div className="eyebrow">{eyebrow}</div>
                    <h2>{title}</h2>
                    <p>{body}</p>
                    <ul className="feature-points">
                        {points.map((p) => <li key={p}><Check aria-hidden="true" />{p}</li>)}
                    </ul>
                </Reveal>
                <Reveal index={2}>{children}</Reveal>
            </div>
        </section>
    );
}

// The path a vehicle takes through the garage — each step is a screen in the app
const STEPS = [
    { title: 'Book', text: 'The receptionist registers the customer and vehicle, then books an appointment.' },
    { title: 'Repair', text: 'A job card is opened, inspected and moved from open to completed by the mechanic.' },
    { title: 'Parts', text: 'The storekeeper dispenses spare parts to the job card and restocks from suppliers.' },
    { title: 'Bill', text: 'An invoice is raised with line items and payments are recorded until it is paid.' },
];

export default function Landing() {
    const { user } = useAuth();
    if (user) return <Navigate to="/overview" replace />;

    return (
        <div className="landing">
            <header className="lnav">
                <div className="landing-wrap lnav-inner">
                    <Logo light />
                    <nav className="lnav-links" aria-label="Sections">
                        <a href="#features">Features</a>
                        <a href="#how">How it works</a>
                        <a href="#staff">For workshop staff</a>
                    </nav>
                    <Button to="/login" pill>Log in</Button>
                </div>
            </header>

            <main>
                <section className="hero">
                    <ParticleField shape="ambient" count={46} interactive={false} className="hero-ambient" />
                    <div className="landing-wrap hero-grid">
                        <div>
                            <Reveal as="h1">Your complete garage workspace, without the paperwork.</Reveal>
                            <Reveal index={1}>
                                <div className="eyebrow">Workshop &amp; garage management</div>
                                <p className="hero-copy">
                                    Customers, appointments, job cards, spare parts, invoices and payroll —
                                    one system for the front desk, the workshop floor and the stores.
                                </p>
                            </Reveal>
                            <Reveal index={2} className="hero-actions">
                                <Button to="/register" pill size="lg">Create an account <ArrowRight aria-hidden="true" /></Button>
                                <Link to="/login" className="link-ghost">Log in</Link>
                            </Reveal>
                        </div>
                        <div className="hero-visual">
                            <ParticleField shape="wheel" count={260} />
                        </div>
                    </div>
                </section>

                <div id="features">
                    <Feature eyebrow="Front desk" title="Every customer, vehicle and appointment in one place."
                             body="Register vehicle owners and their vehicles once. Book service appointments against them and keep each booking's status up to date."
                             points={['Customer and vehicle records', 'Appointments with date, service type and notes', 'Status moves from scheduled to completed']}>
                        <div className="mock">
                            <div className="card mock-row">
                                <div><div className="mock-title">Chamari Gunasekara</div><div className="mock-sub"><span className="plate">WP-CB-4821</span> · Toyota Axio</div></div>
                                <CalendarDays aria-hidden="true" width={20} />
                            </div>
                            <div className="card">
                                <div className="mock-row"><div className="mock-title">Full service</div><Badge>SCHEDULED</Badge></div>
                                <div className="mock-sub">01 Oct · 14:00</div>
                            </div>
                            <div className="card">
                                <div className="mock-row"><div className="mock-title">Brake inspection</div><Badge>CONFIRMED</Badge></div>
                                <div className="mock-sub">02 Oct · 09:30 · customer will wait on site</div>
                            </div>
                        </div>
                    </Feature>

                    <Feature eyebrow="Workshop" title="Job cards that follow the repair from open to done."
                             body="Open a job card for a vehicle, assign a mechanic and track its status. Record inspection results against the vehicle as the work is checked."
                             points={['Numbered job cards with running cost', 'Mechanics update the repair status', 'Inspection history per vehicle']}>
                        <div className="mock">
                            <div className="card">
                                <div className="mock-row"><div className="mock-title mono">JC-1001</div><Badge>IN_PROGRESS</Badge></div>
                                <div className="mock-sub"><span className="plate">WP-CB-4821</span> · mechanic nuwan</div>
                            </div>
                            <div className="card">
                                <div className="mock-row"><div className="mock-title mono">JC-1002</div><Badge>OPEN</Badge></div>
                                <div className="mock-sub"><span className="plate">WP-KA-9012</span> · unassigned</div>
                            </div>
                            <div className="card mock-row">
                                <div className="row"><ClipboardCheck aria-hidden="true" width={18} /><span className="mock-title">Inspection: lights, tyres, fluids</span></div>
                                <Badge>PASSED</Badge>
                            </div>
                        </div>
                    </Feature>

                    <Feature eyebrow="Inventory" title="Spare parts that tell you when to reorder."
                             body="Keep a parts catalogue with prices, stock and reorder levels. Restock from suppliers, dispense parts to job cards, and see every movement in the history."
                             points={['Low-stock flag at the reorder level', 'Restock and dispense with a full transaction log', 'Supplier directory linked to parts']}>
                        <div className="mock">
                            <div className="card mock-row">
                                <div><div className="mock-title">Ceramic brake pad set (front)</div><div className="mock-sub">2 left · reorder at 5</div></div>
                                <Badge tone="warning">Low stock</Badge>
                            </div>
                            <div className="card mock-row">
                                <div><div className="mock-title">Oil filter</div><div className="mock-sub">38 in stock · reorder at 10</div></div>
                                <Badge tone="success">In stock</Badge>
                            </div>
                            <div className="card mock-row">
                                <div className="row"><Package aria-hidden="true" width={18} /><span className="mock-title">20 × Oil filter</span></div>
                                <Badge>RESTOCK</Badge>
                            </div>
                        </div>
                    </Feature>

                    <Feature eyebrow="Billing" title="Invoices and payments without a calculator."
                             body="Build an invoice from line items, link it to a job card, and record cash, card or transfer payments. The invoice moves from pending to partial to paid on its own."
                             points={['Line items added up for you', 'Part payments are tracked', 'Revenue and pending invoices in reports']}>
                        <div className="mock">
                            <div className="card">
                                <div className="mock-row"><div className="mock-title">Invoice #2</div><Badge>PARTIAL</Badge></div>
                                <div className="mock-sub">Labour — brake service · Brake pad set</div>
                                <div className="mock-row" style={{ marginTop: 10 }}><span className="mock-sub">Total</span><span className="mock-title tnum">Rs. 18,500.00</span></div>
                            </div>
                            <div className="card mock-row">
                                <div className="row"><Receipt aria-hidden="true" width={18} /><span className="mock-title">Payment · CARD</span></div>
                                <span className="mock-title tnum">Rs. 10,000.00</span>
                            </div>
                        </div>
                    </Feature>

                    <Feature id="staff" eyebrow="For workshop staff" title="Each role sees the screens it needs."
                             body="Admins also manage employee records, monthly salary payments and reports on revenue, payroll and work completed."
                             points={['Role-based access after log in', 'Employees, payroll and login accounts', 'Reports on income and job cards per employee']}>
                        <div className="mock role-grid">
                            <div className="card"><CalendarDays aria-hidden="true" width={20} /><div className="mock-title">Receptionist</div><div className="mock-sub">Customers, vehicles, appointments, billing</div></div>
                            <div className="card"><Wrench aria-hidden="true" width={20} /><div className="mock-title">Mechanic</div><div className="mock-sub">Job cards, inspections, parts</div></div>
                            <div className="card"><Package aria-hidden="true" width={20} /><div className="mock-title">Storekeeper</div><div className="mock-sub">Spare parts, stock, suppliers</div></div>
                            <div className="card"><Users aria-hidden="true" width={20} /><div className="mock-title">Admin</div><div className="mock-sub">Everything, plus staff and reports</div></div>
                        </div>
                    </Feature>
                </div>

                <section className="stats" id="how" aria-labelledby="how-title">
                    <div className="landing-wrap">
                        <div className="eyebrow" id="how-title">How it works</div>
                        <div className="steps-grid">
                            {STEPS.map((step, i) => (
                                <Reveal key={step.title} index={i}>
                                    <div className="stats-num tnum">0{i + 1}</div>
                                    <div className="stats-label">{step.title}</div>
                                    <p className="step-text">{step.text}</p>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="cta">
                    <Reveal className="landing-wrap">
                        <h2>Put the clipboard down.</h2>
                        <Button to="/register" pill size="lg">Create an account <ArrowRight aria-hidden="true" /></Button>
                    </Reveal>
                </section>
            </main>

            <footer className="lfoot">
                <div className="landing-wrap lfoot-inner">
                    <span>ScannerPoint Garage Workspace</span>
                    <span>Contact: <a href="mailto:support@scannerpoint.local">support@scannerpoint.local</a></span>
                </div>
            </footer>
        </div>
    );
}
