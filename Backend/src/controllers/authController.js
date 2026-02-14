const jwt = require('jsonwebtoken');
const User = require('../models/User');
const transporter = require('../config/mailer');

class AuthController {
  // Register User
  // Register User
  static async register(req, res) {
    try {
      const { firstName, lastName, email, username, password } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Check if user already exists
      User.checkExists(email, username, async (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
          return res.status(400).json({ error: 'User with this email or username already exists' });
        }

        // Store password in plain text (as requested)
        const userData = { firstName, lastName, email, username, password };
        User.create(userData, (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { id: result.insertId, username, email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
              id: result.insertId,
              firstName,
              lastName,
              email,
              username
            }
          });
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Login User
  static async login(req, res) {
    try {
      const { identifier, password } = req.body; // identifier can be username, email

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required' });
      }

      // Find user by identifier
      User.getByIdentifier(identifier, async (err, results) => {
        if (err) {
          console.error('Database error in login:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        console.log('Login attempt - Identifier:', identifier);
        console.log('Login attempt - Found users:', results.length);
        if (results.length > 0) {
          console.log('Login attempt - User found:', results[0].id, results[0].username, results[0].phone);
          console.log('Login attempt - Stored password:', results[0].password);
          console.log('Login attempt - Provided password:', password);
        }

        if (results.length === 0) {
          console.log('Login attempt - No user found with identifier:', identifier);
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];

        // Check password - plain text comparison only
        if (password !== user.password) {
          console.log('Login attempt - Password mismatch');
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );

        const isTempPassword = user.is_temp_password === 1 || user.is_temp_password === true;
        console.log('LOGIN DEBUG: User is_temp_password from DB:', user.is_temp_password);
        console.log('LOGIN DEBUG: Computed isTempPassword:', isTempPassword);

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            username: user.username,
            isTempPassword: isTempPassword
          }
        });
      });
    } catch (error) {
      console.error('Server error in login:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Forgot Password - Send email with reset link (or return link for testing)
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user exists
      User.getByIdentifier(email, async (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: 'User with this email not found' });
        }

        const user = results[0];

        // Generate reset token
        const resetToken = jwt.sign(
          { id: user.id, email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '1h' }
        );

        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/reset-password/${resetToken}`;

        // Check if email service is configured
        const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD;

        if (isEmailConfigured) {
          try {
            // Send email using nodemailer
            await transporter.sendMail({
              from: `"NirmaanTrack Support" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: 'Reset Your Password - NirmaanTrack',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h2 style="color: white; margin: 0; text-align: center;">NirmaanTrack</h2>
                    <p style="color: white; margin: 10px 0 0 0; text-align: center;">Password Reset Request</p>
                  </div>

                  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                    <h3 style="color: #374151; margin-top: 0;">Hello ${user.first_name || 'User'},</h3>

                    <p style="color: #6b7280; line-height: 1.6;">
                      You requested to reset your password for your NirmaanTrack account. Click the button below to reset your password:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetLink}"
                         style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                                color: white;
                                padding: 12px 30px;
                                text-decoration: none;
                                border-radius: 6px;
                                font-weight: bold;
                                display: inline-block;
                                box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                        Reset Password
                      </a>
                    </div>

                    <p style="color: #6b7280; line-height: 1.6;">
                      This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
                    </p>

                    <p style="color: #6b7280; line-height: 1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                      <br>
                      <a href="${resetLink}" style="color: #f59e0b; word-break: break-all;">${resetLink}</a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                    <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0;">
                      Best regards,<br>
                      NirmaanTrack Team
                    </p>
                  </div>
                </div>
              `
            });

            console.log('✅ Password reset email sent to:', email);
            res.json({
              message: 'Password reset link sent to your email successfully'
            });

          } catch (emailError) {
            console.error('❌ Error sending email:', emailError);
            res.status(500).json({
              error: 'Failed to send email. Please try again later.'
            });
          }
        } else {
          // Email not configured - return reset link for testing
          console.log('⚠️ Email not configured, returning reset link for testing');
          console.log('Reset link:', resetLink);

          res.json({
            message: 'Password reset link generated (email not configured)',
            resetLink: resetLink, // For testing purposes
            note: 'Copy this link to test password reset functionality'
          });
        }
      });
    } catch (error) {
      console.error('Server error in forgot password:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Reset Password
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Verify token
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Store new password in plain text
        User.updatePassword(decoded.id, newPassword, (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
          }

          res.json({ message: 'Password reset successfully' });
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Change password (for temp password users)
  static changePassword(req, res) {
    try {
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        return res.status(400).json({ error: 'User ID and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Update password and set is_temp_password to 0
      User.updatePassword(userId, newPassword, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Also update is_temp_password to 0
        const db = require('../config/database');
        db.query(
          'UPDATE users SET is_temp_password = 0 WHERE id = ?',
          [userId],
          (err, result) => {
            if (err) {
              console.error('Error updating temp password flag:', err);
              // Don't fail the request if this update fails
            }
            res.json({ message: 'Password changed successfully' });
          }
        );
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get user profile (protected route)
  static getProfile(req, res) {
    User.getFullProfileById(req.user.id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: results[0] });
    });
  }
}

module.exports = AuthController;
