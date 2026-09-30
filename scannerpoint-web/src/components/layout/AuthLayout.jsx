import Logo from '../ui/Logo';
import ParticleField from '../ui/ParticleField';
import '../../styles/auth.css';

// Charcoal brand panel (left) + form card (right). Stacks on small screens.
export default function AuthLayout({ children }) {
    return (
        <div className="auth">
            <aside className="auth-brand">
                <ParticleField shape="wheel" count={70} interactive={false} />
                <Logo light tagline="Garage workspace" />
                <div>
                    <div className="eyebrow">Workshop &amp; garage management</div>
                    <h1>Your complete garage workspace, without the paperwork.</h1>
                </div>
                <p className="auth-brand-foot">Job cards · Appointments · Spare parts · Billing · Payroll</p>
            </aside>
            <main className="auth-main">{children}</main>
        </div>
    );
}
