import { Eye, EyeOff } from './icons';

export default function PasswordToggle({ shown, onToggle }) {
    return (
        <button type="button" className="field-action" onClick={onToggle}
                aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown}>
            {shown ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
    );
}
