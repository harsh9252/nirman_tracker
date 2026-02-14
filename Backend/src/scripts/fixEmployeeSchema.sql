-- Migration to fix employee table schema mismatch
ALTER TABLE employees ADD COLUMN IF NOT EXISTS designation VARCHAR(100) AFTER name;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department VARCHAR(100) AFTER designation;

-- Check if join_date exists and rename it to joining_date if it does
-- Note: MySQL 8.0+ supports RENAME COLUMN, for older versions we might need to use CHANGE
-- Let's use CHANGE which is more compatible
ALTER TABLE employees CHANGE COLUMN join_date joining_date DATE;

-- Ensure status has the correct ENUM values if needed, or just leave as is if it's compatible
-- The model uses 'Active', 'Inactive', 'On Leave', 'Pantry'
-- The database has 'Active', 'Inactive'
ALTER TABLE employees MODIFY COLUMN status ENUM('Active', 'Inactive', 'On Leave', 'Pantry') DEFAULT 'Active';

-- Ensure salary is decimal(15,2) as per script
ALTER TABLE employees MODIFY COLUMN salary DECIMAL(15, 2);
