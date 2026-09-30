import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from './errors';

/**
 * Runs a write request and tracks busy / error / success for the form that owns it.
 *   const action = useAction();
 *   action.run(() => API.post('/customers', body), (res) => `Added ${res.data.name}`);
 */
export function useAction() {
    const { user } = useAuth();
    const [state, setState] = useState({ busy: false, error: '', success: '' });

    const run = useCallback(async (request, successMessage) => {
        if (user?.demo) {
            setState({ busy: false, success: '', error: 'Preview mode shows sample data only. Log in to save changes.' });
            return null;
        }
        setState({ busy: true, error: '', success: '' });
        try {
            const res = await request();
            const success = typeof successMessage === 'function' ? successMessage(res) : successMessage || '';
            setState({ busy: false, error: '', success });
            return res;
        } catch (err) {
            setState({ busy: false, success: '', error: getErrorMessage(err) });
            return null;
        }
    }, [user?.demo]);

    const clear = useCallback(() => setState({ busy: false, error: '', success: '' }), []);
    return { ...state, run, clear };
}
