// Turns an axios error into a readable message for the UI
export function getErrorMessage(error) {
    if (!error.response) {
        // The browser hides the reason, but a blocked PATCH is almost always the backend's CORS list
        if (error.config?.method === 'patch') {
            return 'The backend blocked this update. Add "PATCH" to allowedMethods in CorsConfig.java and restart it.';
        }
        return 'Cannot reach the server. Is the backend running on port 8081?';
    }
    const { status, data } = error.response;
    if (Array.isArray(data?.errors) && data.errors.length) {
        return data.errors.map((e) => e.defaultMessage).join(', ');
    }
    if (status === 403) return 'You do not have permission to do this.';
    if (status === 401) return 'Invalid username or password.';
    if (data?.message && data.message !== 'No message available') return data.message;
    if (status === 400) return 'The server rejected this request. Check the fields and try again.';
    return `Request failed (${status}).`;
}

// Bean-validation errors keyed by field name, for inline messages under inputs
export function getFieldErrors(error) {
    const list = error.response?.data?.errors;
    if (!Array.isArray(list)) return {};
    return Object.fromEntries(list.filter((e) => e.field).map((e) => [e.field, e.defaultMessage]));
}
