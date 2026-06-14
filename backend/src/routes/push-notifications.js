const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const db = require('../config/database');

// Configure VAPID keys (generate once and store in .env)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.VAPID_EMAIL || 'admin@alwameed.com'),
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Get VAPID public key for client subscription
router.get('/vapid-public-key', (req, res) => {
  if (!vapidPublicKey) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }
  res.json({ publicKey: vapidPublicKey });
});

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Store subscription in database
    await db.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (endpoint) DO UPDATE SET
         user_id = $1,
         p256dh = $3,
         auth = $4,
         created_at = CURRENT_TIMESTAMP`,
      [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;

    await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);

    res.json({ success: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send push notification (internal use)
async function sendPushToUser(userId, payload) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, skipping push notification');
    return;
  }

  try {
    const result = await db.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    const notifications = result.rows.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };

      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (err) {
        // Remove invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
        }
      }
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Send push error:', error);
  }
}

// Send push to all admins
async function sendPushToAdmins(payload) {
  try {
    const result = await db.query(
      `SELECT DISTINCT ps.endpoint, ps.p256dh, ps.auth
       FROM push_subscriptions ps
       JOIN users u ON ps.user_id = u.id
       WHERE u.role_id IN ('admin', 'ops', 'accountant', 'branch', 'customer_service')`
    );

    const notifications = result.rows.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };

      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
        }
      }
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Send push to admins error:', error);
  }
}

module.exports = router;
module.exports.sendPushToUser = sendPushToUser;
module.exports.sendPushToAdmins = sendPushToAdmins;
