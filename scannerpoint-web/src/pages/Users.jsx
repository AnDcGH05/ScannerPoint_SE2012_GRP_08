import { useState } from 'react';
import { useResource } from '../api/useResource';
import { initials } from '../components/layout/Sidebar';
import { Search } from '../components/ui/icons';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import { useAuth } from '../context/AuthContext';
import * as sample from '../data/sample';

const TONE = { ADMIN: 'danger', MECHANIC: 'warning', RECEPTIONIST: 'success', STOREKEEPER: 'neutral', USER: 'orange' };
const short = (role) => role.replace(/^ROLE_/, '');

export default function Users() {
    const { user: me } = useAuth();
    const users = useResource('/users', sample.users);
    const [search, setSearch] = useState('');
    const q = search.toLowerCase();
    const rows = users.data.filter((u) => [u.username, u.email, ...(u.roles || [])].some((v) => (v || '').toLowerCase().includes(q)));

    const columns = [
        { key: 'username', label: 'Username', render: (u) => (
            <div className="row" style={{ flexWrap: 'nowrap' }}>
                <span className="avatar">{initials(u.username)}</span>
                <div>
                    <div className="strong">{u.username}{u.username === me.username && <span className="muted small"> (you)</span>}</div>
                    <div className="small muted tnum">ID {u.id}</div>
                </div>
            </div>
        ) },
        { key: 'email', label: 'Email' },
        { key: 'roles', label: 'Roles', render: (u) => <div className="row">{[...u.roles].sort().map((r) => <Badge key={r} tone={TONE[short(r)]}>{short(r)}</Badge>)}</div> },
    ];

    return (
        <>
            <PageHeader eyebrow="Administration · Users" title="User accounts" description="Everyone who can log in, with the roles the backend has given them.">
                <PreviewTag />
            </PageHeader>
            <Card flush title={`Accounts (${rows.length})`}
                  aside={<Input label={<span className="sr-only">Search users</span>} icon={Search} type="search" placeholder="Search username, email or role" value={search} onChange={(e) => setSearch(e.target.value)} />}>
                <DataTable columns={columns} rows={rows} source={users} empty="No users match." />
            </Card>
        </>
    );
}
