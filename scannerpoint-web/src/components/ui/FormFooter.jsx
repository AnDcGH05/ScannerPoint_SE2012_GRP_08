import Button from './Button';
import Notice from './Notice';

// Error + success messages and the submit button, shared by every form
export default function FormFooter({ action, label, busyLabel = 'Saving…', pulse, extraError, children }) {
    return (
        <div className="span-2 stack">
            <Notice>{action.error || extraError}</Notice>
            <Notice type="success">{action.success}</Notice>
            <div className="row">
                <Button type="submit" pulse={pulse} disabled={action.busy}>{action.busy ? busyLabel : label}</Button>
                {children}
            </div>
        </div>
    );
}
