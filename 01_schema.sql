
--  ScannerPoint – Garage & Vehicle Diagnostics Database
--  SE2032 Database Management Systems · Group SE2012_GRP_08

DROP DATABASE IF EXISTS scannerpoint;
CREATE DATABASE scannerpoint CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE scannerpoint;

-- Member 1 – Aneesha [IT number]: USER_ACCOUNT, CUSTOMER, CUSTOMER_PHONE, VEHICLE, VEHICLE_DOCUMENT, APPOINTMENT
CREATE TABLE user_account (
    user_id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    username        VARCHAR(50)   NOT NULL,
    password_hash   CHAR(60)      NOT NULL,
    email           VARCHAR(100)  NOT NULL,
    user_type       ENUM('CUSTOMER','EMPLOYEE') NOT NULL,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_account PRIMARY KEY (user_id),
    CONSTRAINT uq_user_username UNIQUE (username),
    CONSTRAINT uq_user_email    UNIQUE (email),
    CONSTRAINT chk_user_email   CHECK (email LIKE '%_@_%._%')
) ENGINE = InnoDB;

CREATE TABLE customer (
    customer_id     INT UNSIGNED  NOT NULL,
    first_name      VARCHAR(50)   NOT NULL,
    last_name       VARCHAR(50)   NOT NULL,
    nic             VARCHAR(12)   NOT NULL,
    street          VARCHAR(100)  NOT NULL,
    city            VARCHAR(50)   NOT NULL,
    postal_code     CHAR(5)       NULL,
    registered_date DATE          NOT NULL,
    CONSTRAINT pk_customer PRIMARY KEY (customer_id),
    CONSTRAINT uq_customer_nic UNIQUE (nic),
    CONSTRAINT fk_customer_user FOREIGN KEY (customer_id)
        REFERENCES user_account (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_customer_nic CHECK (nic REGEXP '^([0-9]{9}[VvXx]|[0-9]{12})$')
) ENGINE = InnoDB;

CREATE TABLE customer_phone (
    customer_id     INT UNSIGNED  NOT NULL,
    phone_no        CHAR(10)      NOT NULL,
    phone_type      ENUM('MOBILE','HOME','WORK') NOT NULL DEFAULT 'MOBILE',
    CONSTRAINT pk_customer_phone PRIMARY KEY (customer_id, phone_no),
    CONSTRAINT fk_phone_customer FOREIGN KEY (customer_id)
        REFERENCES customer (customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_phone_format CHECK (phone_no REGEXP '^0[0-9]{9}$')
) ENGINE = InnoDB;

CREATE TABLE vehicle (
    vehicle_id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    customer_id           INT UNSIGNED  NOT NULL,
    registration_no       VARCHAR(12)   NOT NULL,   -- e.g. WP-CAV-9548
    province_code         CHAR(2)       GENERATED ALWAYS AS (LEFT(registration_no, 2)) STORED,
    make                  VARCHAR(30)   NOT NULL,
    model                 VARCHAR(30)   NOT NULL,
    manufacture_year      SMALLINT      NOT NULL,
    fuel_type             ENUM('PETROL','DIESEL','HYBRID','ELECTRIC') NOT NULL,
    current_mileage       INT UNSIGNED  NOT NULL DEFAULT 0,
    last_service_date     DATE          NULL,
    last_service_mileage  INT UNSIGNED  NULL,
    CONSTRAINT pk_vehicle PRIMARY KEY (vehicle_id),
    CONSTRAINT uq_vehicle_reg UNIQUE (registration_no),
    CONSTRAINT fk_vehicle_customer FOREIGN KEY (customer_id)
        REFERENCES customer (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_vehicle_reg CHECK (registration_no REGEXP '^(WP|CP|SP|NP|EP|NW|NC|UP|SG)-[A-Z]{2,3}-[0-9]{4}$'),
    CONSTRAINT chk_vehicle_year CHECK (manufacture_year BETWEEN 1950 AND 2100),
    CONSTRAINT chk_vehicle_service_km CHECK (last_service_mileage IS NULL OR last_service_mileage <= current_mileage)
) ENGINE = InnoDB;

-- driving licence and insurance uploaded online, verified by the receptionist when the vehicle arrives
CREATE TABLE vehicle_document (
    document_id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    vehicle_id          INT UNSIGNED  NOT NULL,
    doc_type            ENUM('DRIVING_LICENCE','INSURANCE') NOT NULL,
    document_no         VARCHAR(30)   NOT NULL,
    file_path           VARCHAR(255)  NOT NULL,
    expiry_date         DATE          NOT NULL,
    uploaded_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status              ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
    verified_by         INT UNSIGNED  NULL,       -- FK added once EMPLOYEE exists
    verified_at         DATETIME      NULL,
    reject_reason       VARCHAR(150)  NULL,
    CONSTRAINT pk_vehicle_document PRIMARY KEY (document_id),
    CONSTRAINT fk_doc_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicle (vehicle_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_doc_verified CHECK (
        (status = 'PENDING' AND verified_by IS NULL AND verified_at IS NULL)
        OR (status <> 'PENDING' AND verified_by IS NOT NULL AND verified_at IS NOT NULL)),
    CONSTRAINT chk_doc_reason CHECK (status <> 'REJECTED' OR reject_reason IS NOT NULL)
) ENGINE = InnoDB;

CREATE TABLE appointment (
    appointment_id      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    customer_id         INT UNSIGNED  NOT NULL,
    vehicle_id          INT UNSIGNED  NOT NULL,
    service_type_id     INT UNSIGNED  NOT NULL,   -- FK added once SERVICE_TYPE exists
    scheduled_at        DATETIME      NOT NULL,
    bay_no              TINYINT UNSIGNED NOT NULL,
    status              ENUM('PENDING','CONFIRMED','CHECKED_IN','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'PENDING',
    problem_description VARCHAR(255)  NULL,
    deposit_amount      DECIMAL(10,2) NOT NULL,   -- 50% of the package price at the time of booking
    confirmed_by        INT UNSIGNED  NULL,       -- FK added once EMPLOYEE exists
    confirmed_at        DATETIME      NULL,
    cancelled_at        DATETIME      NULL,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_appointment PRIMARY KEY (appointment_id),
    CONSTRAINT fk_appt_customer FOREIGN KEY (customer_id)
        REFERENCES customer (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_appt_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicle (vehicle_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_appt_bay CHECK (bay_no BETWEEN 1 AND 4),
    CONSTRAINT chk_appt_deposit CHECK (deposit_amount > 0),
    CONSTRAINT chk_appt_confirmed CHECK (status NOT IN ('CONFIRMED','CHECKED_IN') OR confirmed_at IS NOT NULL),
    CONSTRAINT chk_appt_cancelled CHECK ((status = 'CANCELLED') = (cancelled_at IS NOT NULL))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Member 2 – Sohan [IT number]: EMPLOYEE, JOB_CARD, JOB_STATUS_HISTORY, INSPECTION, REPAIR_TASK,
--                                NOTIFICATION
-- ---------------------------------------------------------------------
CREATE TABLE employee (
    employee_id     INT UNSIGNED  NOT NULL,
    first_name      VARCHAR(50)   NOT NULL,
    last_name       VARCHAR(50)   NOT NULL,
    emp_role        ENUM('RECEPTIONIST','MECHANIC','STOREKEEPER','ADMIN') NOT NULL,
    phone_no        CHAR(10)      NOT NULL,
    hire_date       DATE          NOT NULL,
    specialization  VARCHAR(50)   NULL,
    hourly_rate     DECIMAL(8,2)  NULL,
    CONSTRAINT pk_employee PRIMARY KEY (employee_id),
    CONSTRAINT fk_employee_user FOREIGN KEY (employee_id)
        REFERENCES user_account (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    -- mechanic-specific attributes are present only for mechanics
    CONSTRAINT chk_employee_mechanic CHECK (
        (emp_role = 'MECHANIC' AND hourly_rate IS NOT NULL AND hourly_rate > 0)
        OR (emp_role <> 'MECHANIC' AND hourly_rate IS NULL AND specialization IS NULL))
) ENGINE = InnoDB;



CREATE TABLE job_card (
    job_card_id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    vehicle_id           INT UNSIGNED  NOT NULL,
    appointment_id       INT UNSIGNED  NULL,
    created_by           INT UNSIGNED  NOT NULL,
    mechanic_id          INT UNSIGNED  NULL,
    check_in_at          DATETIME      NOT NULL,
    check_in_mileage     INT UNSIGNED  NOT NULL,
    status               ENUM('INSPECTION','DIAGNOSIS','AWAITING_APPROVAL','IN_PROGRESS',
                              'QUALITY_CHECK','READY','COLLECTED') NOT NULL DEFAULT 'INSPECTION',
    status_changed_at    DATETIME      NOT NULL,
    status_changed_by    INT UNSIGNED  NULL,
    estimated_completion DATETIME      NULL,
    completed_at         DATETIME      NULL,
    CONSTRAINT pk_job_card PRIMARY KEY (job_card_id),
    CONSTRAINT uq_job_card_appt UNIQUE (appointment_id),
    CONSTRAINT fk_job_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicle (vehicle_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_job_appointment FOREIGN KEY (appointment_id)
        REFERENCES appointment (appointment_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_job_created_by FOREIGN KEY (created_by)
        REFERENCES employee (employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_job_mechanic FOREIGN KEY (mechanic_id)
        REFERENCES employee (employee_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_job_status_by FOREIGN KEY (status_changed_by)
        REFERENCES employee (employee_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_job_dates CHECK (completed_at IS NULL OR completed_at >= check_in_at)
) ENGINE = InnoDB;

-- every stage a job card reaches, with time and employee (drives the customer workflow boxes)
CREATE TABLE job_status_history (
    history_id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    job_card_id         INT UNSIGNED  NOT NULL,
    status              ENUM('INSPECTION','DIAGNOSIS','AWAITING_APPROVAL','IN_PROGRESS',
                             'QUALITY_CHECK','READY','COLLECTED') NOT NULL,
    changed_at          DATETIME      NOT NULL,
    changed_by          INT UNSIGNED  NULL,
    CONSTRAINT pk_job_status_history PRIMARY KEY (history_id),
    CONSTRAINT fk_hist_job FOREIGN KEY (job_card_id)
        REFERENCES job_card (job_card_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_hist_changed_by FOREIGN KEY (changed_by)
        REFERENCES employee (employee_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE repair_task (
    job_card_id      INT UNSIGNED  NOT NULL,
    task_no          TINYINT UNSIGNED NOT NULL,
    description      VARCHAR(150)  NOT NULL,
    labour_hours     DECIMAL(4,1)  NOT NULL,
    is_additional    BOOLEAN       NOT NULL DEFAULT FALSE,
    approval_status  ENUM('NOT_REQUIRED','PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'NOT_REQUIRED',
    task_status      ENUM('PENDING','IN_PROGRESS','DONE','CANCELLED') NOT NULL DEFAULT 'PENDING',
    CONSTRAINT pk_repair_task PRIMARY KEY (job_card_id, task_no),
    CONSTRAINT fk_task_job FOREIGN KEY (job_card_id)
        REFERENCES job_card (job_card_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_task_hours CHECK (labour_hours > 0),
    -- extra work found during diagnosis must go through customer approval
    CONSTRAINT chk_task_approval CHECK (
        (is_additional = FALSE AND approval_status = 'NOT_REQUIRED')
        OR (is_additional = TRUE AND approval_status <> 'NOT_REQUIRED'))
) ENGINE = InnoDB;

-- 1:1 weak entity of JOB_CARD (shares the job card's primary key)
CREATE TABLE inspection (
    job_card_id         INT UNSIGNED  NOT NULL,
    inspected_at        DATETIME      NOT NULL,
    findings            VARCHAR(255)  NOT NULL,
    diagnosis           VARCHAR(255)  NULL,
    recommended_action  VARCHAR(255)  NULL,
    CONSTRAINT pk_inspection PRIMARY KEY (job_card_id),
    CONSTRAINT fk_inspection_job FOREIGN KEY (job_card_id)
        REFERENCES job_card (job_card_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE notification (
    notification_id     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    customer_id         INT UNSIGNED  NOT NULL,
    notif_type          ENUM('BOOKING_CONFIRMATION','SERVICE_REMINDER','APPROVAL_REQUEST',
                             'VEHICLE_READY','PAYMENT_RECEIPT') NOT NULL,
    channel             ENUM('EMAIL','SMS') NOT NULL,
    message             VARCHAR(255)  NOT NULL,
    sent_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_status     ENUM('SENT','FAILED') NOT NULL DEFAULT 'SENT',
    CONSTRAINT pk_notification PRIMARY KEY (notification_id),
    CONSTRAINT fk_notif_customer FOREIGN KEY (customer_id)
        REFERENCES customer (customer_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Member 3 – Tevindu [IT number]: SUPPLIER, SPARE_PART, SUPPLIER_PART, PART_REQUEST, PART_USAGE,
--                                  INVENTORY_TRANSACTION
-- ---------------------------------------------------------------------
CREATE TABLE supplier (
    supplier_id     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    supplier_name   VARCHAR(100)  NOT NULL,
    contact_person  VARCHAR(80)   NOT NULL,
    phone_no        CHAR(10)      NOT NULL,
    email           VARCHAR(100)  NULL,
    city            VARCHAR(50)   NOT NULL,
    CONSTRAINT pk_supplier PRIMARY KEY (supplier_id),
    CONSTRAINT uq_supplier_name UNIQUE (supplier_name)
) ENGINE = InnoDB;

CREATE TABLE spare_part (
    part_id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    part_code         VARCHAR(20)   NOT NULL,
    part_name         VARCHAR(100)  NOT NULL,
    category          ENUM('OIL','FILTER','BRAKES','SUSPENSION','ENGINE','ELECTRICAL','AC','ACCESSORIES') NOT NULL,
    unit_price        DECIMAL(10,2) NOT NULL,
    quantity_in_stock INT           NOT NULL DEFAULT 0,
    reorder_level     INT           NOT NULL DEFAULT 0,
    is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_spare_part PRIMARY KEY (part_id),
    CONSTRAINT uq_part_code UNIQUE (part_code),
    CONSTRAINT chk_part_price CHECK (unit_price >= 0),
    CONSTRAINT chk_part_stock CHECK (quantity_in_stock >= 0),
    CONSTRAINT chk_part_reorder CHECK (reorder_level >= 0)
) ENGINE = InnoDB;

CREATE TABLE supplier_part (
    supplier_id     INT UNSIGNED  NOT NULL,
    part_id         INT UNSIGNED  NOT NULL,
    unit_cost       DECIMAL(10,2) NOT NULL,
    lead_time_days  TINYINT UNSIGNED NOT NULL DEFAULT 1,
    is_preferred    BOOLEAN       NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_supplier_part PRIMARY KEY (supplier_id, part_id),
    CONSTRAINT fk_sp_supplier FOREIGN KEY (supplier_id)
        REFERENCES supplier (supplier_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sp_part FOREIGN KEY (part_id)
        REFERENCES spare_part (part_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_sp_cost CHECK (unit_cost > 0)
) ENGINE = InnoDB;

CREATE TABLE part_request (
    request_id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    job_card_id         INT UNSIGNED  NOT NULL,
    part_id             INT UNSIGNED  NOT NULL,
    quantity            SMALLINT UNSIGNED NOT NULL,
    requested_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status              ENUM('PENDING','ISSUED','REJECTED','BACK_ORDERED') NOT NULL DEFAULT 'PENDING',
    handled_by          INT UNSIGNED  NULL,
    handled_at          DATETIME      NULL,
    reject_reason       VARCHAR(150)  NULL,
    CONSTRAINT pk_part_request PRIMARY KEY (request_id),
    CONSTRAINT fk_req_job FOREIGN KEY (job_card_id)
        REFERENCES job_card (job_card_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_req_part FOREIGN KEY (part_id)
        REFERENCES spare_part (part_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_req_handled_by FOREIGN KEY (handled_by)
        REFERENCES employee (employee_id),   -- default NO ACTION: column is used in CHECK
    CONSTRAINT chk_req_qty CHECK (quantity > 0),
    -- a handled request records who handled it and when; a rejection needs a reason
    CONSTRAINT chk_req_handled CHECK (
        (status = 'PENDING' AND handled_by IS NULL AND handled_at IS NULL)
        OR (status <> 'PENDING' AND handled_by IS NOT NULL AND handled_at IS NOT NULL)),
    CONSTRAINT chk_req_reason CHECK (status <> 'REJECTED' OR reject_reason IS NOT NULL)
) ENGINE = InnoDB;

CREATE TABLE part_usage (
    usage_id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    job_card_id         INT UNSIGNED  NOT NULL,
    part_id             INT UNSIGNED  NOT NULL,
    quantity            SMALLINT UNSIGNED NOT NULL,
    unit_price_at_issue DECIMAL(10,2) NOT NULL,
    issued_by           INT UNSIGNED  NOT NULL,
    issued_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_part_usage PRIMARY KEY (usage_id),
    CONSTRAINT fk_usage_job FOREIGN KEY (job_card_id)
        REFERENCES job_card (job_card_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_usage_part FOREIGN KEY (part_id)
        REFERENCES spare_part (part_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_usage_issued_by FOREIGN KEY (issued_by)
        REFERENCES employee (employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_usage_qty CHECK (quantity > 0)
) ENGINE = InnoDB;

-- stock ledger: every movement in or out of the store (positive = in, negative = out)
CREATE TABLE inventory_transaction (
    transaction_id      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    part_id             INT UNSIGNED  NOT NULL,
    txn_type            ENUM('OPENING','RECEIPT','ISSUE','RETURN','ADJUSTMENT') NOT NULL,
    quantity            INT           NOT NULL,
    supplier_id         INT UNSIGNED  NULL,
    performed_by        INT UNSIGNED  NOT NULL,
    txn_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note                VARCHAR(150)  NULL,
    CONSTRAINT pk_inventory_transaction PRIMARY KEY (transaction_id),
    CONSTRAINT fk_txn_part FOREIGN KEY (part_id)
        REFERENCES spare_part (part_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_txn_supplier FOREIGN KEY (supplier_id)
        REFERENCES supplier (supplier_id),   -- default NO ACTION: column is used in CHECK
    CONSTRAINT fk_txn_performed_by FOREIGN KEY (performed_by)
        REFERENCES employee (employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_txn_sign CHECK (
        (txn_type IN ('OPENING','RECEIPT','RETURN') AND quantity > 0)
        OR (txn_type = 'ISSUE' AND quantity < 0)
        OR (txn_type = 'ADJUSTMENT' AND quantity <> 0)),
    -- only stock receipts come from a supplier, and every receipt must name one
    CONSTRAINT chk_txn_supplier CHECK ((txn_type = 'RECEIPT') = (supplier_id IS NOT NULL))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Member 4 – Sew [IT number]: SERVICE_TYPE, INVOICE, INVOICE_ITEM, PAYMENT, REFUND, FEEDBACK
-- ---------------------------------------------------------------------
-- the three service packages offered to customers
CREATE TABLE service_type (
    service_type_id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    service_name            VARCHAR(60)   NOT NULL,
    includes_work           VARCHAR(255)  NOT NULL,
    pricing_type            ENUM('FIXED','VARIABLE') NOT NULL,
    base_price              DECIMAL(10,2) NOT NULL,   -- package price, or diagnostic fee for VARIABLE
    deposit_percent         DECIMAL(5,2)  NOT NULL DEFAULT 50.00,
    labour_rate             DECIMAL(8,2)  NOT NULL,   -- per hour, for approved additional work
    service_interval_km     INT UNSIGNED  NULL,
    service_interval_months TINYINT UNSIGNED NULL,
    is_active               BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_service_type PRIMARY KEY (service_type_id),
    CONSTRAINT uq_service_name UNIQUE (service_name),
    CONSTRAINT chk_service_price CHECK (base_price > 0),
    CONSTRAINT chk_service_deposit CHECK (deposit_percent BETWEEN 0 AND 100),
    CONSTRAINT chk_service_rate CHECK (labour_rate > 0)
) ENGINE = InnoDB;

ALTER TABLE appointment
    ADD CONSTRAINT fk_appt_service_type FOREIGN KEY (service_type_id)
        REFERENCES service_type (service_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_appt_confirmed_by FOREIGN KEY (confirmed_by)
        REFERENCES employee (employee_id) ON DELETE SET NULL ON UPDATE CASCADE,
    -- one booking per bay per time slot (prevents double booking)
    ADD CONSTRAINT uq_appt_slot UNIQUE (scheduled_at, bay_no);

ALTER TABLE vehicle_document
    ADD CONSTRAINT fk_doc_verified_by FOREIGN KEY (verified_by)
        REFERENCES employee (employee_id);   -- default NO ACTION: column is used in CHECK

CREATE TABLE invoice (
    invoice_id      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    invoice_no      CHAR(13)      NOT NULL,
    job_card_id     INT UNSIGNED  NOT NULL,
    issued_by       INT UNSIGNED  NOT NULL,
    invoice_date    DATE          NOT NULL,
    discount        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate        DECIMAL(4,2)  NOT NULL DEFAULT 0.00,
    status          ENUM('DRAFT','ISSUED','PAID','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    warranty_until  DATE          NULL,
    CONSTRAINT pk_invoice PRIMARY KEY (invoice_id),
    CONSTRAINT uq_invoice_no UNIQUE (invoice_no),
    CONSTRAINT uq_invoice_job UNIQUE (job_card_id),
    CONSTRAINT fk_invoice_job FOREIGN KEY (job_card_id)
        REFERENCES job_card (job_card_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoice_issued_by FOREIGN KEY (issued_by)
        REFERENCES employee (employee_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_invoice_discount CHECK (discount >= 0),
    CONSTRAINT chk_invoice_tax CHECK (tax_rate BETWEEN 0 AND 30),
    CONSTRAINT chk_invoice_warranty CHECK (warranty_until IS NULL OR warranty_until >= invoice_date)
) ENGINE = InnoDB;

CREATE TABLE invoice_item (
    invoice_id      INT UNSIGNED  NOT NULL,
    line_no         TINYINT UNSIGNED NOT NULL,
    item_type       ENUM('PACKAGE','DIAGNOSTIC_FEE','LABOUR','PART') NOT NULL,
    description     VARCHAR(150)  NOT NULL,
    quantity        DECIMAL(6,2)  NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    line_amount     DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    CONSTRAINT pk_invoice_item PRIMARY KEY (invoice_id, line_no),
    CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id)
        REFERENCES invoice (invoice_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_item_qty CHECK (quantity > 0),
    CONSTRAINT chk_item_price CHECK (unit_price >= 0)
) ENGINE = InnoDB;

-- every payment is a bank transfer to the garage account; the customer uploads the slip
-- and the receptionist verifies it before the workflow moves on
CREATE TABLE payment (
    payment_id      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    payment_type    ENUM('DEPOSIT','FINAL') NOT NULL,
    appointment_id  INT UNSIGNED  NULL,       -- set for a DEPOSIT
    invoice_id      INT UNSIGNED  NULL,       -- set for a FINAL payment
    amount          DECIMAL(12,2) NOT NULL,
    slip_file       VARCHAR(255)  NOT NULL,
    bank_reference  VARCHAR(30)   NULL,
    paid_on         DATE          NOT NULL,   -- date printed on the bank slip
    uploaded_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status          ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
    verified_by     INT UNSIGNED  NULL,
    verified_at     DATETIME      NULL,
    reject_reason   VARCHAR(150)  NULL,
    CONSTRAINT pk_payment PRIMARY KEY (payment_id),
    -- the three FKs below use default NO ACTION because their columns appear in CHECKs
    CONSTRAINT fk_payment_appointment FOREIGN KEY (appointment_id) REFERENCES appointment (appointment_id),
    CONSTRAINT fk_payment_invoice     FOREIGN KEY (invoice_id)     REFERENCES invoice (invoice_id),
    CONSTRAINT fk_payment_verified_by FOREIGN KEY (verified_by)    REFERENCES employee (employee_id),
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_target CHECK (
        (payment_type = 'DEPOSIT' AND appointment_id IS NOT NULL AND invoice_id IS NULL)
        OR (payment_type = 'FINAL' AND invoice_id IS NOT NULL AND appointment_id IS NULL)),
    CONSTRAINT chk_payment_verified CHECK (
        (status = 'PENDING' AND verified_by IS NULL AND verified_at IS NULL)
        OR (status <> 'PENDING' AND verified_by IS NOT NULL AND verified_at IS NOT NULL)),
    CONSTRAINT chk_payment_reason CHECK (status <> 'REJECTED' OR reject_reason IS NOT NULL)
) ENGINE = InnoDB;

-- created by sp_cancel_appointment: what is kept as a penalty and what is returned
CREATE TABLE refund (
    refund_id       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    appointment_id  INT UNSIGNED  NOT NULL,
    deposit_paid    DECIMAL(10,2) NOT NULL,
    notice_hours    INT           NOT NULL,   -- hours between cancellation and the booked time
    penalty_amount  DECIMAL(10,2) NOT NULL,
    refund_amount   DECIMAL(10,2) NOT NULL,
    status          ENUM('PENDING','REFUNDED') NOT NULL DEFAULT 'PENDING',
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_by    INT UNSIGNED  NULL,
    processed_at    DATETIME      NULL,
    bank_reference  VARCHAR(30)   NULL,
    CONSTRAINT pk_refund PRIMARY KEY (refund_id),
    CONSTRAINT uq_refund_appointment UNIQUE (appointment_id),
    CONSTRAINT fk_refund_appointment FOREIGN KEY (appointment_id) REFERENCES appointment (appointment_id),
    CONSTRAINT fk_refund_processed_by FOREIGN KEY (processed_by) REFERENCES employee (employee_id),
    CONSTRAINT chk_refund_amounts CHECK (penalty_amount >= 0 AND refund_amount >= 0
                                         AND penalty_amount + refund_amount = deposit_paid),
    CONSTRAINT chk_refund_processed CHECK (
        (status = 'PENDING' AND processed_by IS NULL AND processed_at IS NULL)
        OR (status = 'REFUNDED' AND processed_by IS NOT NULL AND processed_at IS NOT NULL))
) ENGINE = InnoDB;

-- 1:1 weak entity of JOB_CARD: one rating per completed job
CREATE TABLE feedback (
    job_card_id         INT UNSIGNED  NOT NULL,
    rating              TINYINT UNSIGNED NOT NULL,
    comments            VARCHAR(255)  NULL,
    submitted_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_feedback PRIMARY KEY (job_card_id),
    CONSTRAINT fk_feedback_job FOREIGN KEY (job_card_id)
        REFERENCES job_card (job_card_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Indexes for frequent searches (NFR: performance)
-- ---------------------------------------------------------------------
CREATE INDEX idx_customer_name   ON customer (last_name, first_name);
CREATE INDEX idx_appt_scheduled  ON appointment (scheduled_at);
CREATE INDEX idx_job_status      ON job_card (status);
CREATE INDEX idx_payment_status   ON payment (status, uploaded_at);
CREATE INDEX idx_vehicle_province ON vehicle (province_code);
CREATE INDEX idx_doc_status       ON vehicle_document (status);
CREATE INDEX idx_hist_job_time    ON job_status_history (job_card_id, changed_at);
CREATE INDEX idx_usage_job_part  ON part_usage (job_card_id, part_id);
CREATE INDEX idx_txn_part_time   ON inventory_transaction (part_id, txn_at);
CREATE INDEX idx_request_status  ON part_request (status);

-- ---------------------------------------------------------------------
-- Triggers (business rules that CHECK constraints cannot express)
-- ---------------------------------------------------------------------

-- Aneesha: a booking is confirmed only after its deposit slip has been verified
DELIMITER $$

CREATE TRIGGER trg_appointment_confirm BEFORE UPDATE ON appointment
FOR EACH ROW
BEGIN
    IF NEW.status = 'CONFIRMED' AND OLD.status = 'PENDING' AND
       COALESCE((SELECT SUM(p.amount) FROM payment p
                 WHERE p.appointment_id = NEW.appointment_id
                   AND p.payment_type = 'DEPOSIT' AND p.status = 'VERIFIED'), 0) < NEW.deposit_amount
    THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Deposit has not been verified';
    END IF;
END$$

DELIMITER ;

DELIMITER $$
-- Sohan: only an employee with role MECHANIC may be assigned to a job card
CREATE TRIGGER trg_job_card_mechanic_ins BEFORE INSERT ON job_card
FOR EACH ROW
BEGIN
    IF NEW.mechanic_id IS NOT NULL AND
       (SELECT emp_role FROM employee WHERE employee_id = NEW.mechanic_id) <> 'MECHANIC' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Assigned employee is not a mechanic';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
-- Sohan: mechanic check on update, and a vehicle is released only when its bill is fully paid
CREATE TRIGGER trg_job_card_before_upd BEFORE UPDATE ON job_card
FOR EACH ROW
BEGIN
    IF NEW.mechanic_id IS NOT NULL AND
       (SELECT emp_role FROM employee WHERE employee_id = NEW.mechanic_id) <> 'MECHANIC' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Assigned employee is not a mechanic';
    END IF;
    IF NEW.status = 'COLLECTED' AND OLD.status <> 'COLLECTED' AND
       COALESCE((SELECT s.balance_due FROM v_invoice_summary s
                  WHERE s.job_card_id = NEW.job_card_id), 1) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Vehicle cannot be released until the bill is paid';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
-- Sohan: record the first stage when the vehicle is checked in ...
CREATE TRIGGER trg_job_card_history_ins AFTER INSERT ON job_card
FOR EACH ROW
BEGIN
    INSERT INTO job_status_history (job_card_id, status, changed_at, changed_by)
    VALUES (NEW.job_card_id, NEW.status, NEW.status_changed_at, NEW.status_changed_by);
END$$
DELIMITER ;

DELIMITER $$
-- ... and every later change of stage
CREATE TRIGGER trg_job_card_history_upd AFTER UPDATE ON job_card
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO job_status_history (job_card_id, status, changed_at, changed_by)
        VALUES (NEW.job_card_id, NEW.status, NEW.status_changed_at, NEW.status_changed_by);
    END IF;
END$$
DELIMITER ;

DELIMITER $$
-- Tevindu: refuse to issue more parts than are in stock
CREATE TRIGGER trg_part_usage_check BEFORE INSERT ON part_usage
FOR EACH ROW
BEGIN
    IF (SELECT quantity_in_stock FROM spare_part WHERE part_id = NEW.part_id) < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for this part';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
-- Tevindu: every part issued to a job is written to the stock ledger
CREATE TRIGGER trg_part_usage_ledger AFTER INSERT ON part_usage
FOR EACH ROW
BEGIN
    INSERT INTO inventory_transaction (part_id, txn_type, quantity, supplier_id, performed_by, txn_at, note)
    VALUES (NEW.part_id, 'ISSUE', -NEW.quantity, NULL, NEW.issued_by, NEW.issued_at,
            CONCAT('Issued to job card ', NEW.job_card_id));
END$$
DELIMITER ;

DELIMITER $$
-- Tevindu: no ledger movement may take stock below zero
CREATE TRIGGER trg_inv_txn_check BEFORE INSERT ON inventory_transaction
FOR EACH ROW
BEGIN
    IF (SELECT quantity_in_stock FROM spare_part WHERE part_id = NEW.part_id) + NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock movement would make stock negative';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
-- Tevindu: the stock level is kept equal to the sum of the ledger
CREATE TRIGGER trg_inv_txn_apply AFTER INSERT ON inventory_transaction
FOR EACH ROW
BEGIN
    UPDATE spare_part
       SET quantity_in_stock = quantity_in_stock + NEW.quantity
     WHERE part_id = NEW.part_id;
END$$
DELIMITER ;

DELIMITER $$
-- Aneesha + Sew: cancel a booking and apply the 24-hour rule
--   24 hours or more before the booked time -> the whole deposit is refunded
--   less than 24 hours                      -> 50% of the deposit is kept as a penalty
CREATE PROCEDURE sp_cancel_appointment(IN p_appointment_id INT UNSIGNED, IN p_cancelled_at DATETIME)
BEGIN
    DECLARE v_status    VARCHAR(20);
    DECLARE v_scheduled DATETIME;
    DECLARE v_paid      DECIMAL(10,2);
    DECLARE v_hours     INT;
    DECLARE v_penalty   DECIMAL(10,2);

    START TRANSACTION;
    SELECT status, scheduled_at INTO v_status, v_scheduled
      FROM appointment WHERE appointment_id = p_appointment_id FOR UPDATE;

    IF v_status IS NULL THEN
        ROLLBACK; SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Appointment not found';
    ELSEIF v_status NOT IN ('PENDING','CONFIRMED') THEN
        ROLLBACK; SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only pending or confirmed bookings can be cancelled';
    ELSEIF p_cancelled_at >= v_scheduled THEN
        ROLLBACK; SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The booked time has already passed';
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid
      FROM payment
     WHERE appointment_id = p_appointment_id AND payment_type = 'DEPOSIT' AND status = 'VERIFIED';

    SET v_hours   = TIMESTAMPDIFF(HOUR, p_cancelled_at, v_scheduled);
    SET v_penalty = IF(v_hours >= 24, 0.00, ROUND(v_paid * 0.50, 2));

    UPDATE appointment
       SET status = 'CANCELLED', cancelled_at = p_cancelled_at
     WHERE appointment_id = p_appointment_id;

    IF v_paid > 0 THEN
        INSERT INTO refund (appointment_id, deposit_paid, notice_hours, penalty_amount, refund_amount, created_at)
        VALUES (p_appointment_id, v_paid, v_hours, v_penalty, v_paid - v_penalty, p_cancelled_at);
    END IF;
    COMMIT;
END$$

DELIMITER ;

DELIMITER $$
-- ---------------------------------------------------------------------
-- Sew: invoice totals are derived, never stored (avoids update anomalies).
--      The verified deposit of the booking is deducted from the bill.
CREATE VIEW v_invoice_summary AS
SELECT  i.invoice_id,
        i.invoice_no,
        i.job_card_id,
        i.invoice_date,
        i.status,
        s.subtotal,
        i.discount,
        ROUND((s.subtotal - i.discount) * i.tax_rate / 100, 2)               AS tax_amount,
        ROUND((s.subtotal - i.discount) * (1 + i.tax_rate / 100), 2)         AS total,
        COALESCE(d.deposit_paid, 0)                                           AS deposit_paid,
        COALESCE(p.paid, 0)                                                   AS amount_paid,
        ROUND((s.subtotal - i.discount) * (1 + i.tax_rate / 100), 2)
            - COALESCE(d.deposit_paid, 0) - COALESCE(p.paid, 0)               AS balance_due
FROM    invoice i
JOIN    job_card j ON j.job_card_id = i.job_card_id
JOIN   (SELECT invoice_id, SUM(line_amount) AS subtotal
          FROM invoice_item GROUP BY invoice_id) s ON s.invoice_id = i.invoice_id
LEFT JOIN (SELECT appointment_id, SUM(amount) AS deposit_paid
             FROM payment WHERE payment_type = 'DEPOSIT' AND status = 'VERIFIED'
            GROUP BY appointment_id) d ON d.appointment_id = j.appointment_id
LEFT JOIN (SELECT invoice_id, SUM(amount) AS paid
             FROM payment WHERE payment_type = 'FINAL' AND status = 'VERIFIED'
            GROUP BY invoice_id) p ON p.invoice_id = i.invoice_id;

