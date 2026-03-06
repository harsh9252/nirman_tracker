ALTER TABLE material_requests 
ADD COLUMN assigned_to INT AFTER requested_by,
ADD CONSTRAINT fk_mr_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
