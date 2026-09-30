import { useCallback, useEffect, useState } from 'react';
import API from './axios';
import { getErrorMessage } from './errors';
import { useAuth } from '../context/AuthContext';

const EMPTY = [];

/**
 * GET `path` from the backend.
 * - Signed-in users get live data (or an error — never sample data).
 * - Preview mode (no backend session) gets `sample`, flagged with live=false.
 * Pass path=null to wait (e.g. until a customer is chosen).
 */
export function useResource(path, sample, empty = EMPTY) {
    const { user } = useAuth();
    const preview = !!user?.demo;
    const [state, setState] = useState({ path: null, data: empty, error: '' });
    const [edited, setEdited] = useState(null); // local changes made in preview mode
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        setEdited(null);
        if (preview || !path) return;
        let on = true;
        API.get(path)
            .then((res) => on && setState({ path, data: res.data, error: '' }))
            .catch((err) => on && setState({ path, data: empty, error: getErrorMessage(err) }));
        return () => { on = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, preview, nonce]);

    const reload = useCallback(() => setNonce((n) => n + 1), []);
    const apply = (fn, current) => (typeof fn === 'function' ? fn(current) : fn);
    const setData = useCallback((fn) => {
        if (preview) setEdited((prev) => ({ data: apply(fn, prev ? prev.data : sample) }));
        else setState((s) => ({ ...s, data: apply(fn, s.data) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preview, sample]);

    if (preview) return { data: edited ? edited.data : sample, loading: false, error: '', live: false, reload, setData };
    if (!path) return { data: empty, loading: false, error: '', live: true, reload, setData };
    const fresh = state.path === path; // hide the previous path's rows while a new one loads
    return { data: fresh ? state.data : empty, loading: !fresh, error: fresh ? state.error : '', live: true, reload, setData };
}
