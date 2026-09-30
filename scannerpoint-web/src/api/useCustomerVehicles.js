import { useState } from 'react';
import * as sample from '../data/sample';
import { useResource } from './useResource';

// The backend lists vehicles per customer, so screens pick a customer first, then a vehicle.
export function useCustomerVehicles() {
    const customers = useResource('/customers', sample.customers);
    const [customerId, setCustomerId] = useState('');
    const vehicles = useResource(customerId ? `/vehicles/customer/${customerId}` : null,
        sample.vehicles.filter((v) => String(v.customerId) === customerId));
    return { customers, customerId, setCustomerId, vehicles };
}
