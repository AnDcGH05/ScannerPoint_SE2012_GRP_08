import { useAuth } from '../../context/AuthContext';

// Shown in page headers while looking around in development preview mode
export default function PreviewTag() {
    const { user } = useAuth();
    return user?.demo ? <span className="tag-demo">Sample data</span> : null;
}
