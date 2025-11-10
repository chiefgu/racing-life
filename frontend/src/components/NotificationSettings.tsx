'use client';

import { useState, useEffect } from 'react';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  getFCMToken,
  showLocalNotification,
} from '@/lib/notifications';
import { api } from '@/lib/api';

interface NotificationSettingsProps {
  preferences: {
    notifications: {
      news: boolean;
      watchlist: boolean;
      raceReminders: boolean;
    };
    pushEnabled: boolean;
  };
  onUpdate: (preferences: any) => void;
}

export default function NotificationSettings({
  preferences,
  onUpdate,
}: NotificationSettingsProps) {
  const [permissionStatus, setPermissionStatus] = useState(checkNotificationPermission());
  const [isEnabling, setIsEnabling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setPermissionStatus(checkNotificationPermission());
  }, []);

  const handleEnablePushNotifications = async () => {
    setIsEnabling(true);
    setError(null);
    setSuccess(null);

    try {
      const granted = await requestNotificationPermission();
      
      if (!granted) {
        setError('Notification permission was denied. Please enable it in your browser settings.');
        setIsEnabling(false);
        return;
      }

      // Get FCM token and save to backend
      const token = await getFCMToken();
      
      if (token) {
        // Update preferences
        await onUpdate({
          ...preferences,
          pushEnabled: true,
        });
        
        setSuccess('Push notifications enabled successfully!');
        setPermissionStatus(checkNotificationPermission());
      } else {
        setError('Failed to get notification token. Please try again.');
      }
    } catch (err) {
      console.error('Error enabling push notifications:', err);
      setError('Failed to enable push notifications. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisablePushNotifications = async () => {
    try {
      await api.deleteFCMToken();
      await onUpdate({
        ...preferences,
        pushEnabled: false,
      });
      setSuccess('Push notifications disabled.');
    } catch (err) {
      console.error('Error disabling push notifications:', err);
      setError('Failed to disable push notifications.');
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!permissionStatus.granted) {
        showLocalNotification('Test Notification', {
          body: 'This is a test notification from The Paddock',
          requireInteraction: false,
        });
      } else {
        await api.sendTestNotification();
      }
      setSuccess('Test notification sent!');
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError('Failed to send test notification.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleNotificationType = async (type: 'news' | 'watchlist' | 'raceReminders') => {
    try {
      const updated = {
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [type]: !preferences.notifications[type],
        },
      };
      await onUpdate(updated);
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError('Failed to update preferences.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Browser Notifications</p>
              <p className="text-sm text-gray-600 mt-1">
                {permissionStatus.granted
                  ? 'Notifications are enabled'
                  : permissionStatus.denied
                  ? 'Notifications are blocked. Please enable them in your browser settings.'
                  : 'Enable notifications to receive real-time updates'}
              </p>
            </div>
            <div className="ml-4">
              {!permissionStatus.granted && !permissionStatus.denied && (
                <button
                  onClick={handleEnablePushNotifications}
                  disabled={isEnabling}
                  className="px-4 py-2 bg-racing-blue text-white rounded-md hover:bg-racing-blue/90 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {isEnabling ? 'Enabling...' : 'Enable'}
                </button>
              )}
              {permissionStatus.granted && preferences.pushEnabled && (
                <button
                  onClick={handleDisablePushNotifications}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 touch-manipulation"
                >
                  Disable
                </button>
              )}
            </div>
          </div>
        </div>

        {permissionStatus.granted && (
          <button
            onClick={handleTestNotification}
            disabled={isTesting}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 touch-manipulation"
          >
            {isTesting ? 'Sending...' : 'Send Test Notification'}
          </button>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 touch-manipulation">
            <div>
              <p className="font-medium text-gray-900">Racing News</p>
              <p className="text-sm text-gray-600">Get notified about breaking racing news</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.news}
              onChange={() => handleToggleNotificationType('news')}
              className="w-5 h-5 text-racing-blue rounded focus:ring-racing-blue"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 touch-manipulation">
            <div>
              <p className="font-medium text-gray-900">Watchlist Updates</p>
              <p className="text-sm text-gray-600">
                Notifications when your watchlist horses, jockeys, or trainers are mentioned
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.watchlist}
              onChange={() => handleToggleNotificationType('watchlist')}
              className="w-5 h-5 text-racing-blue rounded focus:ring-racing-blue"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 touch-manipulation">
            <div>
              <p className="font-medium text-gray-900">Race Reminders</p>
              <p className="text-sm text-gray-600">
                Get reminded before races start
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.raceReminders}
              onChange={() => handleToggleNotificationType('raceReminders')}
              className="w-5 h-5 text-racing-blue rounded focus:ring-racing-blue"
            />
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Note: Push notifications require a modern browser and may not work in private/incognito mode.
        </p>
      </div>
    </div>
  );
}
