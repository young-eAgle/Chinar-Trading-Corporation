import React, { useState, useEffect } from "react";
import { useNotification } from "../../context/notificationContext";
import usePushNotification from "../../hooks/usePushNotification";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://api.chinartrading.com";

const UserProfile = () => {
  const { showNotification } = useNotification();
  const { isPermissionGranted, requestPermission, disableNotifications } = usePushNotification();
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    orderUpdates: true,
    promotions: false
  });

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/api/users/preferences`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setNotificationPreferences(response.data.notificationPreferences);
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };

    fetchUserPreferences();
  }, []);

  const handleNotificationPreferenceChange = async (preference) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const updatedPreferences = {
        ...notificationPreferences,
        [preference]: !notificationPreferences[preference]
      };

      await axios.put(
        `${API_URL}/api/users/preferences`,
        { notificationPreferences: updatedPreferences },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotificationPreferences(updatedPreferences);
      showNotification("success", "Notification preferences updated");

      // Handle push notification permission
      if (preference === "push" && !isPermissionGranted) {
        await requestPermission();
      } else if (preference === "push" && isPermissionGranted) {
        await disableNotifications();
      }
    } catch (error) {
      showNotification("error", "Failed to update preferences");
    }
  };

  return (
    <div className="user-profile-container">
      {/* ... existing JSX ... */}
      
      {/* Add notification preferences section */}
      <div className="notification-preferences">
        <h3>Notification Preferences</h3>
        <div className="preferences-grid">
          <div className="preference-item">
            <label>
              <input
                type="checkbox"
                checked={notificationPreferences.email}
                onChange={() => handleNotificationPreferenceChange("email")}
              />
              Email Notifications
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input
                type="checkbox"
                checked={notificationPreferences.push}
                onChange={() => handleNotificationPreferenceChange("push")}
              />
              Push Notifications
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input
                type="checkbox"
                checked={notificationPreferences.orderUpdates}
                onChange={() => handleNotificationPreferenceChange("orderUpdates")}
              />
              Order Updates
            </label>
          </div>
          <div className="preference-item">
            <label>
              <input
                type="checkbox"
                checked={notificationPreferences.promotions}
                onChange={() => handleNotificationPreferenceChange("promotions")}
              />
              Promotions
            </label>
          </div>
        </div>
      </div>
      
      {/* ... rest of the JSX ... */}
    </div>
  );
};

export default UserProfile; 