// Sample rows shown only in development preview mode (no backend session).
// Every object has the same shape as the matching backend response DTO.

export const customers = [
    { id: 1, name: 'Chamari Gunasekara', email: 'chamari@example.com', phone: '0771234567', address: 'Malabe' },
    { id: 2, name: 'Tharindu Rajapaksha', email: 'tharindu@example.com', phone: '0719876543', address: 'Kaduwela' },
    { id: 3, name: 'Sanduni Herath', email: null, phone: '0765550142', address: 'Battaramulla' },
];

export const vehicles = [
    { id: 1, licensePlate: 'WP-CB-4821', make: 'Toyota', model: 'Axio', customerId: 1, customerName: 'Chamari Gunasekara' },
    { id: 2, licensePlate: 'WP-KA-9012', make: 'Honda', model: 'Vezel', customerId: 2, customerName: 'Tharindu Rajapaksha' },
];

export const appointments = [
    { id: 1, customerId: 1, customerName: 'Chamari Gunasekara', vehicleId: 1, licensePlate: 'WP-CB-4821', appointmentDate: '2026-10-01T14:00:00', serviceType: 'Full service', status: 'SCHEDULED', notes: null },
    { id: 2, customerId: 2, customerName: 'Tharindu Rajapaksha', vehicleId: 2, licensePlate: 'WP-KA-9012', appointmentDate: '2026-10-02T09:30:00', serviceType: 'Brake inspection', status: 'CONFIRMED', notes: 'Customer will wait on site' },
];

export const jobCards = [
    { id: 1, cardNumber: 'JC-1001', status: 'IN_PROGRESS', totalCost: 18500, vehicleId: 1, licensePlate: 'WP-CB-4821', mechanicId: 2, mechanicName: 'nuwan' },
    { id: 2, cardNumber: 'JC-1002', status: 'OPEN', totalCost: 6200, vehicleId: 2, licensePlate: 'WP-KA-9012', mechanicId: null, mechanicName: 'Unassigned' },
    { id: 3, cardNumber: 'JC-0998', status: 'COMPLETED', totalCost: 42750, vehicleId: 1, licensePlate: 'WP-CB-4821', mechanicId: 2, mechanicName: 'nuwan' },
];

export const inspections = [
    { id: 1, details: 'Front brake pads at 3 mm. Replace soon.', resultStatus: 'NEEDS_ATTENTION', inspectionDate: '2026-09-28T10:15:00' },
    { id: 2, details: 'Lights, tyres and fluid levels checked.', resultStatus: 'PASSED', inspectionDate: '2026-08-12T15:40:00' },
];

export const spareParts = [
    { id: 1, partNumber: 'BRK-2210', name: 'Ceramic brake pad set (front)', description: null, price: 8900, quantityInStock: 2, reorderLevel: 5, isLowStock: true, supplierId: 1 },
    { id: 2, partNumber: 'OIL-5W30', name: 'Synthetic 5W-30 engine oil (4 L)', description: null, price: 12500, quantityInStock: 1, reorderLevel: 6, isLowStock: true, supplierId: 2 },
    { id: 3, partNumber: 'FLT-0911', name: 'Oil filter', description: null, price: 1450, quantityInStock: 38, reorderLevel: 10, isLowStock: false, supplierId: 1 },
];

export const suppliers = [
    { id: 1, name: 'Lanka Auto Parts', contactPerson: 'Ruwan Dias', email: 'sales@lankaautoparts.example', phone: '0112345678', address: 'Panchikawatta, Colombo 10' },
    { id: 2, name: 'Ceylon Lubricants', contactPerson: 'Nadeesha Peiris', email: 'orders@ceylonlube.example', phone: '0117654321', address: 'Peliyagoda' },
];

export const transactions = [
    { transactionId: 3, partName: 'Oil filter', transactionType: 'RESTOCK', quantity: 20, transactionDate: '2026-09-29T09:05:00', notes: 'Monthly order' },
    { transactionId: 2, partName: 'Ceramic brake pad set (front)', transactionType: 'DISPENSE', quantity: 1, transactionDate: '2026-09-28T11:30:00', notes: 'Job card JC-1001' },
    { transactionId: 1, partName: 'Synthetic 5W-30 engine oil (4 L)', transactionType: 'DISPENSE', quantity: 2, transactionDate: '2026-09-27T14:10:00', notes: 'Job card JC-0998' },
];

export const invoices = [
    { id: 1, customerId: 1, jobCardId: 3, totalAmount: 42750, status: 'PAID', createdAt: '2026-09-20T16:00:00' },
    { id: 2, customerId: 1, jobCardId: 1, totalAmount: 18500, status: 'PENDING', createdAt: '2026-09-29T12:30:00' },
];

export const summary = { totalRevenue: 42750, totalInvoices: 2, pendingInvoices: 1 };

export const employees = [
    { id: 1, fullName: 'Nuwan Perera', nic: '199012345678', phone: '0771112223', email: 'nuwan@scannerpoint.local', position: 'MECHANIC', hireDate: '2023-03-01', monthlySalary: 95000, active: true, userId: 2, username: 'nuwan' },
    { id: 2, fullName: 'Dilani Jayasuriya', nic: '923456789V', phone: '0714445556', email: 'dilani@scannerpoint.local', position: 'RECEPTIONIST', hireDate: '2024-01-15', monthlySalary: 70000, active: true, userId: 3, username: 'dilani' },
    { id: 3, fullName: 'Kasun Silva', nic: '198876543210', phone: '0767778889', email: null, position: 'STOREKEEPER', hireDate: '2022-08-10', monthlySalary: 65000, active: false, userId: null, username: null },
];

export const salaryPayments = [
    { id: 2, employeeId: 2, employeeName: 'Dilani Jayasuriya', payMonth: '2026-09', amount: 70000, paymentDate: '2026-09-25', notes: null },
    { id: 1, employeeId: 1, employeeName: 'Nuwan Perera', payMonth: '2026-09', amount: 95000, paymentDate: '2026-09-25', notes: 'Includes overtime' },
];

export const employeeReport = {
    totalRevenue: 42750, totalSalaryPaid: 165000, netIncome: -122250, monthlyPayroll: 165000, activeEmployees: 2,
    employees: [
        { employeeId: 1, fullName: 'Nuwan Perera', position: 'MECHANIC', active: true, jobCardsAssigned: 2, jobCardsCompleted: 1, salaryPaid: 95000 },
        { employeeId: 2, fullName: 'Dilani Jayasuriya', position: 'RECEPTIONIST', active: true, jobCardsAssigned: 0, jobCardsCompleted: 0, salaryPaid: 70000 },
        { employeeId: 3, fullName: 'Kasun Silva', position: 'STOREKEEPER', active: false, jobCardsAssigned: 0, jobCardsCompleted: 0, salaryPaid: 0 },
    ],
};

export const users = [
    { id: 1, username: 'admin', email: 'admin@scannerpoint.local', roles: ['ROLE_ADMIN'] },
    { id: 2, username: 'nuwan', email: 'nuwan@scannerpoint.local', roles: ['ROLE_MECHANIC'] },
    { id: 3, username: 'dilani', email: 'dilani@scannerpoint.local', roles: ['ROLE_RECEPTIONIST'] },
    { id: 4, username: 'chamari', email: 'chamari@example.com', roles: ['ROLE_USER'] },
];
