import User from '../models/model.user.js';
import Admin from '../models/model.admin.js';
import Notification from '../models/model.notification.js';
import { notifyUser, notifyAdmins } from '../utils/pushNotification.js';
import { getClientInfo } from '../utils/deviceDetection.js';
import { getMessaging } from 'firebase-admin/messaging';
import asyncHandler from 'express-async-handler';

// Helper function to ensure guest email is saved in cookies
const ensureGuestEmailCookie = (req, res, email) => {
    if (email && !req.cookies?.guestEmail) {
        // Set cookie to expire in 30 days
        res.cookie('guestEmail', email, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
    }
};

// Subscribe to notifications
export const subscribeToNotifications = async (req, res) => {
    try {
        const { email, token, deviceInfo } = req.body;
        
        // Determine if request is from authenticated user or guest
        let userId = null;
        let guestEmail = email;
        
        if (req.user && !req.user.isGuest) {
            userId = req.user._id;
            guestEmail = null;
        }
        
        // Save guest email in cookie for future requests
        if (guestEmail) {
            ensureGuestEmailCookie(req, res, guestEmail);
        }
        
        // First, check if this token is already registered
        let subscription = await Notification.findOne({ token });
        
        if (subscription) {
            // Update existing subscription
            subscription.userId = userId || subscription.userId;
            subscription.guestEmail = guestEmail || subscription.guestEmail;
            subscription.deviceInfo = { ...subscription.deviceInfo, ...deviceInfo };
            subscription.active = true;
            await subscription.save();
        } else {
            // Create new subscription
            subscription = new Notification({
                userId,
                guestEmail,
                token,
                deviceInfo,
                active: true
            });
            await subscription.save();
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Successfully subscribed to notifications',
            subscription
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to subscribe to notifications',
            error: error.message
        });
    }
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = async (req, res) => {
    try {
        const { userId, isAdmin, guestEmail } = req.body;

        const updateData = {
            pushToken: null,
            pushEnabled: false
        };

        if (isAdmin) {
            await Admin.findByIdAndUpdate(userId, updateData);
        } else if (userId) {
            await User.findByIdAndUpdate(userId, updateData);
        }

        if (guestEmail) {
            await Notification.updateMany(
                { guestEmail },
                { $unset: { 'metadata.pushToken': '' } }
            );
        }

        res.status(200).json({ message: 'Successfully unsubscribed from notifications' });
    } catch (error) {
        console.error('Error unsubscribing from notifications:', error);
        res.status(500).json({ message: 'Failed to unsubscribe from notifications' });
    }
};

// Get user notifications
export const getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, read } = req.query;
        
        // Safely destructure req.user with defaults to prevent errors
        const { userId, guestEmail, isGuest } = req.user || {};

        const filter = {
            expiresAt: { $gt: new Date() }, // Filter out expired notifications
        };
        
        // Build query based on available identifiers
        if (userId) {
            filter.userId = userId;
        } else if (guestEmail) {
            filter.guestEmail = guestEmail;
        } else if (isGuest) {
            // For completely anonymous guests, we can either:
            // 1. Return only public notifications
            filter.recipientType = 'public';
            // 2. Or return an empty array with a message
            return res.status(200).json({
                notifications: [],
                message: 'Please provide an email to view your notifications',
                currentPage: 1,
                totalPages: 0,
                total: 0
            });
        }

        // Apply additional filters
        if (type) filter.type = type;
        if (read !== undefined) filter.read = read === 'true';

        console.log('Notifications query:', filter);

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Notification.countDocuments(filter);

        res.status(200).json({
            notifications,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const { userId, guestEmail } = req.user;
        
        // Check authorization
        if (
            (notification.userId && notification.userId.toString() !== userId) ||
            (notification.guestEmail && notification.guestEmail !== guestEmail)
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await notification.markAsRead();
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const { userId, guestEmail } = req.user;
        const identifier = userId || guestEmail;
        
        await Notification.markAllAsRead(identifier);
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
};

// Send order notification
export const sendOrderNotification = async (order, type) => {
    try {
        let recipientInfo;
        
        if (order.user) {
            // Registered user
            const user = await User.findById(order.user);
            recipientInfo = {
                userId: user._id,
                recipientType: 'user',
                pushToken: user?.pushToken,
                deviceInfo: user?.deviceInfo
            };
        } else if (order.guestEmail) {
            // Guest user
            const guestNotification = await Notification.findOne({
                guestEmail: order.guestEmail,
                'metadata.pushToken': { $exists: true }
            }).sort({ createdAt: -1 });

            recipientInfo = {
                guestEmail: order.guestEmail,
                recipientType: 'guest',
                pushToken: guestNotification?.metadata?.pushToken,
                deviceInfo: guestNotification?.metadata
            };
        }

        if (recipientInfo?.pushToken) {
            const notificationData = {
                ...(recipientInfo.userId && { userId: recipientInfo.userId }),
                ...(recipientInfo.guestEmail && { guestEmail: recipientInfo.guestEmail }),
                recipientType: recipientInfo.recipientType,
                title: 'Order Update',
                body: getNotificationMessage(order, type),
                type: 'order_update',
                data: {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    status: type,
                    url: `${process.env.CLIENT_URL}/orders/${order._id}`
                },
                priority: getPriorityByType(type),
                metadata: recipientInfo.deviceInfo || {}
            };

            // Save to database
            const notification = await Notification.create(notificationData);

            // Send push notification
            await notifyUser(recipientInfo.pushToken, {
                title: notificationData.title,
                body: notificationData.body,
                data: notificationData.data
            });
        }

        // Notify admins
        const admins = await Admin.find({ pushEnabled: true });
        if (admins.length > 0) {
            const adminNotification = {
                recipientType: 'admin',
                title: 'New Order Alert',
                body: `Order #${order.orderNumber} has been ${type}`,
                type: 'order_update',
                priority: getPriorityByType(type),
                data: {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    status: type,
                    url: `${process.env.ADMIN_PANEL_URL}/orders/${order._id}`
                }
            };

            // Save notification for each admin
            const adminNotifications = admins.map(admin => ({
                ...adminNotification,
                userId: admin._id
            }));

            await Notification.insertMany(adminNotifications);

            // Send push notifications to all admin devices
            const adminTokens = admins.map(admin => admin.pushToken).filter(Boolean);
            if (adminTokens.length > 0) {
                await notifyAdmins({
                    tokens: adminTokens,
                    title: adminNotification.title,
                    body: adminNotification.body,
                    data: adminNotification.data
                });
            }
        }
    } catch (error) {
        console.error('Error sending order notification:', error);
    }
};

// Helper function to get notification message
const getNotificationMessage = (order, type) => {
    switch (type) {
        case 'placed':
            return `Your order #${order.orderNumber} has been placed successfully!`;
        case 'confirmed':
            return `Your order #${order.orderNumber} has been confirmed.`;
        case 'shipped':
            return `Your order #${order.orderNumber} has been shipped!`;
        case 'delivered':
            return `Your order #${order.orderNumber} has been delivered!`;
        case 'cancelled':
            return `Your order #${order.orderNumber} has been cancelled.`;
        default:
            return `Your order #${order.orderNumber} has been updated.`;
    }
};

// Helper function to determine notification priority
const getPriorityByType = (type) => {
    switch (type) {
        case 'cancelled':
            return 'high';
        case 'delivered':
        case 'shipped':
            return 'medium';
        default:
            return 'low';
    }
};

// @desc    Register FCM token
// @route   POST /api/notifications/register
// @access  Public
export const registerToken = asyncHandler(async (req, res) => {
    try {
        const { token, deviceInfo, email } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Notification token is required'
            });
        }

        // Determine user identity
        let userId = null;
        let guestEmail = null;
        
        // If user is authenticated
        if (req.user && !req.user.isGuest) {
            userId = req.user._id;
        } 
        // For guest users, use the provided email
        else if (email) {
            guestEmail = email;
            // Set guest email cookie
            ensureGuestEmailCookie(req, res, email);
        }
        // If no identification is provided
        else if (req.user?.isGuest) {
            return res.status(200).json({
                success: true,
                message: 'Guest user without email. Limited notifications available.',
                guest: true
            });
        }

        // Find existing subscription or create new one
        let subscription = await Notification.findOne({ token });
        
        if (subscription) {
            // Update existing subscription
            subscription.userId = userId || subscription.userId;
            subscription.guestEmail = guestEmail || subscription.guestEmail;
            subscription.deviceInfo = { ...subscription.deviceInfo, ...deviceInfo };
            subscription.active = true;
            subscription.lastActive = new Date();
            await subscription.save();
        } else {
            // Create new subscription
            subscription = new Notification({
                userId,
                guestEmail,
                token,
                deviceInfo,
                active: true
            });
            await subscription.save();
        }
        
        // Also update user in database if authenticated
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                user.pushEnabled = true;
                user.lastActive = new Date();
                await user.save();
            }

            // Check if user is also an admin and update admin record
            if (req.user?.email) {
                const admin = await Admin.findOne({ email: req.user.email });
                if (admin) {
                    admin.pushEnabled = true;
                    admin.lastActive = new Date();
                    await admin.save();
                }
            }
        }

        // Try to validate token with Firebase (if integrated)
        try {
            await getMessaging().send({
                token,
                data: { test: 'true' },
                android: { priority: 'normal' },
                apns: { headers: { 'apns-priority': '5' } }
            });
        } catch (firebaseError) {
            console.warn('Firebase token validation failed:', firebaseError.message);
            // Continue anyway - token may be valid but Firebase might be misconfigured
        }

        res.status(200).json({
            success: true,
            message: 'Token registered successfully',
            subscription: {
                id: subscription._id,
                userId: subscription.userId,
                guestEmail: subscription.guestEmail,
                active: subscription.active
            }
        });
    } catch (error) {
        console.error('Error registering token:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register notification token',
            error: error.message
        });
    }
});

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updatePreferences = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    const preferences = req.body;

    if (!preferences) {
        res.status(400);
        throw new Error('Preferences are required');
    }

    try {
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                user.notificationPreferences = {
                    ...user.notificationPreferences,
                    ...preferences
                };
                await user.save();
            }

            // Update admin preferences if applicable
            const admin = await Admin.findOne({ email: userEmail });
            if (admin) {
                admin.notificationPreferences = {
                    ...admin.notificationPreferences,
                    ...preferences
                };
                await admin.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully'
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(400);
        throw new Error('Failed to update preferences');
    }
});

// @desc    Send notification
// @route   POST /api/notifications/send
// @access  Private/Admin
export const sendNotification = asyncHandler(async (req, res) => {
    const { title, body, tokens, data } = req.body;

    if (!title || !body || !tokens || !Array.isArray(tokens)) {
        res.status(400);
        throw new Error('Invalid notification data');
    }

    try {
        const message = {
            notification: {
                title,
                body
            },
            data: data || {},
            tokens
        };

        const response = await getMessaging().sendMulticast(message);
        
        res.status(200).json({
            success: true,
            results: response.responses
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500);
        throw new Error('Failed to send notification');
    }
});

// Add logic to handle admin notifications
function createAdminNotification(title, body, type, data) {
    const notification = new Notification({
        recipientType: 'admin',
        title,
        body,
        type,
        data,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week expiry
    });
    return notification.save();
} 