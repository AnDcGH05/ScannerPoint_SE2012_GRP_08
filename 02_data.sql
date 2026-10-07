--  Sample data set to populate the Scannerpoint database 
--  The data follows the actual order of work: bookings are created as PENDING --> deposits are verified --> bookings are confirmed --> vehicles are checked in --> each job card moves through the workflow stages.
USE scannerpoint;

-- Aneesha(IT25100952): USER_ACCOUNT 
INSERT INTO user_account (user_id, username, password_hash, email, user_type, is_active, created_at) VALUES
 (1,  'nimal.perera',      '$2a$10$Q9xHk1sPZ0a8vN7m2LwYUe3C1mE6t9bR4yD7fK2pS5uW8zA1hJ0Gi', 'nimal.perera@gmail.com',      'CUSTOMER', TRUE, '2025-11-04 09:12:00'),
 (2,  'kumari.silva',      '$2a$10$W3eR5tY7uI9oP1aS3dF5gH7jK9lZ1xC3vB5nM7qW9eR1tY3uI5oP7', 'kumari.silva@yahoo.com',      'CUSTOMER', TRUE, '2025-12-01 14:40:00'),
 (3,  'ruwan.fernando',    '$2a$10$A1sD3fG5hJ7kL9zX1cV3bN5mQ7wE9rT1yU3iO5pA7sD9fG1hJ3kL5', 'ruwan.f@lankalogistics.lk',   'CUSTOMER', TRUE, '2026-01-15 10:05:00'),
 (4,  'dilani.jayasinghe', '$2a$10$Z9xC7vB5nM3qW1eR9tY7uI5oP3aS1dF9gH7jK5lZ3xC1vB9nM7qW5', 'dilani.j@gmail.com',          'CUSTOMER', TRUE, '2026-02-20 16:30:00'),
 (5,  'asanka.bandara',    '$2a$10$P0oI9uY8tR7eW6qA5sD4fG3hJ2kL1zX0cV9bN8mQ7wE6rT5yU4iO3', 'asanka.bandara@outlook.com',  'CUSTOMER', TRUE, '2026-03-02 11:20:00'),
 (6,  'shehani.wickrama',  '$2a$10$L1kJ2hG3fD4sA5qW6eR7tY8uI9oP0zX1cV2bN3mQ4wE5rT6yU7iO8', 'shehani.w@gmail.com',         'CUSTOMER', TRUE, '2026-04-11 08:55:00'),
 (7,  'tharindu.guna',     '$2a$10$M2nB3vC4xZ5lK6jH7gF8dS9aQ0wE1rT2yU3iO4pA5sD6fG7hJ8kL9', 'tharindu.g@gmail.com',        'CUSTOMER', TRUE, '2026-05-23 13:10:00'),
 (8,  'malini.herath',     '$2a$10$N3mB4vC5xZ6lK7jH8gF9dS0aQ1wE2rT3yU4iO5pA6sD7fG8hJ9kL0', 'malini.herath@gmail.com',     'CUSTOMER', TRUE, '2026-06-07 17:45:00'),
 (9,  'chamari.desilva',   '$2a$10$B4vC5xZ6lK7jH8gF9dS0aQ1wE2rT3yU4iO5pA6sD7fG8hJ9kL0mN1', 'chamari@scannerpoint.lk',     'EMPLOYEE', TRUE, '2025-10-01 08:00:00'),
 (10, 'kasun.ranasinghe',  '$2a$10$C5xZ6lK7jH8gF9dS0aQ1wE2rT3yU4iO5pA6sD7fG8hJ9kL0mN1bV2', 'kasun@scannerpoint.lk',       'EMPLOYEE', TRUE, '2025-10-01 08:05:00'),
 (11, 'pradeep.kumara',    '$2a$10$D6zX7lK8jH9gF0dS1aQ2wE3rT4yU5iO6pA7sD8fG9hJ0kL1mN2bV3', 'pradeep@scannerpoint.lk',     'EMPLOYEE', TRUE, '2025-10-01 08:10:00'),
 (12, 'suresh.nadarajah',  '$2a$10$E7xC8lK9jH0gF1dS2aQ3wE4rT5yU6iO7pA8sD9fG0hJ1kL2mN3bV4', 'suresh@scannerpoint.lk',      'EMPLOYEE', TRUE, '2025-10-01 08:15:00'),
 (13, 'ishan.weerasinghe', '$2a$10$F8cV9lK0jH1gF2dS3aQ4wE5rT6yU7iO8pA9sD0fG1hJ2kL3mN4bV5', 'ishan@scannerpoint.lk',       'EMPLOYEE', TRUE, '2025-10-01 08:20:00'),
 (14, 'lahiru.dissanayake','$2a$10$G9vB0lK1jH2gF3dS4aQ5wE6rT7yU8iO9pA0sD1fG2hJ3kL4mN5bV6', 'lahiru@scannerpoint.lk',      'EMPLOYEE', TRUE, '2025-10-01 08:25:00'),
 (15, 'roshan.peiris',     '$2a$10$H0bN1lK2jH3gF4dS5aQ6wE7rT8yU9iO0pA1sD2fG3hJ4kL5mN6bV7', 'roshan@scannerpoint.lk',      'EMPLOYEE', TRUE, '2025-10-01 07:30:00'),
 (16, 'ayesha.fernando',   '$2a$10$J1nM2lK3jH4gF5dS6aQ7wE8rT9yU0iO1pA2sD3fG4hJ5kL6mN7bV8', 'ayesha.fdo@gmail.com',        'CUSTOMER', TRUE, '2026-09-28 19:02:00'),
 (17, 'nuwan.jayawardena', '$2a$10$K2mN3lK4jH5gF6dS7aQ8wE9rT0yU1iO2pA3sD4fG5hJ6kL7mN8bV9', 'nuwan.jay@gmail.com',         'CUSTOMER', TRUE, '2026-09-30 21:15:00');

-- Aneesha(IT25100952): CUSTOMER 
INSERT INTO customer (customer_id, first_name, last_name, nic, street, city, postal_code, registered_date) VALUES
 (1,  'Nimal',   'Perera',      '198512304567', '45/2 Havelock Road',      'Colombo 05',   '00500', '2025-11-04'),
 (2,  'Kumari',  'Silva',       '876543210V',   '12 Stanley Tillekeratne Mw', 'Nugegoda',  '10250', '2025-12-01'),
 (3,  'Ruwan',   'Fernando',    '197908123456', '88 Galle Road',           'Dehiwala',     '10350', '2026-01-15'),
 (4,  'Dilani',  'Jayasinghe',  '199203456789', '7 Old Kesbewa Road',      'Maharagama',   '10280', '2026-02-20'),
 (5,  'Asanka',  'Bandara',     '820915678V',   '230 Kotte Road',          'Sri Jayawardenepura Kotte', '10100', '2026-03-02'),
 (6,  'Shehani', 'Wickramasinghe','199507891234', '19 Pannipitiya Road',   'Battaramulla', '10120', '2026-04-11'),
 (7,  'Tharindu','Gunawardena', '198811223344', '54 Station Road',         'Moratuwa',     '10400', '2026-05-23'),
 (8,  'Malini',  'Herath',      '756789012V',   '3 Kandy Road',            'Kelaniya',     '11600', '2026-06-07'),
 (16, 'Ayesha',  'Fernando',    '200104567890', '101 High Level Road',     'Nugegoda',     '10250', '2026-09-28'),
 (17, 'Nuwan',   'Jayawardena', '199912345678', '26 Duplication Road',     'Colombo 04',   '00400', '2026-09-30');

-- Aneesha(IT25100952): CUSTOMER_PHONE (multivalued attribute) 
INSERT INTO customer_phone (customer_id, phone_no, phone_type) VALUES
 (1, '0771234567', 'MOBILE'), (1, '0112345678', 'HOME'),
 (2, '0712233445', 'MOBILE'),
 (3, '0763344556', 'MOBILE'), (3, '0115566778', 'WORK'),
 (4, '0754455667', 'MOBILE'),
 (5, '0725566778', 'MOBILE'),
 (6, '0786677889', 'MOBILE'),
 (7, '0707788990', 'MOBILE'),
 (8, '0779988776', 'MOBILE'), (8, '0112233445', 'HOME'),
 (16,'0768899001', 'MOBILE'),
 (17,'0719900112', 'MOBILE');

-- Sohan(IT25100963): EMPLOYEE (disjoint specialisation stored with emp_role) 
INSERT INTO employee (employee_id, first_name, last_name, emp_role, phone_no, hire_date, specialization, hourly_rate) VALUES
 (9,  'Chamari', 'De Silva',     'RECEPTIONIST', '0771112233', '2022-02-01', NULL, NULL),
 (10, 'Kasun',   'Ranasinghe',   'RECEPTIONIST', '0772223344', '2023-06-15', NULL, NULL),
 (11, 'Pradeep', 'Kumara',       'MECHANIC',     '0773334455', '2019-04-01', 'Engine & Diagnostics', 1500.00),
 (12, 'Suresh',  'Nadarajah',    'MECHANIC',     '0774445566', '2020-09-10', 'Hybrid & Electrical',  1800.00),
 (13, 'Ishan',   'Weerasinghe',  'MECHANIC',     '0775556677', '2023-01-05', 'Suspension & Brakes',  1300.00),
 (14, 'Lahiru',  'Dissanayake',  'STOREKEEPER',  '0776667788', '2021-03-20', NULL, NULL),
 (15, 'Roshan',  'Peiris',       'ADMIN',        '0777778899', '2018-01-01', NULL, NULL);

-- Sewmini(IT25100962): SERVICE_TYPE – the three packages (needed before bookings)
-- Diagnostics has no fixed price: the Rs. 5,000 diagnostic fee is the base for the 50% deposit
INSERT INTO service_type (service_type_id, service_name, includes_work, pricing_type, base_price,
                          deposit_percent, labour_rate, service_interval_km, service_interval_months, is_active) VALUES
 (1, 'Full Service + Cleanup',             'Vacuuming, washing, engine tune-up and general repair',            'FIXED',    18000.00, 50.00, 2500.00, 5000, 6, TRUE),
 (2, 'General Repair + Brake Maintenance', 'Brake system cleaning, engine oil and oil filter change',          'FIXED',    12000.00, 50.00, 2500.00, 5000, 6, TRUE),
 (3, 'Diagnostics + Specific Repairs',     'Fault diagnosis; repairs priced after diagnosis and added to the bill', 'VARIABLE', 5000.00, 50.00, 3000.00, NULL, NULL, TRUE);

-- Aneesha(IT25100952): VEHICLE (registration numbers in the WP-CAV-9548 format) 
INSERT INTO vehicle (vehicle_id, customer_id, registration_no, make, model, manufacture_year, fuel_type,
                     current_mileage, last_service_date, last_service_mileage) VALUES
 (1,  1,  'WP-CAB-4521', 'Toyota',     'Axio',     2014, 'PETROL',   112500, '2026-09-03', 112480),
 (2,  1,  'WP-CAV-9548', 'Honda',      'Vezel',    2016, 'HYBRID',    78400, '2026-03-20',  72000),
 (3,  2,  'WP-CBA-7788', 'Suzuki',     'Wagon R',  2018, 'PETROL',    54200, '2026-09-05',  54150),
 (4,  3,  'SP-PC-5562',  'Toyota',     'Hilux',    2015, 'DIESEL',   168900, '2026-09-10', 168850),
 (5,  4,  'WP-CAQ-1203', 'Nissan',     'Leaf',     2019, 'ELECTRIC',  41000, '2026-03-30',  36500),
 (6,  5,  'NW-KP-8876',  'Mitsubishi', 'Montero',  2012, 'DIESEL',   205300, '2026-09-12', 205250),
 (7,  6,  'WP-CBH-5590', 'Toyota',     'Aqua',     2017, 'HYBRID',    96700, '2026-09-16',  96650),
 (8,  7,  'WP-PE-6031',  'Honda',      'Civic',    2013, 'PETROL',   134200, '2026-09-17', 134180),
 (9,  8,  'WP-CAD-9045', 'Suzuki',     'Alto',     2020, 'PETROL',    28900, '2025-12-10',  24000),
 (10, 3,  'SP-NC-4410',  'Toyota',     'KDH Van',  2014, 'DIESEL',   245000, '2026-09-24', 244980),
 (11, 16, 'WP-CBK-2207', 'Toyota',     'Yaris',    2021, 'PETROL',    18500, '2025-11-15',  13000),
 (12, 17, 'CP-CAR-3301', 'Toyota',     'Prius',    2018, 'HYBRID',    62300, NULL,          NULL);

-- Aneesha(IT25100952): VEHICLE_DOCUMENT (uploaded online, verified by the receptionist on arrival) 
INSERT INTO vehicle_document (document_id, vehicle_id, doc_type, document_no, file_path, expiry_date,
                              uploaded_at, status, verified_by, verified_at, reject_reason) VALUES
 (1, 1, 'DRIVING_LICENCE', 'B4521867', 'uploads/documents/v01-licence.pdf', '2030-06-30', '2026-08-30 10:10:00', 'VERIFIED', 9, '2026-09-03 09:05:00', NULL),
 (2, 1, 'INSURANCE', 'MV-2026-00001', 'uploads/documents/v01-insurance.pdf', '2027-03-31', '2026-08-30 10:10:00', 'VERIFIED', 9, '2026-09-03 09:05:00', NULL),
 (3, 2, 'DRIVING_LICENCE', 'B4521867', 'uploads/documents/v02-licence.pdf', '2030-06-30', '2026-09-26 15:50:00', 'VERIFIED', 10, '2026-09-30 10:05:00', NULL),
 (4, 2, 'INSURANCE', 'MV-2026-00002', 'uploads/documents/v02-insurance.pdf', '2027-03-31', '2026-09-26 15:50:00', 'VERIFIED', 10, '2026-09-30 10:05:00', NULL),
 (5, 3, 'DRIVING_LICENCE', 'B7788120', 'uploads/documents/v03-licence.pdf', '2030-06-30', '2026-09-01 18:10:00', 'VERIFIED', 9, '2026-09-05 10:00:00', NULL),
 (6, 3, 'INSURANCE', 'MV-2026-00003', 'uploads/documents/v03-insurance.pdf', '2027-03-31', '2026-09-01 18:10:00', 'VERIFIED', 9, '2026-09-05 10:00:00', NULL),
 (7, 4, 'DRIVING_LICENCE', 'B3412995', 'uploads/documents/v04-licence.pdf', '2030-06-30', '2026-09-06 09:30:00', 'VERIFIED', 10, '2026-09-10 08:35:00', NULL),
 (8, 4, 'INSURANCE', 'MV-2026-00004', 'uploads/documents/v04-insurance.pdf', '2027-03-31', '2026-09-06 09:30:00', 'VERIFIED', 10, '2026-09-10 08:35:00', NULL),
 (9, 5, 'DRIVING_LICENCE', 'B1203557', 'uploads/documents/v05-licence.pdf', '2030-06-30', '2026-09-25 11:40:00', 'VERIFIED', 9, '2026-09-29 09:00:00', NULL),
 (10, 5, 'INSURANCE', 'MV-2026-00005', 'uploads/documents/v05-insurance.pdf', '2027-03-31', '2026-09-25 11:40:00', 'VERIFIED', 9, '2026-09-29 09:00:00', NULL),
 (11, 6, 'DRIVING_LICENCE', 'B8876301', 'uploads/documents/v06-licence.pdf', '2030-06-30', '2026-09-08 12:00:00', 'VERIFIED', 10, '2026-09-11 09:10:00', NULL),
 (12, 6, 'INSURANCE', 'MV-2025-00006', 'uploads/documents/v06-insurance-old.pdf', '2026-08-31', '2026-09-08 12:00:00', 'REJECTED', 10, '2026-09-11 09:10:00', 'Insurance certificate expired on 2026-08-31'),
 (13, 6, 'INSURANCE', 'MV-2026-00006', 'uploads/documents/v06-insurance.pdf', '2027-03-31', '2026-09-11 09:20:00', 'VERIFIED', 10, '2026-09-11 09:25:00', NULL),
 (14, 7, 'DRIVING_LICENCE', 'B5590442', 'uploads/documents/v07-licence.pdf', '2030-06-30', '2026-09-12 20:20:00', 'VERIFIED', 9, '2026-09-15 11:05:00', NULL),
 (15, 7, 'INSURANCE', 'MV-2026-00007', 'uploads/documents/v07-insurance.pdf', '2027-03-31', '2026-09-12 20:20:00', 'VERIFIED', 9, '2026-09-15 11:05:00', NULL),
 (16, 8, 'DRIVING_LICENCE', 'B6031778', 'uploads/documents/v08-licence.pdf', '2030-06-30', '2026-09-14 07:40:00', 'VERIFIED', 9, '2026-09-17 14:00:00', NULL),
 (17, 8, 'INSURANCE', 'MV-2026-00008', 'uploads/documents/v08-insurance.pdf', '2027-03-31', '2026-09-14 07:40:00', 'VERIFIED', 9, '2026-09-17 14:00:00', NULL),
 (18, 9, 'DRIVING_LICENCE', 'B9045613', 'uploads/documents/v09-licence.pdf', '2030-06-30', '2026-09-29 10:20:00', 'VERIFIED', 9, '2026-09-29 15:50:00', NULL),
 (19, 9, 'INSURANCE', 'MV-2025-00009', 'uploads/documents/v09-insurance.pdf', '2026-10-20', '2026-09-29 10:20:00', 'VERIFIED', 9, '2026-09-29 15:50:00', NULL),
 (20, 10, 'DRIVING_LICENCE', 'B3412995', 'uploads/documents/v10-licence.pdf', '2030-06-30', '2026-09-19 15:00:00', 'VERIFIED', 10, '2026-09-24 08:35:00', NULL),
 (21, 10, 'INSURANCE', 'MV-2026-00010', 'uploads/documents/v10-insurance.pdf', '2027-03-31', '2026-09-19 15:00:00', 'VERIFIED', 10, '2026-09-24 08:35:00', NULL),
 (22, 11, 'DRIVING_LICENCE', 'B2207946', 'uploads/documents/v11-licence.pdf', '2030-06-30', '2026-09-28 19:10:00', 'VERIFIED', 9, '2026-10-01 15:25:00', NULL),
 (23, 11, 'INSURANCE', 'MV-2026-00011', 'uploads/documents/v11-insurance.pdf', '2027-03-31', '2026-09-28 19:10:00', 'VERIFIED', 9, '2026-10-01 15:25:00', NULL),
 (24, 12, 'DRIVING_LICENCE', 'B3301585', 'uploads/documents/v12-licence.pdf', '2030-06-30', '2026-10-01 21:30:00', 'PENDING', NULL, NULL, NULL),
 (25, 12, 'INSURANCE', 'MV-2026-00012', 'uploads/documents/v12-insurance.pdf', '2027-03-31', '2026-10-01 21:30:00', 'PENDING', NULL, NULL, NULL);

-- Aneesha(IT25100952): APPOINTMENT – every booking starts as PENDING until its deposit is verified
INSERT INTO appointment (appointment_id, customer_id, vehicle_id, service_type_id, scheduled_at, bay_no,
                         status, problem_description, deposit_amount, created_at) VALUES
 (1 , 1, 1 , 1, '2026-09-03 09:00:00', 1, 'PENDING', 'Regular service; noise from front wheel', 9000.00, '2026-08-30 10:15:00'),
 (2 , 2, 3 , 2, '2026-09-05 10:00:00', 2, 'PENDING', 'Oil change and brake check', 6000.00, '2026-09-01 18:20:00'),
 (3 , 3, 4 , 2, '2026-09-10 08:30:00', 1, 'PENDING', 'Brakes squealing', 6000.00, '2026-09-06 09:40:00'),
 (4 , 5, 6 , 3, '2026-09-11 09:00:00', 3, 'PENDING', 'Check-engine light on', 2500.00, '2026-09-08 12:05:00'),
 (5 , 6, 7 , 3, '2026-09-15 11:00:00', 2, 'PENDING', 'Hybrid system warning on dashboard', 2500.00, '2026-09-12 20:30:00'),
 (6 , 7, 8 , 3, '2026-09-17 14:00:00', 1, 'PENDING', 'AC not cooling', 2500.00, '2026-09-14 07:50:00'),
 (7 , 3, 10, 1, '2026-09-24 08:30:00', 2, 'PENDING', 'Full service before long trip', 9000.00, '2026-09-19 15:10:00'),
 (8 , 4, 5 , 3, '2026-09-29 09:00:00', 1, 'PENDING', 'Driving range has dropped', 2500.00, '2026-09-25 11:45:00'),
 (9 , 1, 2 , 1, '2026-09-30 10:00:00', 3, 'PENDING', 'Full service and interior clean-up', 9000.00, '2026-09-26 16:00:00'),
 (10, 8, 9 , 2, '2026-10-03 09:00:00', 1, 'PENDING', 'Oil change', 6000.00, '2026-09-29 10:30:00'),
 (11, 2, 3 , 3, '2026-10-03 09:00:00', 2, 'PENDING', 'Bad smell from AC', 2500.00, '2026-10-01 19:25:00'),
 (12, 6, 7 , 2, '2026-10-06 10:30:00', 1, 'PENDING', 'Brake noise', 6000.00, '2026-10-02 08:10:00'),
 (13, 5, 6 , 2, '2026-09-20 09:00:00', 2, 'PENDING', 'Oil change before trip', 6000.00, '2026-09-15 13:00:00'),
 (14, 4, 5 , 1, '2026-09-22 10:00:00', 3, 'PENDING', 'Full service', 9000.00, '2026-09-16 09:00:00');

-- Sewmini(IT25100962): PAYMENT – deposit slips uploaded by customers and checked by the receptionist
INSERT INTO payment (payment_id, payment_type, appointment_id, invoice_id, amount, slip_file, bank_reference,
                     paid_on, uploaded_at, status, verified_by, verified_at, reject_reason) VALUES
 (1 , 'DEPOSIT', 1 , NULL, 9000.00, 'uploads/slips/deposit-001.jpg', 'HNB-700101', '2026-08-30', '2026-08-30 10:40:00', 'VERIFIED', 9, '2026-08-30 15:00:00', NULL),
 (2 , 'DEPOSIT', 2 , NULL, 6000.00, 'uploads/slips/deposit-002.jpg', 'HNB-700102', '2026-09-01', '2026-09-01 18:45:00', 'VERIFIED', 9, '2026-09-02 09:30:00', NULL),
 (3 , 'DEPOSIT', 3 , NULL, 6000.00, 'uploads/slips/deposit-003.jpg', 'HNB-700103', '2026-09-06', '2026-09-06 10:05:00', 'VERIFIED', 10, '2026-09-06 14:00:00', NULL),
 (4 , 'DEPOSIT', 4 , NULL, 2500.00, 'uploads/slips/deposit-004.jpg', 'HNB-700104', '2026-09-08', '2026-09-08 12:30:00', 'VERIFIED', 10, '2026-09-08 16:10:00', NULL),
 (5 , 'DEPOSIT', 5 , NULL, 2500.00, 'uploads/slips/deposit-005.jpg', 'HNB-700105', '2026-09-12', '2026-09-12 20:55:00', 'VERIFIED', 9, '2026-09-13 09:15:00', NULL),
 (6 , 'DEPOSIT', 6 , NULL, 2500.00, 'uploads/slips/deposit-006.jpg', 'HNB-700106', '2026-09-14', '2026-09-14 08:15:00', 'VERIFIED', 9, '2026-09-14 11:00:00', NULL),
 (7 , 'DEPOSIT', 7 , NULL, 9000.00, 'uploads/slips/deposit-007.jpg', 'HNB-700107', '2026-09-19', '2026-09-19 15:35:00', 'VERIFIED', 10, '2026-09-20 10:00:00', NULL),
 (8 , 'DEPOSIT', 8 , NULL, 2500.00, 'uploads/slips/deposit-008.jpg', 'HNB-700108', '2026-09-25', '2026-09-25 12:10:00', 'VERIFIED', 9, '2026-09-25 16:20:00', NULL),
 (9 , 'DEPOSIT', 9 , NULL, 9000.00, 'uploads/slips/deposit-009.jpg', 'HNB-700109', '2026-09-26', '2026-09-26 16:25:00', 'VERIFIED', 10, '2026-09-27 09:00:00', NULL),
 (10, 'DEPOSIT', 10, NULL, 6000.00, 'uploads/slips/deposit-010.jpg', 'HNB-700110', '2026-09-29', '2026-09-29 10:55:00', 'VERIFIED', 9, '2026-09-29 15:45:00', NULL),
 (11, 'DEPOSIT', 11, NULL, 2500.00, 'uploads/slips/deposit-011.jpg', 'HNB-700111', '2026-10-01', '2026-10-01 19:50:00', 'PENDING', NULL, NULL, NULL),
 (12, 'DEPOSIT', 12, NULL, 3000.00, 'uploads/slips/deposit-012.jpg', 'HNB-700112', '2026-10-02', '2026-10-02 08:35:00', 'REJECTED', 9, '2026-10-02 09:00:00', 'Slip shows Rs. 3,000; the deposit for this package is Rs. 6,000'),
 (13, 'DEPOSIT', 13, NULL, 6000.00, 'uploads/slips/deposit-013.jpg', 'HNB-700113', '2026-09-15', '2026-09-15 13:25:00', 'VERIFIED', 10, '2026-09-15 16:00:00', NULL),
 (14, 'DEPOSIT', 14, NULL, 9000.00, 'uploads/slips/deposit-014.jpg', 'HNB-700114', '2026-09-16', '2026-09-16 09:25:00', 'VERIFIED', 9, '2026-09-16 14:30:00', NULL);

-- Aneesha(IT25100952): confirm bookings whose deposit is verified (trg_appointment_confirm checks this)
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 9, confirmed_at = '2026-08-30 15:00:00' WHERE appointment_id = 1;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 9, confirmed_at = '2026-09-02 09:30:00' WHERE appointment_id = 2;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 10, confirmed_at = '2026-09-06 14:00:00' WHERE appointment_id = 3;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 10, confirmed_at = '2026-09-08 16:10:00' WHERE appointment_id = 4;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 9, confirmed_at = '2026-09-13 09:15:00' WHERE appointment_id = 5;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 9, confirmed_at = '2026-09-14 11:00:00' WHERE appointment_id = 6;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 10, confirmed_at = '2026-09-20 10:00:00' WHERE appointment_id = 7;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 9, confirmed_at = '2026-09-25 16:20:00' WHERE appointment_id = 8;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 10, confirmed_at = '2026-09-27 09:00:00' WHERE appointment_id = 9;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 9, confirmed_at = '2026-09-29 15:45:00' WHERE appointment_id = 10;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 10, confirmed_at = '2026-09-15 16:00:00' WHERE appointment_id = 13;
UPDATE appointment SET status = 'CONFIRMED', confirmed_by = 9, confirmed_at = '2026-09-16 14:30:00' WHERE appointment_id = 14;

-- Aneesha/Sewmini: two cancellations – one with less than 24 hours' notice, one with more
CALL sp_cancel_appointment(13, '2026-09-19 15:00:00');   -- 18 h notice: Rs. 3,000 penalty, Rs. 3,000 refund
CALL sp_cancel_appointment(14, '2026-09-18 11:00:00');   -- 95 h notice: full Rs. 9,000 refund
UPDATE refund SET status = 'REFUNDED', processed_by = 10, processed_at = '2026-09-21 10:00:00', bank_reference = 'HNB-RF-500113' WHERE appointment_id = 13;

-- Aneesha(IT25100952): vehicles arrive and bookings are checked in
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 1;
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 2;
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 3;
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 4;
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 5;
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 6;
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 7;
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 8;
UPDATE appointment SET status = 'CHECKED_IN' WHERE appointment_id = 9;

-- Sohan(IT25100963): JOB_CARD – created at drop-off in the INSPECTION stage (trigger logs the stage)
INSERT INTO job_card (job_card_id, vehicle_id, appointment_id, created_by, mechanic_id, check_in_at, check_in_mileage,
                      status, status_changed_at, status_changed_by, estimated_completion) VALUES
 (1 , 1 , 1   , 9 , 13  , '2026-09-03 09:10:00', 112480, 'INSPECTION', '2026-09-03 09:10:00', 9 , '2026-09-03 17:00:00'),
 (2 , 3 , 2   , 9 , 11  , '2026-09-05 10:05:00',  54150, 'INSPECTION', '2026-09-05 10:05:00', 9 , '2026-09-05 12:00:00'),
 (3 , 4 , 3   , 10, 13  , '2026-09-10 08:40:00', 168850, 'INSPECTION', '2026-09-10 08:40:00', 10, '2026-09-10 15:00:00'),
 (4 , 6 , 4   , 10, 11  , '2026-09-11 09:15:00', 205250, 'INSPECTION', '2026-09-11 09:15:00', 10, '2026-09-12 17:00:00'),
 (5 , 7 , 5   , 9 , 12  , '2026-09-15 11:10:00',  96650, 'INSPECTION', '2026-09-15 11:10:00', 9 , '2026-09-16 13:00:00'),
 (6 , 8 , 6   , 9 , 12  , '2026-09-17 14:05:00', 134180, 'INSPECTION', '2026-09-17 14:05:00', 9 , '2026-09-17 18:00:00'),
 (7 , 10, 7   , 10, 11  , '2026-09-24 08:40:00', 244980, 'INSPECTION', '2026-09-24 08:40:00', 10, '2026-09-24 16:00:00'),
 (8 , 5 , 8   , 9 , 12  , '2026-09-29 09:05:00',  40980, 'INSPECTION', '2026-09-29 09:05:00', 9 , '2026-10-03 17:00:00'),
 (9 , 2 , 9   , 10, 13  , '2026-09-30 10:10:00',  78390, 'INSPECTION', '2026-09-30 10:10:00', 10, '2026-10-02 16:00:00'),
 (10, 11, NULL, 9 , NULL, '2026-10-01 15:30:00',  18480, 'INSPECTION', '2026-10-01 15:30:00', 9 , NULL);

-- Sohan(IT25100963): INSPECTION (1:1 weak entity of JOB_CARD) 
INSERT INTO inspection (job_card_id, inspected_at, findings, diagnosis, recommended_action) VALUES
 (1, '2026-09-03 09:35:00', 'Front-left wheel bearing noise; engine oil dark',   'Wheel bearing worn; full service due',   'Full service and replace wheel bearing'),
 (2, '2026-09-05 10:15:00', 'Oil level low',                                     'Routine oil change',                     'Oil and filter change'),
 (3, '2026-09-10 09:00:00', 'Front brake pads at 2 mm; discs scored',            'Replace front pads; skim discs',         'Replace pads and skim discs'),
 (4, '2026-09-11 10:00:00', 'MIL on, fault code P0401',                          'EGR valve clogged',                      'Replace EGR valve; check intake gasket'),
 (5, '2026-09-15 11:40:00', 'Hybrid warning; battery cooling fan dusty',         'Cooling fan blocked; battery cells OK',  'Clean cooling fan and duct'),
 (6, '2026-09-17 14:25:00', 'AC blowing warm air',                               'Low refrigerant; cabin filter clogged',  'Recharge AC and replace cabin filter'),
 (7, '2026-09-24 09:00:00', 'Due for full service; wiper blades streaking',      'Full service; wiper blades worn',        'Full service and replace wipers'),
 (8, '2026-09-29 10:30:00', 'Reduced driving range',                             'Battery health 78%; ECU update needed',  'ECU update and 12V battery replacement'),
 (9, '2026-09-30 10:30:00', 'Due for service; stains on rear seats',             'Full service with interior clean-up',    'Package work only');

-- Sohan(IT25100963): each stage change is an UPDATE; trg_job_card_history_upd writes it to JOB_STATUS_HISTORY
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-03 09:35:00', status_changed_by = 13 WHERE job_card_id = 1;
UPDATE job_card SET status = 'AWAITING_APPROVAL', status_changed_at = '2026-09-03 09:50:00', status_changed_by = 13 WHERE job_card_id = 1;
UPDATE job_card SET status = 'IN_PROGRESS', status_changed_at = '2026-09-03 10:40:00', status_changed_by = 13 WHERE job_card_id = 1;
UPDATE job_card SET status = 'QUALITY_CHECK', status_changed_at = '2026-09-03 16:00:00', status_changed_by = 13 WHERE job_card_id = 1;
UPDATE job_card SET status = 'READY', status_changed_at = '2026-09-03 16:30:00', status_changed_by = 13, completed_at = '2026-09-03 16:30:00' WHERE job_card_id = 1;
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-05 10:15:00', status_changed_by = 11 WHERE job_card_id = 2;
UPDATE job_card SET status = 'IN_PROGRESS', status_changed_at = '2026-09-05 10:20:00', status_changed_by = 11 WHERE job_card_id = 2;
UPDATE job_card SET status = 'QUALITY_CHECK', status_changed_at = '2026-09-05 11:10:00', status_changed_by = 11 WHERE job_card_id = 2;
UPDATE job_card SET status = 'READY', status_changed_at = '2026-09-05 11:20:00', status_changed_by = 11, completed_at = '2026-09-05 11:20:00' WHERE job_card_id = 2;
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-10 09:00:00', status_changed_by = 13 WHERE job_card_id = 3;
UPDATE job_card SET status = 'AWAITING_APPROVAL', status_changed_at = '2026-09-10 09:05:00', status_changed_by = 13 WHERE job_card_id = 3;
UPDATE job_card SET status = 'IN_PROGRESS', status_changed_at = '2026-09-10 09:25:00', status_changed_by = 13 WHERE job_card_id = 3;
UPDATE job_card SET status = 'QUALITY_CHECK', status_changed_at = '2026-09-10 13:30:00', status_changed_by = 13 WHERE job_card_id = 3;
UPDATE job_card SET status = 'READY', status_changed_at = '2026-09-10 13:45:00', status_changed_by = 13, completed_at = '2026-09-10 13:45:00' WHERE job_card_id = 3;
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-11 10:00:00', status_changed_by = 11 WHERE job_card_id = 4;
UPDATE job_card SET status = 'AWAITING_APPROVAL', status_changed_at = '2026-09-11 10:15:00', status_changed_by = 11 WHERE job_card_id = 4;
UPDATE job_card SET status = 'IN_PROGRESS', status_changed_at = '2026-09-12 08:30:00', status_changed_by = 11 WHERE job_card_id = 4;
UPDATE job_card SET status = 'QUALITY_CHECK', status_changed_at = '2026-09-12 14:30:00', status_changed_by = 11 WHERE job_card_id = 4;
UPDATE job_card SET status = 'READY', status_changed_at = '2026-09-12 15:00:00', status_changed_by = 11, completed_at = '2026-09-12 15:00:00' WHERE job_card_id = 4;
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-15 11:40:00', status_changed_by = 12 WHERE job_card_id = 5;
UPDATE job_card SET status = 'AWAITING_APPROVAL', status_changed_at = '2026-09-15 11:50:00', status_changed_by = 12 WHERE job_card_id = 5;
UPDATE job_card SET status = 'IN_PROGRESS', status_changed_at = '2026-09-15 13:00:00', status_changed_by = 12 WHERE job_card_id = 5;
UPDATE job_card SET status = 'QUALITY_CHECK', status_changed_at = '2026-09-16 11:30:00', status_changed_by = 12 WHERE job_card_id = 5;
UPDATE job_card SET status = 'READY', status_changed_at = '2026-09-16 12:00:00', status_changed_by = 12, completed_at = '2026-09-16 12:00:00' WHERE job_card_id = 5;
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-17 14:25:00', status_changed_by = 12 WHERE job_card_id = 6;
UPDATE job_card SET status = 'AWAITING_APPROVAL', status_changed_at = '2026-09-17 14:30:00', status_changed_by = 12 WHERE job_card_id = 6;
UPDATE job_card SET status = 'IN_PROGRESS', status_changed_at = '2026-09-17 14:45:00', status_changed_by = 12 WHERE job_card_id = 6;
UPDATE job_card SET status = 'QUALITY_CHECK', status_changed_at = '2026-09-17 17:15:00', status_changed_by = 12 WHERE job_card_id = 6;
UPDATE job_card SET status = 'READY', status_changed_at = '2026-09-17 17:30:00', status_changed_by = 12, completed_at = '2026-09-17 17:30:00' WHERE job_card_id = 6;
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-24 09:00:00', status_changed_by = 11 WHERE job_card_id = 7;
UPDATE job_card SET status = 'AWAITING_APPROVAL', status_changed_at = '2026-09-24 09:10:00', status_changed_by = 11 WHERE job_card_id = 7;
UPDATE job_card SET status = 'IN_PROGRESS', status_changed_at = '2026-09-24 09:30:00', status_changed_by = 11 WHERE job_card_id = 7;
UPDATE job_card SET status = 'QUALITY_CHECK', status_changed_at = '2026-09-24 14:50:00', status_changed_by = 11 WHERE job_card_id = 7;
UPDATE job_card SET status = 'READY', status_changed_at = '2026-09-24 15:10:00', status_changed_by = 11, completed_at = '2026-09-24 15:10:00' WHERE job_card_id = 7;
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-29 10:30:00', status_changed_by = 12 WHERE job_card_id = 8;
UPDATE job_card SET status = 'AWAITING_APPROVAL', status_changed_at = '2026-09-29 10:45:00', status_changed_by = 12 WHERE job_card_id = 8;
UPDATE job_card SET status = 'DIAGNOSIS', status_changed_at = '2026-09-30 10:30:00', status_changed_by = 13 WHERE job_card_id = 9;
UPDATE job_card SET status = 'IN_PROGRESS', status_changed_at = '2026-09-30 10:45:00', status_changed_by = 13 WHERE job_card_id = 9;

-- Sohan(IT25100963): REPAIR_TASK – package work is not additional; extra work needs the customer's approval
INSERT INTO repair_task (job_card_id, task_no, description, labour_hours, is_additional, approval_status, task_status) VALUES
 (1, 1, 'Full service + cleanup (vacuum, wash, engine tune-up)', 3.0, FALSE, 'NOT_REQUIRED', 'DONE'),
 (1, 2, 'Replace front-left wheel bearing',                      1.5, TRUE,  'APPROVED',     'DONE'),
 (2, 1, 'Brake system cleaning, oil and filter change',          1.5, FALSE, 'NOT_REQUIRED', 'DONE'),
 (3, 1, 'Brake system cleaning, oil and filter change',          1.5, FALSE, 'NOT_REQUIRED', 'DONE'),
 (3, 2, 'Replace front brake pads',                              1.5, TRUE,  'APPROVED',     'DONE'),
 (3, 3, 'Skim front brake discs',                                1.0, TRUE,  'APPROVED',     'DONE'),
 (4, 1, 'Diagnostic scan and road test',                         1.5, FALSE, 'NOT_REQUIRED', 'DONE'),
 (4, 2, 'Replace EGR valve',                                     3.0, TRUE,  'APPROVED',     'DONE'),
 (4, 3, 'Replace intake manifold gasket',                        0.5, TRUE,  'REJECTED',     'CANCELLED'),
 (5, 1, 'Hybrid system diagnostic',                              2.0, FALSE, 'NOT_REQUIRED', 'DONE'),
 (5, 2, 'Clean hybrid battery cooling fan',                      1.0, TRUE,  'APPROVED',     'DONE'),
 (6, 1, 'AC diagnostic and leak test',                           1.0, FALSE, 'NOT_REQUIRED', 'DONE'),
 (6, 2, 'AC gas recharge',                                       1.5, TRUE,  'APPROVED',     'DONE'),
 (6, 3, 'Replace cabin air filter',                              0.5, TRUE,  'APPROVED',     'DONE'),
 (7, 1, 'Full service + cleanup (vacuum, wash, engine tune-up)', 3.0, FALSE, 'NOT_REQUIRED', 'DONE'),
 (7, 2, 'Replace wiper blades',                                  0.5, TRUE,  'APPROVED',     'DONE'),
 (8, 1, 'Battery health diagnostic',                             2.0, FALSE, 'NOT_REQUIRED', 'DONE'),
 (8, 2, 'ECU software update',                                   1.0, TRUE,  'PENDING',      'PENDING'),
 (8, 3, 'Replace 12V auxiliary battery',                         0.5, TRUE,  'PENDING',      'PENDING'),
 (9, 1, 'Engine tune-up and general repair',                     2.0, FALSE, 'NOT_REQUIRED', 'DONE'),
 (9, 2, 'Vacuuming, interior shampoo and washing',               1.0, FALSE, 'NOT_REQUIRED', 'IN_PROGRESS');

-- Tevindu(IT25100958): SUPPLIER ----------------------------------------------------
INSERT INTO supplier (supplier_id, supplier_name, contact_person, phone_no, email, city) VALUES
 (1, 'Lanka Auto Parts (Pvt) Ltd', 'Mahesh Gamage',   '0112456789', 'sales@lankaautoparts.lk', 'Colombo 10'),
 (2, 'Wattala Genuine Spares',     'Priyanka Silva',  '0112987654', 'orders@wgspares.lk',      'Wattala'),
 (3, 'Dinapala Motor Stores',      'Ajith Dinapala',  '0112876543', 'dinapala.motors@gmail.com','Colombo 11'),
 (4, 'EcoDrive Hybrid Solutions',  'Sanjeewa Perera', '0114567890', 'info@ecodrive.lk',        'Rajagiriya');

-- Tevindu(IT25100958): SPARE_PART (stock starts at 0; the ledger below sets it) ---------
INSERT INTO spare_part (part_id, part_code, part_name, category, unit_price, quantity_in_stock, reorder_level, is_active) VALUES
 (1,  'OIL-5W30-4L',  'Engine Oil 5W-30 (4 L)',          'OIL',         9500.00,  0, 10, TRUE),
 (2,  'FLT-OIL-STD',  'Oil Filter (standard)',           'FILTER',      1800.00,  0,  8, TRUE),
 (3,  'FLT-AIR-STD',  'Air Filter (standard)',           'FILTER',      2600.00,  0,  5, TRUE),
 (4,  'BRK-PAD-FR',   'Front Brake Pad Set',             'BRAKES',     11500.00,  0,  4, TRUE),
 (5,  'BRG-WHL-FR',   'Front Wheel Bearing',             'SUSPENSION',  8700.00,  0,  2, TRUE),
 (6,  'EGR-VLV-MT',   'EGR Valve - Mitsubishi',          'ENGINE',     42000.00,  0,  1, TRUE),
 (7,  'FLT-CAB-UN',   'Cabin Air Filter (universal)',    'FILTER',      2200.00,  0,  5, TRUE),
 (8,  'AC-GAS-134',   'AC Refrigerant R134a (1 kg)',     'AC',          6500.00,  0,  3, TRUE),
 (9,  'WPR-BLD-22',   'Wiper Blade 22 inch',             'ACCESSORIES', 1900.00,  0,  6, TRUE),
 (10, 'OIL-15W40-7L', 'Diesel Engine Oil 15W-40 (7 L)',  'OIL',        14800.00,  0,  4, TRUE),
 (11, 'BAT-12V-AUX',  'Hybrid 12V Auxiliary Battery',    'ELECTRICAL', 38500.00,  0,  2, TRUE),
 (12, 'GSK-INT-MT',   'Intake Manifold Gasket',          'ENGINE',      3200.00,  0,  2, TRUE);

-- Tevindu(IT25100958): SUPPLIER_PART (M:N relationship SUPPLIES) ---------------------
INSERT INTO supplier_part (supplier_id, part_id, unit_cost, lead_time_days, is_preferred) VALUES
 (1, 1,  8200.00, 2, TRUE),  (3, 1,  7900.00, 4, FALSE),
 (1, 2,  1300.00, 2, TRUE),  (2, 2,  1450.00, 1, FALSE),
 (1, 3,  1900.00, 2, FALSE), (2, 3,  2100.00, 1, TRUE),
 (1, 4,  9200.00, 3, FALSE), (3, 4,  8600.00, 5, TRUE),
 (2, 5,  6900.00, 3, TRUE),
 (3, 6, 35500.00, 7, TRUE),
 (1, 7,  1600.00, 2, TRUE),
 (1, 8,  5200.00, 2, TRUE),
 (3, 9,  1300.00, 3, TRUE),
 (1, 10, 12500.00, 2, TRUE),
 (4, 11, 32000.00, 5, TRUE),
 (3, 12,  2400.00, 6, TRUE);

-- Tevindu(IT25100958): INVENTORY_TRANSACTION – opening stock, deliveries and adjustments
-- (ISSUE rows are added automatically by trg_part_usage_ledger)
INSERT INTO inventory_transaction (part_id, txn_type, quantity, supplier_id, performed_by, txn_at, note) VALUES
 (1, 'OPENING', 18, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (2, 'OPENING', 12, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (3, 'OPENING', 8, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (4, 'OPENING', 4, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (5, 'OPENING', 3, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (6, 'OPENING', 3, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (7, 'OPENING', 7, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (8, 'OPENING', 5, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (9, 'OPENING', 10, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (10, 'OPENING', 8, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count'),
 (11, 'OPENING', 1, NULL, 14, '2026-09-01 08:00:00', 'Opening stock count');

INSERT INTO inventory_transaction (part_id, txn_type, quantity, supplier_id, performed_by, txn_at, note) VALUES
 (1, 'RECEIPT',     6,    1,    14, '2026-09-15 11:00:00', 'GRN-0915 Lanka Auto Parts'),
 (9, 'RECEIPT',     4,    3,    14, '2026-09-18 15:30:00', 'GRN-0918 Dinapala Motor Stores'),
 (7, 'ADJUSTMENT', -1,    NULL, 14, '2026-09-20 09:00:00', 'Filter damaged in store');

-- Tevindu(IT25100958): PART_REQUEST (mechanics request parts; the storekeeper handles them)
INSERT INTO part_request (request_id, job_card_id, part_id, quantity, requested_at, status, handled_by, handled_at, reject_reason) VALUES
 (1,  1, 1,  1, '2026-09-03 09:50:00', 'ISSUED',   14, '2026-09-03 10:00:00', NULL),
 (2,  1, 2,  1, '2026-09-03 09:50:00', 'ISSUED',   14, '2026-09-03 10:00:00', NULL),
 (3,  1, 3,  1, '2026-09-03 09:50:00', 'ISSUED',   14, '2026-09-03 10:00:00', NULL),
 (4,  1, 5,  1, '2026-09-03 12:15:00', 'ISSUED',   14, '2026-09-03 12:30:00', NULL),
 (5,  2, 1,  1, '2026-09-05 10:15:00', 'ISSUED',   14, '2026-09-05 10:20:00', NULL),
 (6,  2, 2,  1, '2026-09-05 10:15:00', 'ISSUED',   14, '2026-09-05 10:20:00', NULL),
 (7,  3, 4,  1, '2026-09-10 09:15:00', 'ISSUED',   14, '2026-09-10 09:30:00', NULL),
 (8,  4, 6,  1, '2026-09-12 08:30:00', 'ISSUED',   14, '2026-09-12 08:45:00', NULL),
 (9,  4, 10, 1, '2026-09-12 08:30:00', 'ISSUED',   14, '2026-09-12 08:45:00', NULL),
 (10, 4, 12, 1, '2026-09-12 08:30:00', 'REJECTED', 14, '2026-09-12 08:50:00', 'Customer rejected the additional gasket work'),
 (11, 6, 8,  1, '2026-09-17 14:30:00', 'ISSUED',   14, '2026-09-17 14:40:00', NULL),
 (12, 6, 7,  1, '2026-09-17 15:20:00', 'ISSUED',   14, '2026-09-17 15:30:00', NULL),
 (13, 7, 10, 1, '2026-09-24 08:55:00', 'ISSUED',   14, '2026-09-24 09:00:00', NULL),
 (14, 7, 2,  1, '2026-09-24 08:55:00', 'ISSUED',   14, '2026-09-24 09:00:00', NULL),
 (15, 7, 3,  1, '2026-09-24 08:55:00', 'ISSUED',   14, '2026-09-24 09:00:00', NULL),
 (16, 7, 9,  2, '2026-09-24 13:00:00', 'ISSUED',   14, '2026-09-24 13:15:00', NULL),
 (17, 8, 11, 1, '2026-09-29 11:00:00', 'PENDING',  NULL, NULL, NULL),
 (18, 9, 7,  1, '2026-09-30 11:00:00', 'PENDING',  NULL, NULL, NULL);

-- Tevindu(IT25100958): PART_USAGE (trigger writes an ISSUE row to the stock ledger) ------
INSERT INTO part_usage (usage_id, job_card_id, part_id, quantity, unit_price_at_issue, issued_by, issued_at) VALUES
 (1 , 1, 1,  1,  9500.00, 14, '2026-09-03 10:00:00'),
 (2 , 1, 2,  1,  1800.00, 14, '2026-09-03 10:00:00'),
 (3 , 1, 3,  1,  2600.00, 14, '2026-09-03 10:00:00'),
 (4 , 1, 5,  1,  8700.00, 14, '2026-09-03 12:30:00'),
 (5 , 2, 1,  1,  9500.00, 14, '2026-09-05 10:20:00'),
 (6 , 2, 2,  1,  1800.00, 14, '2026-09-05 10:20:00'),
 (7 , 3, 4,  1, 11500.00, 14, '2026-09-10 09:30:00'),
 (8 , 4, 6,  1, 42000.00, 14, '2026-09-12 08:45:00'),
 (9 , 4, 10, 1, 14800.00, 14, '2026-09-12 08:45:00'),
 (10, 6, 8,  1,  6500.00, 14, '2026-09-17 14:40:00'),
 (11, 6, 7,  1,  2200.00, 14, '2026-09-17 15:30:00'),
 (12, 7, 10, 1, 14800.00, 14, '2026-09-24 09:00:00'),
 (13, 7, 2,  1,  1800.00, 14, '2026-09-24 09:00:00'),
 (14, 7, 3,  1,  2600.00, 14, '2026-09-24 09:00:00'),
 (15, 7, 9,  2,  1900.00, 14, '2026-09-24 13:15:00');

-- Sewmini(IT25100962): INVOICE – raised when the vehicle is READY -------------------------
INSERT INTO invoice (invoice_id, invoice_no, job_card_id, issued_by, invoice_date, discount, tax_rate, status, warranty_until) VALUES
 (1, 'INV-2026-0001', 1, 9,  '2026-09-03',   0.00, 0.00, 'ISSUED', '2026-12-03'),
 (2, 'INV-2026-0002', 2, 9,  '2026-09-05',   0.00, 0.00, 'ISSUED', NULL),
 (3, 'INV-2026-0003', 3, 10, '2026-09-10', 750.00, 0.00, 'ISSUED', '2027-03-10'),
 (4, 'INV-2026-0004', 4, 10, '2026-09-12',   0.00, 0.00, 'ISSUED', '2027-03-12'),
 (5, 'INV-2026-0005', 5, 9,  '2026-09-16',   0.00, 0.00, 'ISSUED', NULL),
 (6, 'INV-2026-0006', 6, 9,  '2026-09-17',   0.00, 0.00, 'ISSUED', '2026-12-17'),
 (7, 'INV-2026-0007', 7, 10, '2026-09-24',   0.00, 0.00, 'ISSUED', '2026-12-24');

-- Sewmini(IT25100962): INVOICE_ITEM – package price (or diagnostic fee) + approved extra labour + extra parts
-- (consumables in a package – oil, filters – are covered by the package price)
INSERT INTO invoice_item (invoice_id, line_no, item_type, description, quantity, unit_price) VALUES
 (1, 1, 'PACKAGE',        'Full Service + Cleanup',             1,    18000.00),
 (1, 2, 'LABOUR',         'Replace front-left wheel bearing',   1.5,   2500.00),
 (1, 3, 'PART',           'Front Wheel Bearing',                1,     8700.00),
 (2, 1, 'PACKAGE',        'General Repair + Brake Maintenance', 1,    12000.00),
 (3, 1, 'PACKAGE',        'General Repair + Brake Maintenance', 1,    12000.00),
 (3, 2, 'LABOUR',         'Replace front brake pads',           1.5,   2500.00),
 (3, 3, 'LABOUR',         'Skim front brake discs',             1.0,   2500.00),
 (3, 4, 'PART',           'Front Brake Pad Set',                1,    11500.00),
 (4, 1, 'DIAGNOSTIC_FEE', 'Diagnostics + Specific Repairs',     1,     5000.00),
 (4, 2, 'LABOUR',         'Replace EGR valve',                  3.0,   3000.00),
 (4, 3, 'PART',           'EGR Valve - Mitsubishi',             1,    42000.00),
 (4, 4, 'PART',           'Diesel Engine Oil 15W-40 (7 L)',     1,    14800.00),
 (5, 1, 'DIAGNOSTIC_FEE', 'Diagnostics + Specific Repairs',     1,     5000.00),
 (5, 2, 'LABOUR',         'Clean hybrid battery cooling fan',   1.0,   3000.00),
 (6, 1, 'DIAGNOSTIC_FEE', 'Diagnostics + Specific Repairs',     1,     5000.00),
 (6, 2, 'LABOUR',         'AC gas recharge',                    1.5,   3000.00),
 (6, 3, 'LABOUR',         'Replace cabin air filter',           0.5,   3000.00),
 (6, 4, 'PART',           'AC Refrigerant R134a (1 kg)',        1,     6500.00),
 (6, 5, 'PART',           'Cabin Air Filter (universal)',       1,     2200.00),
 (7, 1, 'PACKAGE',        'Full Service + Cleanup',             1,    18000.00),
 (7, 2, 'LABOUR',         'Replace wiper blades',               0.5,   2500.00),
 (7, 3, 'PART',           'Wiper Blade 22 inch',                2,     1900.00);

-- Sewmini(IT25100962): PAYMENT – final payments (bill total minus the deposit already paid)
INSERT INTO payment (payment_id, payment_type, appointment_id, invoice_id, amount, slip_file, bank_reference,
                     paid_on, uploaded_at, status, verified_by, verified_at, reject_reason) VALUES
 (15, 'FINAL', NULL, 1, 21450.00, 'uploads/slips/final-0001.jpg',   'HNB-700201', '2026-09-03', '2026-09-03 16:40:00', 'VERIFIED', 9,  '2026-09-03 16:50:00', NULL),
 (16, 'FINAL', NULL, 2,  6000.00, 'uploads/slips/final-0002.jpg',   'HNB-700202', '2026-09-05', '2026-09-05 11:30:00', 'VERIFIED', 9,  '2026-09-05 11:35:00', NULL),
 (17, 'FINAL', NULL, 3, 13000.00, 'uploads/slips/final-0003a.jpg',  'HNB-700203', '2026-09-10', '2026-09-10 14:00:00', 'VERIFIED', 10, '2026-09-10 14:10:00', NULL),
 (18, 'FINAL', NULL, 3, 10000.00, 'uploads/slips/final-0003b.jpg',  'HNB-700204', '2026-09-12', '2026-09-12 10:15:00', 'VERIFIED', 10, '2026-09-12 10:25:00', NULL),
 (19, 'FINAL', NULL, 4, 68300.00, 'uploads/slips/final-0004.jpg',   'HNB-700205', '2026-09-12', '2026-09-12 15:25:00', 'VERIFIED', 10, '2026-09-12 15:35:00', NULL),
 (20, 'FINAL', NULL, 5,  5500.00, 'uploads/slips/final-0005.jpg',   'HNB-700206', '2026-10-01', '2026-10-01 18:30:00', 'PENDING',  NULL, NULL, NULL),
 (21, 'FINAL', NULL, 6, 17200.00, 'uploads/slips/final-0006.jpg',   'HNB-700207', '2026-09-17', '2026-09-17 17:40:00', 'VERIFIED', 9,  '2026-09-17 17:50:00', NULL);

UPDATE invoice SET status = 'PAID' WHERE invoice_id IN (1, 2, 3, 4, 6);

-- Sohan(IT25100963): vehicles released only after full, verified payment (trg_job_card_before_upd checks)
UPDATE job_card SET status = 'COLLECTED', status_changed_at = '2026-09-03 17:10:00', status_changed_by = 9  WHERE job_card_id = 1;
UPDATE job_card SET status = 'COLLECTED', status_changed_at = '2026-09-05 11:40:00', status_changed_by = 9  WHERE job_card_id = 2;
UPDATE job_card SET status = 'COLLECTED', status_changed_at = '2026-09-12 10:30:00', status_changed_by = 10 WHERE job_card_id = 3;
UPDATE job_card SET status = 'COLLECTED', status_changed_at = '2026-09-12 15:40:00', status_changed_by = 10 WHERE job_card_id = 4;
UPDATE job_card SET status = 'COLLECTED', status_changed_at = '2026-09-17 18:00:00', status_changed_by = 9  WHERE job_card_id = 6;

-- Sohan(IT25100963): NOTIFICATION ------------------------------------------------------
INSERT INTO notification (notification_id, customer_id, notif_type, channel, message, sent_at, delivery_status) VALUES
 (1,  1, 'BOOKING_CONFIRMATION', 'SMS',   'Booking confirmed: WP-CAB-4521, 03 Sep 09:00',                 '2026-08-30 10:20:00', 'SENT'),
 (2,  1, 'APPROVAL_REQUEST',     'SMS',   'Extra work on WP-CAB-4521: replace wheel bearing. Approve?',   '2026-09-03 10:30:00', 'SENT'),
 (3,  1, 'VEHICLE_READY',        'SMS',   'WP-CAB-4521 is ready for collection',                          '2026-09-03 16:35:00', 'SENT'),
 (4,  2, 'VEHICLE_READY',        'EMAIL', 'Your Wagon R WP-CBA-7788 is ready',                            '2026-09-05 11:25:00', 'SENT'),
 (5,  3, 'APPROVAL_REQUEST',     'SMS',   'Extra work on SP-PC-5562: skim brake discs. Approve?',         '2026-09-10 09:10:00', 'SENT'),
 (6,  3, 'VEHICLE_READY',        'SMS',   'SP-PC-5562 is ready for collection',                           '2026-09-10 13:50:00', 'SENT'),
 (7,  5, 'APPROVAL_REQUEST',     'SMS',   'Extra work on NW-KP-8876: EGR valve and gasket. Approve?',     '2026-09-11 10:15:00', 'FAILED'),
 (8,  5, 'APPROVAL_REQUEST',     'EMAIL', 'Extra work on NW-KP-8876: EGR valve and gasket. Approve?',     '2026-09-11 10:20:00', 'SENT'),
 (9,  5, 'VEHICLE_READY',        'SMS',   'NW-KP-8876 is ready for collection',                           '2026-09-12 15:05:00', 'SENT'),
 (10, 6, 'VEHICLE_READY',        'SMS',   'WP-CBH-5590 is ready for collection',                          '2026-09-16 12:05:00', 'SENT'),
 (11, 7, 'VEHICLE_READY',        'EMAIL', 'Your Civic WP-PE-6031 is ready',                               '2026-09-17 17:35:00', 'SENT'),
 (12, 3, 'VEHICLE_READY',        'SMS',   'SP-NC-4410 is ready for collection',                           '2026-09-24 15:15:00', 'SENT'),
 (13, 1, 'SERVICE_REMINDER',     'EMAIL', 'WP-CAV-9548 is due for a service',                              '2026-09-25 08:00:00', 'SENT'),
 (14, 8, 'SERVICE_REMINDER',     'SMS',   'WP-CAD-9045 is due for a service',                             '2026-09-25 08:00:00', 'SENT'),
 (15, 4, 'APPROVAL_REQUEST',     'SMS',   'Extra work on WP-CAQ-1203: ECU update and 12V battery. Approve?', '2026-09-29 10:45:00', 'SENT'),
 (16, 8, 'BOOKING_CONFIRMATION', 'SMS',   'Booking confirmed: WP-CAD-9045, 03 Oct 09:00',                 '2026-09-29 10:35:00', 'SENT');

-- Sewmini(IT25100962): FEEDBACK (one rating per collected job) ------------------------------
INSERT INTO feedback (job_card_id, rating, comments, submitted_at) VALUES
 (1, 5, 'Quick service and the noise is gone',              '2026-09-04 19:10:00'),
 (2, 4, 'Good, but had to wait a little at the desk',       '2026-09-06 08:45:00'),
 (3, 5, 'Brakes feel like new',                             '2026-09-11 12:00:00'),
 (4, 4, 'Fixed the engine light; a bit expensive',          '2026-09-14 20:30:00'),
 (6, 3, 'AC is cold now but took longer than promised',     '2026-09-18 09:15:00');
