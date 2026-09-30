import { CarFront } from './icons';
import { Link } from 'react-router-dom';

export default function Logo({ to = '/', tagline, light }) {
    return (
        <Link to={to} className={`logo${light ? ' logo-light' : ''}`} aria-label="ScannerPoint home">
            <span className="logo-tile"><CarFront aria-hidden="true" /></span>
            <span className="logo-text">
                <span className="logo-word">ScannerPoint</span>
                {tagline && <span className="logo-tag">{tagline}</span>}
            </span>
        </Link>
    );
}
