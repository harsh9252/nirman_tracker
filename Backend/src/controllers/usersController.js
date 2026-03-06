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
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

// Get user by ID
exports.getUserById = (req, res) => {
    const { id } = req.params;

    User.getById(id, (err, results) => {
        if (err) {
            console.error(`Error fetching user with ID ${id}:`, err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(results[0]);
    });
};

// Create new user with auto-generated temporary password
exports.createUser = async (req, res) => {
    const { first_name, last_name, email, phone, role, status, permissions } = req.body;

    if (!first_name || !email || !phone || !role || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (phone.length !== 10) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    }

    // Generate username from email (part before @)
    const username = email.split('@')[0];

    // Generate temporary password automatically
    const tempPassword = generateTempPassword(8);

    // Check if email already exists
    User.checkEmailExists(email, null, (err, results) => {
        if (err) {
            console.error('Error checking email existence:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Check if username already exists
        User.checkUsernameExists(username, null, (err, results) => {
            if (err) {
                console.error('Error checking username existence:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Check if phone already exists
            User.checkPhoneExists(phone, null, (err, results) => {
                if (err) {
                    console.error('Error checking phone existence:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (results.length > 0) {
                    return res.status(400).json({ error: 'Phone number already exists' });
                }

                // Create user with temporary password
                const userData = { first_name, last_name, email, phone, username, password: tempPassword, role, status, permissions };

                User.createManagement(userData, (err, result) => {
                    if (err) {
                        console.error('Error in createManagement:', err);
                        return res.status(500).json({ error: 'Internal server error' });
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
    const requestingUser = req.user;

    // RBAC: Authorization check - Non-admin can only update themselves
    if (requestingUser.role.toLowerCase() !== 'admin' && requestingUser.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Access denied: You can only update your own profile' });
    }

    User.getFullProfileById(id, (err, results) => {
        if (err) {
            console.error(`Error fetching user for update (ID ${id}):`, err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingUser = results[0];
        let finalRole = role;
        let finalStatus = status;

        if (requestingUser.role.toLowerCase() !== 'admin') {
            finalRole = existingUser.role;
            finalStatus = existingUser.status;
        }

        if (finalStatus === 'Inactive' && existingUser.status !== 'Inactive') {
            User.checkUserIncompleteTasks(id, (taskErr, taskResults) => {
                if (taskErr) {
                    console.error('Error checking tasks for deactivation:', taskErr);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (taskResults.length > 0) {
                    const taskList = formatTaskList(taskResults);
                    return res.status(400).json({
                        error: 'User cannot be deactivated',
                        message: `This user has ${taskResults.length} pending task(s). Complete all tasks before deactivating the user.${taskList}`,
                        pendingTasks: taskResults
                    });
                }
                validateAndUpdate();
            });
        } else {
            validateAndUpdate();
        }

        function validateAndUpdate() {
            if (!first_name || !finalRole || !finalStatus) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            User.checkEmailExists(email, id, (err, results) => {
                if (err) {
                    console.error('Error checking email for update:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (results.length > 0) {
                    return res.status(400).json({ error: 'Email already exists' });
                }

                User.checkPhoneExists(phone, id, (err, results) => {
                    if (err) {
                        console.error('Error checking phone for update:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    if (results.length > 0) {
                        return res.status(400).json({ error: 'Phone number already exists' });
                    }

                    const userData = {
                        first_name,
                        last_name,
                        email,
                        phone,
                        role: finalRole,
                        status: finalStatus,
                        profile_image,
                        permissions: permissions || null
                    };

                    User.update(id, userData, (err, result) => {
                        if (err) {
                            console.error('Error updating user:', err);
                            return res.status(500).json({ error: 'Internal server error' });
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

        // Step 2: No pending tasks → HARD DELETE user
        User.delete(id, (err, result) => {
            if (err) {
                console.error('Delete error:', err);

                // Check for foreign key constraint violation (ER_ROW_IS_REFERENCED_2)
                if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
                    return res.status(409).json({
                        error: 'Cannot delete user',
                        message: 'This user is associated with existing records (projects, tasks, comments, etc.) and cannot be deleted. Please reassign their work or delete the associated records first.'
                    });
                }

                return res.status(500).json({ error: 'Failed to delete user' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        });
    });
};
