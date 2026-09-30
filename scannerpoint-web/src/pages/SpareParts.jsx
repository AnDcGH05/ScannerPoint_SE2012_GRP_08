import { useState } from 'react';
import API from '../api/axios';
import { useAction } from '../api/useAction';
import { useResource } from '../api/useResource';
import { can } from '../components/layout/nav';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import FormFooter from '../components/ui/FormFooter';
import { money } from '../components/ui/format';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import PreviewTag from '../components/ui/PreviewTag';
import { useAuth } from '../context/AuthContext';
import * as sample from '../data/sample';

const EMPTY = { partNumber: '', name: '', description: '', price: '', quantityInStock: '', reorderLevel: '', supplierId: '' };

export default function SpareParts() {
    const { user } = useAuth();
    const canWrite = can(user.role, 'parts.write');
    const parts = useResource('/spare-parts', sample.spareParts);
    const suppliers = useResource(can(user.role, 'suppliers') ? '/suppliers' : null, sample.suppliers);
    const action = useAction();
    const [form, setForm] = useState(EMPTY);
    const [lowOnly, setLowOnly] = useState(false);
    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await action.run(() => API.post('/spare-parts', {
            partNumber: form.partNumber.trim(),
            name: form.name.trim(),
            description: form.description.trim() || null,
            price: Number(form.price),
            quantityInStock: Number(form.quantityInStock),
            reorderLevel: Number(form.reorderLevel),
            supplierId: form.supplierId ? Number(form.supplierId) : null,
        }), (r) => `Part ${r.data.partNumber} added.`);
        if (res) { parts.setData((list) => [...list, res.data]); setForm(EMPTY); }
    };

    const supplierName = (id) => suppliers.data.find((s) => s.id === id)?.name;
    const low = parts.data.filter((p) => p.isLowStock);
    const rows = lowOnly ? low : parts.data;
    const columns = [
        { key: 'partNumber', label: 'Part no.', className: 'mono' },
        { key: 'name', label: 'Name', className: 'strong', render: (p) => <>{p.name}{p.description && <div className="small muted" style={{ fontWeight: 400 }}>{p.description}</div>}</> },
        ...(canWrite ? [{ key: 'supplierId', label: 'Supplier', render: (p) => supplierName(p.supplierId) || '—' }] : []),
        { key: 'price', label: 'Unit price', num: true, render: (p) => money(p.price) },
        { key: 'quantityInStock', label: 'In stock', num: true },
        { key: 'reorderLevel', label: 'Reorder at', num: true },
        { key: 'isLowStock', label: 'Status', render: (p) => (p.isLowStock ? <Badge tone="warning">Low stock</Badge> : <Badge tone="success">In stock</Badge>) },
    ];

    return (
        <>
            <PageHeader eyebrow="Inventory · Spare parts" title="Spare parts" description="The parts catalogue with stock and reorder levels.">
                <PreviewTag />
            </PageHeader>
            <div className="stack-lg">
                {canWrite && (
                    <Card title="Add spare part">
                        <form className="form-grid" onSubmit={handleSubmit}>
                            <Input label="Part number" value={form.partNumber} onChange={set('partNumber')} placeholder="BRK-2210" required />
                            <Input label="Name" value={form.name} onChange={set('name')} required />
                            <Input label="Unit price (Rs.)" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required />
                            <Input label="Opening quantity" type="number" min="0" step="1" value={form.quantityInStock} onChange={set('quantityInStock')} required />
                            <Input label="Reorder level" type="number" min="0" step="1" value={form.reorderLevel} onChange={set('reorderLevel')} required hint="The part is flagged as low stock at or below this quantity." />
                            <Input label="Supplier" labelAside={<small>Optional</small>} as="select" value={form.supplierId} onChange={set('supplierId')}>
                                <option value="">No supplier</option>
                                {suppliers.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Input>
                            <Input className="span-2" label="Description" labelAside={<small>Optional</small>} value={form.description} onChange={set('description')} />
                            <FormFooter action={action} label="Add spare part" />
                        </form>
                    </Card>
                )}
                <div className="chips" role="group" aria-label="Filter parts">
                    <button type="button" className="chip" aria-pressed={!lowOnly} onClick={() => setLowOnly(false)}>All parts ({parts.data.length})</button>
                    <button type="button" className="chip" aria-pressed={lowOnly} onClick={() => setLowOnly(true)}>Low stock ({low.length})</button>
                </div>
                <Card flush>
                    <DataTable columns={columns} rows={rows} source={parts} empty={lowOnly ? 'No parts are low on stock.' : 'No spare parts yet.'} />
                </Card>
            </div>
        </>
    );
}
