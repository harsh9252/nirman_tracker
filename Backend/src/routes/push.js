const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const db = require('../config/database');

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(500).json({ error: 'VAPID public key not configured' });
    }
    res.json({ publicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Subscribe to push notifications
router.post('/subscribe', verifyToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Check if subscription already exists for this user
    const checkSql = 'SELECT id FROM push_subscriptions WHERE user_id = ? AND endpoint = ?';
    db.query(checkSql, [userId, subscription.endpoint], (err, results) => {
      if (err) {
        console.error('Error checking existing subscription:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        // Update existing subscription
        const updateSql = `
          UPDATE push_subscriptions
          SET subscription_data = ?, updated_at = NOW()
          WHERE user_id = ? AND endpoint = ?
        `;
        db.query(updateSql, [JSON.stringify(subscription), userId, subscription.endpoint], (err, result) => {
          if (err) {
            console.error('Error updating subscription:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Subscription updated successfully' });
        });
      } else {
        // Create new subscription
        const insertSql = `
          INSERT INTO push_subscriptions (user_id, endpoint, subscription_data, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
        `;
        db.query(insertSql, [userId, subscription.endpoint, JSON.stringify(subscription)], (err, result) => {
          if (err) {
            console.error('Error creating subscription:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          res.status(201).json({ message: 'Subscription created successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', verifyToken, (req, res) => {
  try {
    const userId = req.user.id;

    const sql = 'DELETE FROM push_subscriptions WHERE user_id = ?';
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error('Error unsubscribing from push notifications:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Unsubscribed successfully' });
    });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's subscription status
router.get('/subscription-status', verifyToken, (req, res) => {
  try {
    const userId = req.user.id;

    const sql = 'SELECT COUNT(*) as count FROM push_subscriptions WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error checking subscription status:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ isSubscribed: results[0].count > 0 });
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test push notification (for debugging)
router.post('/test-notification', verifyToken, (req, res) => {
  try {
    const userId = req.user.id;
    const pushNotificationService = require('../services/pushNotificationService');

    // Send test notification
    pushNotificationService.testNotification(userId)
      .then(() => {
        res.json({ message: 'Test push notification sent successfully' });
      })
      .catch((error) => {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
      });
  } catch (error) {
    console.error('Error in test notification route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
