import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { Switch } from '@headlessui/react';
import { toast } from 'react-hot-toast';

const NotificationPreferences = () => {
  const { preferences, updatePreferences, permission, requestPermission } = useNotification();

  const handleToggle = async (key) => {
    try {
      // If enabling notifications and permission not granted, request it
      if (!preferences[key] && permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          toast.error('Please enable notifications to receive updates');
          return;
        }
      }

      const newPreferences = {
        ...preferences,
        [key]: !preferences[key]
      };

      await updatePreferences(newPreferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const preferenceItems = [
    {
      key: 'orderUpdates',
      label: 'Order Updates',
      description: 'Get notified about your order status changes'
    },
    {
      key: 'shipping',
      label: 'Shipping Updates',
      description: 'Receive updates about your order shipment'
    },
    {
      key: 'promotions',
      label: 'Promotional Offers',
      description: 'Stay updated with latest deals and offers'
    },
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive notifications via email'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Notification Preferences
      </h2>

      <div className="space-y-6">
        {preferenceItems.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{label}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
            <Switch
              checked={preferences[key]}
              onChange={() => handleToggle(key)}
              className={`${
                preferences[key] ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  preferences[key] ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        ))}
      </div>

      {permission !== 'granted' && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Notifications are disabled
              </h3>
              <div className="mt-2">
                <p className="text-sm text-yellow-700">
                  Enable browser notifications to receive real-time updates about
                  your orders and offers.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={requestPermission}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences; 