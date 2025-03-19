import express from "express";
import { protect, optionalAuth, admin } from '../middleware/authMiddleware.js';
import {
  subscribeToNotifications,
  unsubscribeFromNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  registerToken,
  updatePreferences,
  sendNotification
} from '../Controllers/notification.controller.js';

const router = express.Router();

// Subscribe to notifications (works for both registered and guest users)
router.post('/subscribe', optionalAuth, subscribeToNotifications);

// Unsubscribe from notifications (works for both registered and guest users)
router.post('/unsubscribe', optionalAuth, unsubscribeFromNotifications);

// Get user's notifications with pagination and filters (works for both registered and guest users)
router.get('/', optionalAuth, getUserNotifications);

// Mark notification as read (works for both registered and guest users)
router.put('/:id/read', optionalAuth, markAsRead);

// Mark all notifications as read (works for both registered and guest users)
router.put('/read-all', optionalAuth, markAllAsRead);

// Public routes
router.post('/register', optionalAuth, registerToken);

// Protected routes
router.put('/preferences', protect, updatePreferences);

// Admin routes
router.post('/send', protect, admin, sendNotification);

export default router; 