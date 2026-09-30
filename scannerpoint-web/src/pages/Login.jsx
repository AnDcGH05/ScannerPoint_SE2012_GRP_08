import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import AuthLayout from '../components/layout/AuthLayout';
import { ArrowRight, Lock, User } from '../components/ui/icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Notice from '../components/ui/Notice';
import PasswordToggle from '../components/ui/PasswordToggle';
import { ROLE_LABEL, useAuth } from '../context/AuthContext';

const PREVIEW_ROLES = ['admin', 'receptionist', 'mechanic', 'storekeeper'];

export default function Login() {
    const { user, login, preview } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ username: location.state?.username || '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    if (user) return <Navigate to="/overview" replace />;

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await login(form.username.trim(), form.password);
            navigate('/overview');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout>
            <Card className="auth-card">
                <h2>Welcome back</h2>
                <p className="lead">Log in to your garage workspace.</p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <Notice type="success">{location.state?.registered && 'Account created. Log in with your username and password.'}</Notice>
                    <Notice>{error}</Notice>
                    <Input label="Username" icon={User} value={form.username} onChange={set('username')}
                           autoComplete="username" autoFocus required />
                    <Input label="Password" icon={Lock} type={showPassword ? 'text' : 'password'} value={form.password}
                           onChange={set('password')} autoComplete="current-password" required
                           action={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />} />
                    <Button type="submit" size="lg" block disabled={busy}>
                        {busy ? 'Logging in…' : <>Log in <ArrowRight aria-hidden="true" /></>}
                    </Button>
                </form>
                <p className="auth-alt">Don't have an account? <Link to="/register">Register</Link></p>

                {import.meta.env.DEV && (
                    <div className="auth-preview">
                        Development only — look around as a role with sample data, no backend needed:
                        <div className="row">
                            {PREVIEW_ROLES.map((role) => (
                                <Button key={role} variant="secondary" size="sm" onClick={() => { preview(role); navigate('/overview'); }}>
                                    {ROLE_LABEL[role]}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </AuthLayout>
    );
}
