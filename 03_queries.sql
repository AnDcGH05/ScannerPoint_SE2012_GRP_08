USE scannerpoint;


-- (01) Aneesha [IT25100952] – Customer, Vehicle & Booking Management
-- 1.1 Customer directory: including contact numbers and number of registered vehicles
SELECT  c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name)                          AS customer_name,
        c.city,
        (SELECT GROUP_CONCAT(p.phone_no ORDER BY p.phone_type = 'MOBILE' DESC, p.phone_no SEPARATOR ', ')
           FROM customer_phone p WHERE p.customer_id = c.customer_id)   AS phone_numbers,
        COUNT(v.vehicle_id)                                             AS vehicles
FROM    customer c
LEFT JOIN vehicle v ON v.customer_id = c.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.city
ORDER BY c.last_name, c.first_name;

-- 1.2 Digital service history of one vehicle (for WP-CAB-4521)
SELECT  DATE(j.check_in_at)                         AS visit_date,
        j.check_in_mileage                          AS mileage,
        COALESCE(st.service_name, 'Walk-in')        AS package,
        i.diagnosis,
        COUNT(t.task_no)                            AS tasks_done,
        s.total                                     AS invoice_total
FROM    vehicle v
JOIN    job_card j          ON j.vehicle_id = v.vehicle_id
LEFT JOIN appointment a     ON a.appointment_id = j.appointment_id
LEFT JOIN service_type st   ON st.service_type_id = a.service_type_id
LEFT JOIN inspection i      ON i.job_card_id = j.job_card_id
LEFT JOIN repair_task t     ON t.job_card_id = j.job_card_id AND t.task_status = 'DONE'
LEFT JOIN v_invoice_summary s ON s.job_card_id = j.job_card_id
WHERE   v.registration_no = 'WP-CAB-4521'
GROUP BY j.job_card_id, j.check_in_at, j.check_in_mileage, st.service_name, i.diagnosis, s.total
ORDER BY j.check_in_at DESC;

-- 1.3 Predictive maintenance: vehicles due for service (6 months or 5,000 km) and the last reminder sent
SELECT  CONCAT(v.registration_no, ' - ', v.make, ' ', v.model)       AS vehicle,
        CONCAT(c.first_name, ' ', c.last_name)                      AS owner,
        v.last_service_date,
        TIMESTAMPDIFF(MONTH, v.last_service_date, CURDATE())        AS months_since,
        v.current_mileage - v.last_service_mileage                  AS km_since,
        (SELECT DATE(MAX(n.sent_at)) FROM notification n
          WHERE n.customer_id = c.customer_id
            AND n.notif_type = 'SERVICE_REMINDER'
            AND n.delivery_status = 'SENT')                         AS last_reminder
FROM    vehicle v
JOIN    customer c ON c.customer_id = v.customer_id
WHERE   TIMESTAMPDIFF(MONTH, v.last_service_date, CURDATE()) >= 6
   OR   v.current_mileage - v.last_service_mileage >= 5000
ORDER BY months_since DESC;

-- 1.4 Vehicle documents waiting to be verified or expiring within 30 days
SELECT  CONCAT(v.registration_no, ' - ', v.make, ' ', v.model)   AS vehicle,
        CONCAT(c.first_name, ' ', c.last_name)                   AS owner,
        d.doc_type,
        d.status,
        d.expiry_date,
        DATEDIFF(d.expiry_date, CURDATE())                       AS days_to_expiry
FROM    vehicle_document d
JOIN    vehicle v  ON v.vehicle_id = d.vehicle_id
JOIN    customer c ON c.customer_id = v.customer_id
WHERE   d.status = 'PENDING'
   OR  (d.status = 'VERIFIED' AND DATEDIFF(d.expiry_date, CURDATE()) <= 30)
ORDER BY d.status, d.expiry_date;

-- 1.5 One day's booking schedule ( for 3rd Oct 2026) with deposit status
SELECT  TIME(a.scheduled_at)                                      AS slot,
        a.bay_no,
        CONCAT(c.first_name, ' ', c.last_name)                    AS customer,
        CONCAT(v.registration_no, ' - ', v.make, ' ', v.model)    AS vehicle,
        st.service_name                                           AS package,
        a.deposit_amount,
        (SELECT p.status FROM payment p
          WHERE p.appointment_id = a.appointment_id AND p.payment_type = 'DEPOSIT'
          ORDER BY p.uploaded_at DESC LIMIT 1)                    AS deposit_slip,
        a.status
FROM    appointment a
JOIN    customer c      ON c.customer_id = a.customer_id
JOIN    vehicle v       ON v.vehicle_id = a.vehicle_id
JOIN    service_type st ON st.service_type_id = a.service_type_id
WHERE   DATE(a.scheduled_at) = '2026-10-03'
  AND   a.status IN ('PENDING','CONFIRMED')
ORDER BY a.scheduled_at, a.bay_no;


-- (02) Sohan [IT25100963] – Job Card, Repair Workflow & Notifications
-- 2.1 Each mechanic's workload: open jobs and completed jobs 
SELECT  CONCAT(e.first_name, ' ', e.last_name)                    AS mechanic,
        e.specialization,
        SUM(CASE WHEN j.status NOT IN ('READY','COLLECTED') THEN 1 ELSE 0 END) AS open_jobs,
        SUM(CASE WHEN j.status IN ('READY','COLLECTED') THEN 1 ELSE 0 END)     AS completed_jobs
FROM    employee e
LEFT JOIN job_card j ON j.mechanic_id = e.employee_id
WHERE   e.emp_role = 'MECHANIC'
GROUP BY e.employee_id, e.first_name, e.last_name, e.specialization
ORDER BY open_jobs DESC, completed_jobs DESC;

-- 2.2 Smart repair workflow for the customer dashboard (vehicle WP-CAV-9548):
--     BLURRED = stage finished, CURRENT = stage the vehicle is in, UPCOMING = not reached yet
SELECT  s.stage_no,
        s.stage,
        CASE WHEN s.stage_no = 1 THEN a.confirmed_at
             ELSE (SELECT MIN(h.changed_at) FROM job_status_history h
                    WHERE h.job_card_id = j.job_card_id AND h.status = s.status) END AS reached_at,
        CASE
            WHEN s.stage_no = 1 THEN CASE WHEN a.confirmed_at IS NOT NULL THEN 'BLURRED' ELSE 'CURRENT' END
            WHEN s.stage_no = 7 THEN CASE WHEN j.status = 'COLLECTED' OR COALESCE(b.balance_due, 1) <= 0 THEN 'BLURRED'
                                          WHEN j.status = 'READY' THEN 'CURRENT' ELSE 'UPCOMING' END
            WHEN s.stage_no = 8 THEN CASE WHEN j.status = 'COLLECTED' THEN 'BLURRED'
                                          WHEN COALESCE(b.balance_due, 1) <= 0 THEN 'CURRENT' ELSE 'UPCOMING' END
            WHEN j.stage_rank > s.stage_no THEN 'BLURRED'
            WHEN j.stage_rank = s.stage_no THEN 'CURRENT'
            ELSE 'UPCOMING'
        END                                                                     AS box_state,
        CASE WHEN s.stage_no = 7 THEN CONCAT('Collect on ', DATE(j.estimated_completion))
             WHEN s.stage_no = 4 AND j.stage_rank > 4 AND NOT EXISTS
                  (SELECT 1 FROM job_status_history h WHERE h.job_card_id = j.job_card_id
                      AND h.status = 'AWAITING_APPROVAL') THEN 'No extra work needed'
        END                                                                     AS note
FROM   (SELECT 1 AS stage_no, 'Booked' AS stage, NULL AS status
        UNION ALL SELECT 2, 'Inspection',         'INSPECTION'
        UNION ALL SELECT 3, 'Diagnosis',          'DIAGNOSIS'
        UNION ALL SELECT 4, 'Awaiting Approval',  'AWAITING_APPROVAL'
        UNION ALL SELECT 5, 'Repair In Progress', 'IN_PROGRESS'
        UNION ALL SELECT 6, 'Quality Check',      'QUALITY_CHECK'
        UNION ALL SELECT 7, 'Ready',              'READY'
        UNION ALL SELECT 8, 'Collected',          'COLLECTED') s
CROSS JOIN (SELECT jc.*,
                   CASE jc.status WHEN 'INSPECTION' THEN 2 WHEN 'DIAGNOSIS' THEN 3
                                  WHEN 'AWAITING_APPROVAL' THEN 4 WHEN 'IN_PROGRESS' THEN 5
                                  WHEN 'QUALITY_CHECK' THEN 6 WHEN 'READY' THEN 7 ELSE 8 END AS stage_rank
              FROM job_card jc
              JOIN vehicle vv ON vv.vehicle_id = jc.vehicle_id
             WHERE vv.registration_no = 'WP-CAV-9548'
             ORDER BY jc.check_in_at DESC
             LIMIT 1) j
LEFT JOIN appointment a       ON a.appointment_id = j.appointment_id
LEFT JOIN v_invoice_summary b ON b.job_card_id = j.job_card_id
ORDER BY s.stage_no;

-- 2.3 Extra work waiting for customer approval, with estimated labour cost
SELECT  j.job_card_id,
        v.registration_no,
        CONCAT(c.first_name, ' ', c.last_name)       AS customer,
        t.description                                AS additional_task,
        t.labour_hours,
        t.labour_hours * st.labour_rate              AS est_labour_cost
FROM    repair_task t
JOIN    job_card j      ON j.job_card_id = t.job_card_id
JOIN    vehicle v       ON v.vehicle_id = j.vehicle_id
JOIN    customer c      ON c.customer_id = v.customer_id
JOIN    appointment a   ON a.appointment_id = j.appointment_id
JOIN    service_type st ON st.service_type_id = a.service_type_id
WHERE   t.approval_status = 'PENDING'
ORDER BY j.job_card_id, t.task_no;

-- 2.4 Vehicles dropped off but not yet inspected (with waiting time)
SELECT  j.job_card_id,
        CONCAT(v.registration_no, ' - ', v.make, ' ', v.model)              AS vehicle,
        j.check_in_at,
        COALESCE(CONCAT(m.first_name, ' ', m.last_name), 'Not assigned')   AS mechanic,
        TIMESTAMPDIFF(HOUR, j.check_in_at, NOW())                           AS hours_waiting
FROM    job_card j
JOIN    vehicle v    ON v.vehicle_id = j.vehicle_id
LEFT JOIN employee m ON m.employee_id = j.mechanic_id
WHERE   j.status = 'INSPECTION'
  AND   NOT EXISTS (SELECT 1 FROM inspection i WHERE i.job_card_id = j.job_card_id)
ORDER BY j.check_in_at;

-- 2.5 Average time spent in each workflow stage (from the stage history)
SELECT  h.status                                                        AS stage,
        COUNT(*)                                                        AS times_passed,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, h.changed_at, h.next_at)) / 60, 1) AS avg_hours
FROM   (SELECT status, changed_at,
               LEAD(changed_at) OVER (PARTITION BY job_card_id ORDER BY changed_at) AS next_at
          FROM job_status_history) h
WHERE   h.next_at IS NOT NULL
GROUP BY h.status
ORDER BY MIN(CASE h.status WHEN 'INSPECTION' THEN 2 WHEN 'DIAGNOSIS' THEN 3 WHEN 'AWAITING_APPROVAL' THEN 4
                           WHEN 'IN_PROGRESS' THEN 5 WHEN 'QUALITY_CHECK' THEN 6 WHEN 'READY' THEN 7 END);


-- (03) Tevindu [IT number] – Inventory & Spare Parts

-- 3.1 Low-stock alert with the supplier to re-order from
SELECT  p.part_code,
        p.part_name,
        p.quantity_in_stock,
        p.reorder_level,
        s.supplier_name     AS preferred_supplier,
        s.phone_no,
        sp.lead_time_days
FROM    spare_part p
LEFT JOIN supplier_part sp ON sp.part_id = p.part_id AND sp.is_preferred = TRUE
LEFT JOIN supplier s       ON s.supplier_id = sp.supplier_id
WHERE   p.is_active = TRUE
  AND   p.quantity_in_stock <= p.reorder_level
ORDER BY p.quantity_in_stock - p.reorder_level, p.part_code;

-- 3.2 Most used parts in a month in jobs (September 2026)
SELECT  p.part_code,
        p.part_name,
        SUM(u.quantity)                             AS qty_issued,
        COUNT(DISTINCT u.job_card_id)               AS jobs,
        SUM(u.quantity * u.unit_price_at_issue)     AS value_issued
FROM    part_usage u
JOIN    spare_part p ON p.part_id = u.part_id
WHERE   u.issued_at >= '2026-09-01' AND u.issued_at < '2026-10-01'
GROUP BY p.part_id, p.part_code, p.part_name
ORDER BY qty_issued DESC, value_issued DESC
LIMIT 5;

-- 3.3 Cheapest supplier for every part
SELECT  p.part_name,
        s.supplier_name   AS cheapest_supplier,
        sp.unit_cost,
        sp.is_preferred
FROM    supplier_part sp
JOIN    spare_part p ON p.part_id = sp.part_id
JOIN    supplier s   ON s.supplier_id = sp.supplier_id
WHERE   sp.unit_cost = (SELECT MIN(sp2.unit_cost)
                          FROM supplier_part sp2
                         WHERE sp2.part_id = sp.part_id)
ORDER BY p.part_id;

-- 3.4 One part's (OIL-5W30-4L) stock movement with a running balance
SELECT  DATE(t.txn_at)                                   AS txn_date,
        t.txn_type,
        t.quantity,
        SUM(t.quantity) OVER (ORDER BY t.txn_at, t.transaction_id) AS balance,
        COALESCE(s.supplier_name, t.note)                AS details
FROM    inventory_transaction t
JOIN    spare_part p ON p.part_id = t.part_id
LEFT JOIN supplier s ON s.supplier_id = t.supplier_id
WHERE   p.part_code = 'OIL-5W30-4L'
ORDER BY t.txn_at, t.transaction_id;

-- 3.5 Open part requests with stock available
SELECT  r.request_id,
        r.job_card_id,
        CONCAT(v.registration_no, ' - ', v.make, ' ', v.model) AS vehicle,
        CONCAT(m.first_name, ' ', m.last_name)  AS mechanic,
        p.part_name,
        r.quantity                              AS qty_requested,
        p.quantity_in_stock                     AS in_stock,
        CASE WHEN p.quantity_in_stock >= r.quantity THEN 'Can issue' ELSE 'Back-order' END AS action
FROM    part_request r
JOIN    job_card j   ON j.job_card_id = r.job_card_id
JOIN    vehicle v    ON v.vehicle_id = j.vehicle_id
JOIN    spare_part p ON p.part_id = r.part_id
LEFT JOIN employee m ON m.employee_id = j.mechanic_id
WHERE   r.status IN ('PENDING','BACK_ORDERED')
ORDER BY r.requested_at;


-- (04) Sew [IT number] – Packages, Billing, Payments & Feedback
-- 4.1 Itemised invoice for printing (INV-2026-0001)
SELECT  ii.line_no,
        ii.item_type,
        ii.description,
        ii.quantity,
        ii.unit_price,
        ii.line_amount
FROM    invoice i
JOIN    invoice_item ii ON ii.invoice_id = i.invoice_id
WHERE   i.invoice_no = 'INV-2026-0001'
ORDER BY ii.line_no;

-- 4.2 Outstanding bills
SELECT  s.invoice_no,
        CONCAT(c.first_name, ' ', c.last_name)   AS customer,
        s.total,
        s.deposit_paid,
        s.amount_paid,
        s.balance_due,
        DATEDIFF(CURDATE(), s.invoice_date)      AS days_outstanding
FROM    v_invoice_summary s
JOIN    job_card j  ON j.job_card_id = s.job_card_id
JOIN    vehicle v   ON v.vehicle_id = j.vehicle_id
JOIN    customer c  ON c.customer_id = v.customer_id
WHERE   s.status <> 'CANCELLED'
  AND   s.balance_due > 0
ORDER BY days_outstanding DESC;

-- 4.3 Payment slips waiting to be checked (with the amount expected)
SELECT  p.payment_id,
        p.payment_type,
        CONCAT(c.first_name, ' ', c.last_name)                       AS customer,
        COALESCE(CONCAT('Booking ', a.appointment_id), s.invoice_no) AS paying_for,
        p.amount                                                     AS slip_amount,
        CASE WHEN p.payment_type = 'DEPOSIT' THEN a.deposit_amount
             ELSE s.balance_due END                                  AS amount_expected,
        p.uploaded_at,
        TIMESTAMPDIFF(HOUR, p.uploaded_at, NOW())                    AS hours_waiting
FROM    payment p
LEFT JOIN appointment a       ON a.appointment_id = p.appointment_id
LEFT JOIN v_invoice_summary s ON s.invoice_id = p.invoice_id
LEFT JOIN job_card j          ON j.job_card_id = s.job_card_id
LEFT JOIN vehicle v           ON v.vehicle_id = j.vehicle_id
JOIN    customer c            ON c.customer_id = COALESCE(a.customer_id, v.customer_id)
WHERE   p.status = 'PENDING'
ORDER BY p.uploaded_at;

-- 4.4 Bookings, cancellations, amount billed and average customer rating per package
SELECT  st.service_name                                                       AS package,
        st.pricing_type,
        st.base_price,
        (SELECT COUNT(*) FROM appointment a
          WHERE a.service_type_id = st.service_type_id AND a.status <> 'CANCELLED')  AS bookings,
        (SELECT COUNT(*) FROM appointment a
          WHERE a.service_type_id = st.service_type_id AND a.status = 'CANCELLED')   AS cancelled,
        (SELECT COALESCE(SUM(s.total), 0) FROM v_invoice_summary s
           JOIN job_card j    ON j.job_card_id = s.job_card_id
           JOIN appointment a ON a.appointment_id = j.appointment_id
          WHERE a.service_type_id = st.service_type_id)                       AS total_billed,
        (SELECT ROUND(AVG(f.rating), 2) FROM feedback f
           JOIN job_card j    ON j.job_card_id = f.job_card_id
           JOIN appointment a ON a.appointment_id = j.appointment_id
          WHERE a.service_type_id = st.service_type_id)                       AS avg_rating
FROM    service_type st
ORDER BY total_billed DESC;

-- 4.5 Cancellations with penalty and refunds ( according to the 24-hour rule)
SELECT  a.appointment_id,
        CONCAT(c.first_name, ' ', c.last_name)   AS customer,
        st.service_name                          AS package,
        a.scheduled_at,
        a.cancelled_at,
        r.notice_hours,
        r.deposit_paid,
        r.penalty_amount,
        r.refund_amount,
        r.status                                 AS refund_status
FROM    refund r
JOIN    appointment a   ON a.appointment_id = r.appointment_id
JOIN    customer c      ON c.customer_id = a.customer_id
JOIN    service_type st ON st.service_type_id = a.service_type_id
ORDER BY a.cancelled_at;
