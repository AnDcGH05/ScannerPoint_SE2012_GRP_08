import Input from './Input';

// Customer dropdown (and optionally the dependent vehicle dropdown) driven by useCustomerVehicles()
export default function CustomerSelect({ picker, onChange, vehicleId, onVehicle }) {
    const { customers, customerId, setCustomerId, vehicles } = picker;
    return (
        <>
            <Input label="Customer" as="select" value={customerId} required error={customers.error}
                   onChange={(e) => { setCustomerId(e.target.value); onVehicle?.(''); onChange?.(); }}>
                <option value="">{customers.loading ? 'Loading customers…' : 'Select a customer…'}</option>
                {customers.data.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </Input>
            {onVehicle && (
                <Input label="Vehicle" as="select" value={vehicleId} required disabled={!customerId} error={vehicles.error}
                       onChange={(e) => onVehicle(e.target.value)}
                       hint={customerId && !vehicles.loading && !vehicles.error && vehicles.data.length === 0 ? 'This customer has no vehicles. Add one under Vehicles first.' : undefined}>
                    <option value="">{customerId ? 'Select a vehicle…' : 'Choose a customer first'}</option>
                    {vehicles.data.map((v) => <option key={v.id} value={v.id}>{v.licensePlate} — {v.make} {v.model}</option>)}
                </Input>
            )}
        </>
    );
}
