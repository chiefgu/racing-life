import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { getMessagingInstance } from './firebase';
import { api } from './api';

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const checkNotificationPermission = (): NotificationPermissionStatus => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, denied: false, default: true };
  }

  return {
    granted: Notification.permission === 'granted',
    denied: Notification.permission === 'denied',
    default: Notification.permission === 'default',
  };
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      return null;
    }

    const permission = await requestNotificationPermission();
    if (!permission) {
      console.warn('Notification permission not granted');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log('FCM Token obtained:', token);
      // Send token to backend
      await api.saveFCMToken(token);
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const setupNotificationListener = (
  onNotification: (payload: MessagePayload) => void
): (() => void) | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  getMessagingInstance().then((messaging) => {
    if (!messaging) {
      return;
    }

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground notification received:', payload);
      onNotification(payload);

      // Show browser notification
      if (payload.notification) {
        const { title, body, icon } = payload.notification;
        if (title) {
          new Notification(title, {
            body: body || '',
            icon: icon || '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: payload.data?.tag || 'default',
            requireInteraction: false,
          });
        }
      }
    });

    return unsubscribe;
  });

  return null;
};

export const showLocalNotification = (
  title: string,
  options?: NotificationOptions
): void => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });
  }
};
