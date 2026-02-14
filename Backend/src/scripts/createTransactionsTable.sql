-- Migration script to add Transaction Management functionality
-- Run this script on your MySQL database

CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  type ENUM('Payment In', 'Payment Out', 'Material Purchase', 'Material Return') NOT NULL,
  party_name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  payment_method ENUM('cash', 'bank', 'cheque') DEFAULT 'cash',
  bank_account VARCHAR(255),
  cost_code VARCHAR(100),
  reference_no VARCHAR(100),
  date DATE NOT NULL,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexing for performance
CREATE INDEX idx_transactions_project_id ON transactions(project_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);
