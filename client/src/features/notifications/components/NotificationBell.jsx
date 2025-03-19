import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaCheckCircle, FaTrash, FaCheck, FaClock, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isValid, parseISO } from 'date-fns';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
    permission,
    requestPermission,
    markNotificationAsRead,
    fetchNotifications
  } = useNotification();

  // Fetch notifications periodically
  useEffect(() => {
    fetchNotifications(); // Initial fetch

    // Fetch every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Show success message
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark the notification as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Handle navigation if URL exists
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }

    // Close the dropdown after clicking
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update':
        return <FaCheckCircle className="text-green-500 h-4 w-4" />;
      case 'shipping':
        return <FaClock className="text-blue-500 h-4 w-4" />;
      case 'cart_update':
        return <FaShoppingCart className="text-blue-600 h-4 w-4" />;
      case 'wishlist_update':
        return <FaHeart className="text-red-500 h-4 w-4" />;
      default:
        return <FaBell className="text-gray-500 h-4 w-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_update':
        return 'border-l-4 border-green-500';
      case 'shipping':
        return 'border-l-4 border-blue-500';
      case 'cart_update':
        return 'border-l-4 border-blue-600';
      case 'wishlist_update':
        return 'border-l-4 border-red-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      // Handle different timestamp formats
      let date;
      if (typeof timestamp === 'string') {
        date = parseISO(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Invalid date';
      }

      // Check if the date is valid
      if (!isValid(date)) {
        return 'Invalid date';
      }

      return format(date, 'PPp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Fixed bell at the bottom right
  return (
    <>
      {/* Fixed Bell Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none transition-colors duration-200"
          aria-label="Notifications"
        >
          <FaBell className="h-6 w-6" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white"
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setIsOpen(false)}>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 right-5 w-96 bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black ring-opacity-5 z-50"
              style={{ maxHeight: 'calc(100vh - 150px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-white hover:text-blue-200 flex items-center space-x-1 transition-colors duration-200"
                  >
                    <FaCheck className="h-4 w-4" />
                    <span>Mark all read</span>
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="text-sm text-white hover:text-blue-200 flex items-center space-x-1 transition-colors duration-200"
                  >
                    <FaTrash className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <FaBell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        } ${getNotificationColor(notification.type)}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 pt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.body}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.read && (
                                <span className="text-xs text-green-500 flex items-center">
                                  <FaCheckCircle className="h-3 w-3 mr-1" />
                                  Read
                                </span>
                              )}
                            </div>
                          </div>
                          {notification.data?.url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = notification.data.url;
                              }}
                              className="flex-shrink-0 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Permission Request */}
              {permission !== 'granted' && (
                <div className="p-4 bg-gray-50 border-t sticky bottom-0 z-10">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FaBell className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Enable notifications to stay updated with your orders
                      </p>
                    </div>
                    <button
                      onClick={handlePermissionRequest}
                      className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationBell;