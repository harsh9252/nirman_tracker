-- Phase 1: Salary Types Lookup
CREATE TABLE IF NOT EXISTS salary_types (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(50) NOT NULL UNIQUE,
   description VARCHAR(255)
);

-- Seed data for salary types
INSERT IGNORE INTO salary_types (id, name) VALUES
(1, 'Monthly'),
(2, 'Daily'),
(3, 'Hourly');

-- Phase 2: Employees Update
-- Add salary_type_id to employees (will handle existence in JS runner if needed, 
-- but we'll try standard ALTER first)
-- ALTER TABLE employees ADD COLUMN salary_type_id INT NOT NULL DEFAULT 1;

-- Phase 3: Employee Project Rates
CREATE TABLE IF NOT EXISTS employee_project_rates (
   id INT AUTO_INCREMENT PRIMARY KEY,
   employee_id INT NOT NULL,
   project_id INT NOT NULL,
   rate_type ENUM('Hourly','Daily','Monthly') NOT NULL,
   rate DECIMAL(10,2) NOT NULL,
   effective_from DATE NOT NULL,
   effective_to DATE NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
   FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
   UNIQUE (employee_id, project_id, effective_from)
);

-- Phase 4: Attendance Updates (Missing columns)
-- ALTER TABLE attendance ADD COLUMN check_in_time TIME;
-- ALTER TABLE attendance ADD COLUMN check_out_time TIME;
-- ALTER TABLE attendance ADD COLUMN applied_rate DECIMAL(10,2);
-- ALTER TABLE attendance ADD COLUMN calculated_amount DECIMAL(10,2);
-- ALTER TABLE attendance MODIFY COLUMN shift_hours DECIMAL(5,2);

-- Phase 5: Salary Slips
CREATE TABLE IF NOT EXISTS salary_slips (
   id INT AUTO_INCREMENT PRIMARY KEY,
   employee_id INT NOT NULL,
   period_start DATE NOT NULL,
   period_end DATE NOT NULL,
   gross_amount DECIMAL(10,2) NOT NULL,
   deductions DECIMAL(10,2) DEFAULT 0,
   net_amount DECIMAL(10,2) NOT NULL,
   status ENUM('Pending','Approved','Paid') DEFAULT 'Pending',
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
   UNIQUE (employee_id, period_start, period_end)
);

-- Phase 6: Salary Payments
CREATE TABLE IF NOT EXISTS salary_payments (
   id INT AUTO_INCREMENT PRIMARY KEY,
   salary_slip_id INT NOT NULL,
   employee_id INT NOT NULL,
   amount DECIMAL(10,2) NOT NULL,
   payment_date DATE NOT NULL,
   payment_method ENUM('Cash','Bank Transfer','Cheque','UPI'),
   transaction_reference VARCHAR(255),
   notes TEXT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (salary_slip_id) REFERENCES salary_slips(id) ON DELETE CASCADE,
   FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Phase 7: Indexes
-- Indexes for performance
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX idx_attendance_project ON attendance(project_id);
-- Indexes for project rates and salary slips
CREATE INDEX idx_project_rates_active ON employee_project_rates(employee_id, project_id, effective_from);
CREATE INDEX idx_salary_slips_employee ON salary_slips(employee_id, period_start);
