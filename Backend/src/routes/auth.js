const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Authentication routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// AppUser login - login with email OR username + password (plain text)
router.post('/appuser-login', (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    User.getByEmailOrUsername(identifier, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];

        // Plain text password comparison (no bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is active
        if (user.status === 'Inactive') {
            return res.status(401).json({ error: 'Your account is inactive. Please contact admin.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                username: user.username,
                role: user.role,
                isTempPassword: user.is_temp_password === 1 || user.is_temp_password === true
            }
        });
    });
});

// Change password - set new password and mark is_temp_password as false
router.post('/change-password', (req, res) => {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
        return res.status(400).json({ error: 'User ID and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Update password and set is_temp_password to false
    const sql = 'UPDATE users SET password = ?, is_temp_password = FALSE WHERE id = ?';
    db.query(sql, [newPassword, userId], (err, result) => {
        if (err) {
            console.error('Error updating password:', err);
            return res.status(500).json({ error: 'Failed to update password' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Password changed successfully' });
    });
});

// Protected routes
router.get('/profile', verifyToken, AuthController.getProfile);

module.exports = router;
