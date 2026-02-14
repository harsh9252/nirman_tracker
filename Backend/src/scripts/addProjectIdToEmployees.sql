-- Migration script to add project_id to employees table
ALTER TABLE employees ADD COLUMN project_id INT AFTER status;

-- Add foreign key constraint
ALTER TABLE employees ADD CONSTRAINT fk_employee_project 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_employees_project_id ON employees(project_id);
