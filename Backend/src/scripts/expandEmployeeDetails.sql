-- Migration to expand employee details
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100) AFTER salary,
ADD COLUMN IF NOT EXISTS account_number VARCHAR(50) AFTER bank_name,
ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20) AFTER account_number,
ADD COLUMN IF NOT EXISTS employment_type ENUM('Monthly', 'Part-time', 'Daily Wage', 'Contract') DEFAULT 'Monthly' AFTER ifsc_code,
ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20) AFTER employment_type,
ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20) AFTER aadhaar_number,
ADD COLUMN IF NOT EXISTS profile_image LONGTEXT AFTER pan_number;
