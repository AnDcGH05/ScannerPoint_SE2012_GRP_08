import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/customers')
            .then((response) => {
                setCustomers(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading customers...</p>;

    return (
        <div>
            <h2>Customer List</h2>
            <ul>
                {customers.map((c) => (
                    <li key={c.id}>{c.name} - {c.phone}</li>
                ))}
            </ul>
        </div>
    );
}