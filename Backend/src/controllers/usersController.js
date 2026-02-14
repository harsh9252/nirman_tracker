const User = require('../models/User');

// Generate temporary password
function generateTempPassword(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Get all users
exports.getAllUsers = (req, res) => {
    User.getAll((err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.json(results);
    });
};

// Get user by ID
exports.getUserById = (req, res) => {
    const { id } = req.params;

    User.getById(id, (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Failed to fetch user' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]);
    });
};

// Create new user with auto-generated temporary password
exports.createUser = async (req, res) => {
    const { first_name, last_name, email, phone, role, status } = req.body;
    console.log("FULL REQUEST BODY:", req.body);
    console.log("ROLE RECEIVED:", role, "TYPE:", typeof role, "LENGTH:", role ? role.length : 'undefined');

    if (!first_name) {
        return res.status(400).json({ error: 'First name is required' });
    }

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    }

    if (!role) {
        return res.status(400).json({ error: 'Role is required' });
    }

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    // Generate username from email (part before @)
    const username = email.split('@')[0];

    // Generate temporary password automatically
    const tempPassword = generateTempPassword(8);

    // Check if email already exists
    User.checkEmailExists(email, null, (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ error: 'Failed to create user' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Check if username already exists
        User.checkUsernameExists(username, null, (err, results) => {
            if (err) {
                console.error('Error checking username:', err);
                return res.status(500).json({ error: 'Failed to create user' });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Check if phone already exists
            User.checkPhoneExists(phone, null, (err, results) => {
                if (err) {
                    console.error('Error checking phone:', err);
                    return res.status(500).json({ error: 'Failed to create user' });
                }

                if (results.length > 0) {
                    return res.status(400).json({ error: 'Phone number already exists' });
                }

                // Create user with temporary password
                const userData = { first_name, last_name, email, phone, username, password: tempPassword, role, status };

                User.createManagement(userData, (err, result) => {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    // Return temporary password so admin can share with user
                    res.status(201).json({
                        message: 'User created successfully',
                        id: result.insertId,
                        credentials: {
                            email: email,
                            phone: phone,
                            temporaryPassword: tempPassword
                        }
                    });
                });
            });
        });
    });
};

// Update user
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone, role, status, profile_image, permissions } = req.body;
    const requestingUser = req.user; // From verifyToken middleware

    console.log('UPDATE USER REQUEST:');
    console.log('ID:', id);
    console.log('Requesting user:', requestingUser);
    console.log('Request body:', req.body);

    // RBAC: Authorization check - Non-admin can only update themselves
    if (requestingUser.role.toLowerCase() !== 'admin' && requestingUser.id !== parseInt(id)) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'You can only update your own profile'
        });
    }

    // Get existing user data to preserve role/status for non-admins
    User.getFullProfileById(id, (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Failed to update user' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingUser = results[0];

        // Determine final role and status based on requesting user's permissions
        let finalRole = role;
        let finalStatus = status;

        // RBAC: Non-admin cannot change role or status
        if (requestingUser.role.toLowerCase() !== 'admin') {
            finalRole = existingUser.role;
            finalStatus = existingUser.status;
        }

        // FIRST: Check task restrictions (most important business rule)
        if (finalStatus === 'Inactive' && existingUser.status !== 'Inactive') {
            User.checkUserIncompleteTasks(id, (taskErr, taskResults) => {
                if (taskErr) {
                    console.error('Error checking tasks for deactivation:', taskErr);
                    return res.status(500).json({ error: 'Failed to update user' });
                }

                if (taskResults.length > 0) {
                    const taskList = formatTaskList(taskResults);
                    return res.status(400).json({
                        error: 'User cannot be deactivated',
                        message: `This user has ${taskResults.length} pending task(s). Complete all tasks before deactivating the user.${taskList}`,
                        pendingTasks: taskResults
                    });
                }

                // No pending tasks, proceed with validation and update
                validateAndUpdate();
            });
        } else {
            // Not deactivating, proceed with validation and update
            validateAndUpdate();
        }

        function validateAndUpdate() {
            // THEN: Validate basic fields
            if (!first_name) {
                return res.status(400).json({ error: 'First name is required' });
            }

            if (!finalRole) {
                return res.status(400).json({ error: 'Role is required' });
            }

            if (!finalStatus) {
                return res.status(400).json({ error: 'Status is required' });
            }

            // Check if email already exists (excluding current user)
            User.checkEmailExists(email, id, (err, results) => {
                if (err) {
                    console.error('Error checking email:', err);
                    return res.status(500).json({ error: 'Failed to update user' });
                }

                if (results.length > 0) {
                    return res.status(400).json({ error: 'Email already exists' });
                }

                // Check if phone already exists (excluding current user)
                User.checkPhoneExists(phone, id, (err, results) => {
                    if (err) {
                        console.error('Error checking phone:', err);
                        return res.status(500).json({ error: 'Failed to update user' });
                    }

                    if (results.length > 0) {
                        return res.status(400).json({ error: 'Phone number already exists' });
                    }

                    // Prepare userData with permissions
                    const userData = {
                        first_name,
                        last_name,
                        email,
                        phone,
                        role: finalRole,
                        status: finalStatus,
                        profile_image,
                        permissions: permissions || null  // Don't stringify here - User.update handles it
                    };

                    console.log('Final userData to update:', userData);

                    // Proceed with update
                    User.update(id, userData, (err, result) => {
                        if (err) {
                            console.error('Error updating user:', err);
                            return res.status(500).json({ error: 'Failed to update user' });
                        }

                        if (result.affectedRows === 0) {
                            return res.status(404).json({ error: 'User not found' });
                        }

                        res.json({ message: 'User updated successfully', user: userData });
                    });
                });
            });
        }
    });
};

// Helper function to format task list for error messages
function formatTaskList(tasks) {
    if (!tasks || tasks.length === 0) return '';

    let message = `\n\nPending Tasks (${tasks.length}):`;

    tasks.forEach((task, index) => {
        const assignedBy = task.assignedBy || 'Unknown';
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        const taskType = task.taskType;

        let assignmentText;
        if (taskType === 'assigned_to_you') {
            assignmentText = `Assigned to you by ${assignedBy}`;
        } else if (taskType === 'assigned_by_you') {
            assignmentText = `Assigned by you to ${assignedBy}`;
        } else {
            assignmentText = `Assigned to you by ${assignedBy}`; // fallback
        }

        message += `\n${index + 1}. "${task.name}" (${assignmentText}) - Due: ${dueDate}`;
    });

    return message;
}

// Check if user can be deleted (for frontend validation)
exports.checkUserDeletion = (req, res) => {
    const { id } = req.params;

    console.log("CHECK USER DELETION ID:", id);

    // Check if user has incomplete tasks
    User.checkUserIncompleteTasks(id, (err, results) => {
        if (err) {
            console.error('Error checking tasks:', err);
            return res.status(500).json({ error: 'Failed to check user deletion' });
        }

        console.log("PENDING TASK COUNT:", results.length);

        // If any task is NOT completed → Cannot delete
        if (results.length > 0) {
            const taskList = formatTaskList(results);
            return res.status(400).json({
                canDelete: false,
                error: 'User cannot be deleted',
                message: `This user has ${results.length} pending task(s). Complete all tasks before deleting the user.${taskList}`,
                pendingTasks: results
            });
        }

        // No pending tasks → Can delete
        res.json({
            canDelete: true,
            message: 'User can be deleted'
        });
    });
};

// Delete user
exports.deleteUser = (req, res) => {
    const { id } = req.params;

    console.log("DELETE USER ID:", id);

    // Step 1: Check if user has incomplete tasks
    User.checkUserIncompleteTasks(id, (err, results) => {
        if (err) {
            console.error('Error checking tasks:', err);
            return res.status(500).json({ error: 'Failed to delete user' });
        }

        console.log("PENDING TASK COUNT:", results.length);

        // If any task is NOT completed → BLOCK delete
        if (results.length > 0) {
            const taskList = formatTaskList(results);
            return res.status(400).json({
                error: 'User cannot be deleted',
                message: `This user has ${results.length} pending task(s). Complete all tasks before deleting the user.${taskList}`,
                pendingTasks: results
            });
        }

        // Step 2: No pending tasks → SOFT DELETE user
        User.softDelete(id, (err, result) => {
            if (err) {
                console.error('Soft delete error:', err);
                return res.status(500).json({ error: 'Failed to delete user' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        });
    });
};
