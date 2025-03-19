import admin from 'firebase-admin';
import User from '../models/model.user.js';
// // import "dotenv/config"; // Removed to prevent .env file from being loaded multiple times
// Environment variables should already be loaded by the main application

// Initialize Firebase Admin with error handling
try {
  // Debug log to check environment variable
  console.log('FIREBASE_SERVICE_ACCOUNT exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log('FIREBASE_SERVICE_ACCOUNT length:', process.env.FIREBASE_SERVICE_ACCOUNT ? process.env.FIREBASE_SERVICE_ACCOUNT.length : 0);
  console.log('FIREBASE_SERVICE_ACCOUNT type:', typeof process.env.FIREBASE_SERVICE_ACCOUNT);
  
  // Check if the Firebase service account exists
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error('FIREBASE_SERVICE_ACCOUNT environment variable is undefined');
    console.error('Make sure this variable is defined in your .env.development file');
    console.log('Skipping Firebase initialization in development mode');
  } else {
    let serviceAccount;
    try {
      // Try parsing the service account
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('Successfully parsed Firebase service account');
      console.log('Service account project_id:', serviceAccount.project_id);
    } catch (parseError) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', parseError);
      console.log('Raw FIREBASE_SERVICE_ACCOUNT value:', process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 50) + '...');
      throw parseError;
    }

    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully');
    } else {
      console.log('Firebase Admin SDK already initialized');
    }
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('Continuing without Firebase Admin SDK');
}

/**
 * Send push notification to a specific user
 * @param {string|Object} user - User ID or User object with pushToken
 * @param {Object} notification - Notification data
 * @returns {Promise<void>}
 */
export const notifyUser = async (user, notification) => {
  try {
    // Get user's push token
    const pushToken = typeof user === 'string' ? user : user.pushToken;
    
    if (!pushToken) {
      console.log('No push token found for user');
      return;
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      console.log('Firebase Admin SDK not initialized, skipping push notification');
      return;
    }

    // Send Firebase notification
    await admin.messaging().send({
      token: pushToken,
      notification: {
        title: notification.title,
        body: notification.body,
        icon: '/logo192.png'
      },
      data: notification.data || {},
      webpush: {
        notification: {
          icon: '/logo192.png',
          badge: '/logo192.png',
          actions: [
            {
              action: 'view',
              title: 'View Order'
            }
          ]
        }
      }
    });

    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

/**
 * Send push notification to all admin users
 * @param {Object} notification - Notification data
 * @returns {Promise<void>}
 */
export const notifyAdmins = async (notification) => {
  try {
    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      console.log('Firebase Admin SDK not initialized, skipping admin notifications');
      return;
    }

    // Get all admin users with push tokens
    const adminUsers = await User.find({ 
      role: 'admin',
      pushEnabled: true,
      'notificationPreferences.push': true,
      pushToken: { $exists: true }
    });

    // Send notifications to each admin
    const notificationPromises = adminUsers.map(admin => 
      notifyUser(admin, notification)
    );

    await Promise.all(notificationPromises);
    console.log('Admin notifications sent successfully');
  } catch (error) {
    console.error('Error sending admin notifications:', error);
  }
};

/**
 * Update user's push token
 * @param {string} userId - User ID
 * @param {string} token - New push token
 * @returns {Promise<void>}
 */
export const updatePushToken = async (userId, token) => {
  try {
    await User.findByIdAndUpdate(userId, {
      pushToken: token,
      pushEnabled: true
    });
    console.log('Push token updated successfully');
  } catch (error) {
    console.error('Error updating push token:', error);
    throw error;
  }
};

/**
 * Disable push notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const disablePushNotifications = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      pushEnabled: false,
      pushToken: null
    });
    console.log('Push notifications disabled successfully');
  } catch (error) {
    console.error('Error disabling push notifications:', error);
    throw error;
  }
};

/**
 * Update notification preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<void>}
 */
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    await User.findByIdAndUpdate(userId, {
      'notificationPreferences': preferences
    });
    console.log('Notification preferences updated successfully');
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}; 