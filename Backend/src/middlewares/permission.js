const User = require('../models/User');

/**
 * Middleware to check if user has permission for a specific module and action
 * @param {string} module - The module name (leads, clients, projects, tasks, employees, users)
 * @param {string} action - The action name (view, create, edit, delete)
 */
const checkPermission = (module, action) => {
    return (req, res, next) => {
        const user = req.user;

        // Admins have all permissions
        if (user.role.toLowerCase() === 'admin') {
            return next();
        }

        // Fetch full user profile to get latest permissions
        User.getFullProfileById(user.id, (err, results) => {
            if (err) {
                console.error('Error fetching user permissions:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const fullUser = results[0];
            let permissions = fullUser.permissions;

            // Parse permissions if it's a string
            if (typeof permissions === 'string') {
                try {
                    permissions = JSON.parse(permissions);
                } catch (e) {
                    console.error('Error parsing permissions:', e);
                    permissions = {};
                }
            }

            // Check if user has permission for the module and action
            // Structure: { "projects": { "view": true, "create": false, ... } }
            if (permissions && permissions[module] && permissions[module][action]) {
                // User has permission, proceed
                // Attach permissions to request for use in controllers if needed
                req.userPermissions = permissions;
                return next();
            }

            // No permission
            return res.status(403).json({
                error: 'Forbidden',
                message: `You do not have permission to ${action} ${module}`
            });
        });
    };
};

module.exports = { checkPermission };
