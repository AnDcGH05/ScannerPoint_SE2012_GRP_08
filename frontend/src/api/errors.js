// Turns an axios error into a readable message for the UI
export function getErrorMessage(error) {
    if (!error.response) return 'Cannot reach the server. Is the backend running on port 8081?';
    const { status, data } = error.response;
    if (status === 403) return 'You do not have permission to do this.';
    if (status === 401) return 'Invalid username or password.';
    if (Array.isArray(data?.errors) && data.errors.length) {
        return data.errors.map((e) => e.defaultMessage).join(', ');
    }
    if (data?.message) return data.message;
    return `Request failed (${status}).`;
}
