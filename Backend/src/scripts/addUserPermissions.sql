-- Add permissions column to users table
ALTER TABLE users ADD COLUMN permissions JSON DEFAULT NULL;

-- Set default permissions for existing users
-- Admin users (role = 'admin') get all permissions
UPDATE users 
SET permissions = JSON_OBJECT(
    'leads', true,
    'clients', true,
    'projects', true,
    'tasks', true,
    'users', true
)
WHERE role = 'admin';

-- Regular users get all permissions including users management
UPDATE users 
SET permissions = JSON_OBJECT(
    'leads', true,
    'clients', true,
    'projects', true,
    'tasks', true,
    'users', true
)
WHERE permissions IS NULL;
