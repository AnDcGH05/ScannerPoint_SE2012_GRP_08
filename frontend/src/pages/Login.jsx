import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/errors';
import Notice from '../components/Notice';

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    if (user) return <Navigate to="/customers" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await login(form.username, form.password);
            navigate('/customers');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="login-wrap">
            <form className="card login-card" onSubmit={handleSubmit}>
                <h1>Scanner Point</h1>
                <p className="muted">Sign in to the garage management system</p>
                <Notice>{error}</Notice>
                <label>Username
                    <input value={form.username} autoFocus required
                           onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </label>
                <label>Password
                    <input type="password" value={form.password} required
                           onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </label>
                <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>
        </div>
    );
}
