-- Migration script to add Employee Management functionality
-- Run this script on your MySQL database

CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(100),
  department VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  joining_date DATE,
  salary DECIMAL(15, 2),
  status ENUM('Active', 'Inactive', 'On Leave', 'Pantry') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexing for performance
CREATE INDEX idx_employees_name ON employees(name);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_phone ON employees(phone);
