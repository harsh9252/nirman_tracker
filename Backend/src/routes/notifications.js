const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/auth');

// All notification routes require authentication
router.use(verifyToken);

// Get notifications for current user
router.get('/', NotificationController.getUserNotifications);

// Get unread notifications count for current user
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', NotificationController.markAsRead);

// Mark all notifications as read for current user
router.put('/mark-all-read', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

// Create notification (admin/internal use)
router.post('/', NotificationController.createNotification);

module.exports = router;
