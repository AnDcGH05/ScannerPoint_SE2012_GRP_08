import { ArrowRight, Check, Info, Lock, Mail, User } from '../components/ui/icons';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage, getFieldErrors } from '../api/errors';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Notice from '../components/ui/Notice';
import PasswordToggle from '../components/ui/PasswordToggle';
import { useAuth } from '../context/AuthContext';

const EMPTY = { username: '', email: '', password: '' };
const MIN_PASSWORD = 6;

export default function Register() {
    const { user, register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [busy, setBusy] = useState(false);

    if (user) return <Navigate to="/overview" replace />;

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
    const passwordOk = form.password.length >= MIN_PASSWORD;
    const remaining = MIN_PASSWORD - form.password.length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        if (!passwordOk) {
            setFieldErrors({ password: `Password must be at least ${MIN_PASSWORD} characters` });
            return;
        }
        setBusy(true);
        try {
            const username = form.username.trim();
            await register({ username, email: form.email.trim(), password: form.password });
            navigate('/login', { state: { registered: true, username } });
        } catch (err) {
            const fields = getFieldErrors(err);
            setFieldErrors(fields);
            if (Object.keys(fields).length) return;
            // The backend currently answers failed registrations with an empty 401/500 (its /error page
            // is behind the login), so there is no message to show. A taken username or email is the usual cause.
            const status = err.response?.status;
            const blank = !err.response?.data?.message;
            setError(blank && (status === 401 || status === 500)
                ? 'Could not create the account. This username or email may already be registered.'
                : getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout>
            <Card className="auth-card">
                <h2>Create account</h2>
                <p className="lead">New accounts start without a staff role. An admin assigns it.</p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <Notice>{error}</Notice>
                    <Input label="Username" icon={User} value={form.username} onChange={set('username')}
                           autoComplete="username" autoFocus required error={fieldErrors.username} />
                    <Input label="Email" icon={Mail} type="email" value={form.email} onChange={set('email')}
                           autoComplete="email" required error={fieldErrors.email} />
                    <Input label="Password" icon={Lock} type={showPassword ? 'text' : 'password'} value={form.password}
                           onChange={set('password')} autoComplete="new-password" required minLength={MIN_PASSWORD}
                           error={fieldErrors.password} hintOk={passwordOk}
                           hint={passwordOk
                               ? <><Check aria-hidden="true" />At least {MIN_PASSWORD} characters</>
                               : <><Info aria-hidden="true" />Minimum {MIN_PASSWORD} characters{form.password && ` — ${remaining} more to go`}</>}
                           action={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />} />
                    <Button type="submit" size="lg" block disabled={busy}>
                        {busy ? 'Creating account…' : <>Create account <ArrowRight aria-hidden="true" /></>}
                    </Button>
                </form>
                <p className="auth-alt">Already registered? <Link to="/login">Log in</Link></p>
            </Card>
        </AuthLayout>
    );
}
