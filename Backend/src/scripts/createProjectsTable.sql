-- Migration script to add Projects Management functionality
-- Run this script on your MySQL database

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_name VARCHAR(255) NOT NULL,
  client_id INT NOT NULL,
  project_type ENUM('Residential', 'Commercial', 'Renovation', 'Other') DEFAULT 'Other',
  status ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled') DEFAULT 'Planning',
  start_date DATE NOT NULL,
  expected_completion_date DATE,
  actual_completion_date DATE,
  estimated_budget DECIMAL(15, 2),
  actual_cost DECIMAL(15, 2),
  description TEXT,
  scope_of_work TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Alter tasks table to add project association
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS project_id INT NULL,
ADD CONSTRAINT fk_tasks_project 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- 3. Create index for better query performance
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- Verification queries (run these to check if tables were created successfully)
-- SHOW COLUMNS FROM projects;
-- SHOW COLUMNS FROM tasks;
-- SELECT * FROM projects LIMIT 1;
