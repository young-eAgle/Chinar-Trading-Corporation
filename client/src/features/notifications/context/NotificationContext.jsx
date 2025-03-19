import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { requestNotificationPermission, onMessageListener } from '../utils/firebase';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: true,
    shipping: true,
    emailNotifications: true
  });
  const [permission, setPermission] = useState('default');
  const [token, setToken] = useState(null);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          return;
        }

        // Get current permission status
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        // If already granted, get token
        if (currentPermission === 'granted') {
          const token = await requestNotificationPermission();
          if (token) {
            setToken(token);
            await registerTokenWithServer(token);
          }
        }

        // Load preferences from localStorage
        const savedPreferences = localStorage.getItem('notificationPreferences');
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }

        // Fetch existing notifications
        await fetchNotifications();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  // Listen for new messages
  useEffect(() => {
    // Skip Firebase messaging listener since it's disabled
    const checkForNewNotifications = () => {
      // Regular polling for new notifications is handled by fetchNotifications()
      console.log('Polling for new notifications instead of Firebase push notifications');
    };
    
    checkForNewNotifications();
    
    // Return empty cleanup function
    return () => {};
  }, []);

  // Fetch notifications from the server
  const fetchNotifications = async () => {
    try {
      const userToken = localStorage.getItem('token');
      const guestEmail = localStorage.getItem('guestEmail');
      
      console.log('Fetching notifications with:', { 
        userToken: userToken ? 'Present' : 'None', 
        guestEmail 
      });

      const headers = {};
      
      // Add authorization token if available
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }
      
      // Add guest email if available
      if (guestEmail && !userToken) {
        headers['Guest-Email'] = guestEmail;
      }

      const response = await fetch('http://46.202.166.65/api/notifications', {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      const data = await response.json();
      console.log('Notifications received:', data);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(`Error fetching notifications: ${error.message}`);
    }
  };

  const handleNewNotification = (payload) => {
    console.log('Received notification payload:', payload);
    
    // For order notifications
    if (payload.data?.type?.startsWith('order_')) {
      // Check if notification type is enabled in preferences
      if (!preferences.orderUpdates) return;
    }
    
    // For promotional notifications
    if (payload.data?.type === 'promotion' && !preferences.promotions) return;
    
    // For shipping notifications
    if (payload.data?.type === 'shipping' && !preferences.shipping) return;
    
    // For cart update notifications
    if (payload.data?.type === 'cart_update') {
      // Always show cart updates regardless of preferences
      // These are immediate user actions
    }
    
    // For wishlist update notifications
    if (payload.data?.type === 'wishlist_update') {
      // Always show wishlist updates regardless of preferences
      // These are immediate user actions
    }

    // Add to notifications list
    const newNotification = {
      id: payload.data?.orderId || Date.now().toString(),
      title: payload.notification?.title || payload.title,
      body: payload.notification?.body || payload.body,
      data: payload.data || {},
      timestamp: new Date().toISOString(),
      read: false,
      type: payload.data?.type || 'system'
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification with action button if available
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {newNotification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {newNotification.body}
              </p>
            </div>
          </div>
        </div>
        {newNotification.data?.url && (
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleNotificationClick(newNotification);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              View
            </button>
          </div>
        )}
      </div>
    ), {
      duration: 5000,
      position: 'top-right'
    });
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Handle navigation based on notification type
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  const registerTokenWithServer = async (token) => {
    try {
      const userToken = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail') || '';
      const guestEmail = localStorage.getItem('guestEmail') || '';
      
      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      };
      
      // Prepare the request body
      const body = {
        token,
        deviceInfo
      };
      
      // If user is not logged in, we need an email
      if (!userToken) {
        // Try to get email from storage or prompt user
        const email = guestEmail || userEmail || prompt('Please enter your email for notifications:');
        if (email) {
          body.email = email;
          // Save the email for future use
          localStorage.setItem('guestEmail', email);
        } else {
          console.log('No email provided, notifications will be limited');
        }
      }
      
      console.log('Registering notification token:', { hasUserToken: !!userToken, hasEmail: !!body.email });
      
      const response = await fetch('http://46.202.166.65/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken && { 'Authorization': `Bearer ${userToken}` })
        },
        body: JSON.stringify(body),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register notification token');
      }
      
      const data = await response.json();
      console.log('Token registration result:', data);
      
      // After successful registration, fetch notifications
      await fetchNotifications();
      
      return true;
    } catch (error) {
      console.error('Error registering token with server:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  };

  const requestPermission = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setToken(token);
        setPermission('granted');
        await registerTokenWithServer(token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const response = await fetch('http://46.202.166.65/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPreferences),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      setPreferences(newPreferences);
      localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const userToken = localStorage.getItem('token');
      
      const response = await fetch(`http://46.202.166.65/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken && { 'Authorization': `Bearer ${userToken}` })
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAllAsRead,
    clearNotifications,
    markNotificationAsRead,
    permission,
    requestPermission,
    updatePreferences,
    preferences,
    fetchNotifications,
    handleNewNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 