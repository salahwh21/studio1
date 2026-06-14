'use client';

import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    setIsSupported(true);

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✅ Service Worker registered');
        setRegistration(reg);

        // Check push subscription
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      })
      .catch((err) => {
        console.error('❌ Service Worker registration failed:', err);
      });
  }, []);

  const subscribeToPush = async () => {
    if (!registration) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Push notification permission denied');
        return null;
      }

      // Get VAPID public key from server
      const response = await fetch('/api/notifications/vapid-public-key');
      const { publicKey } = await response.json();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      return subscription;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return null;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!registration) return;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Push unsubscription failed:', err);
    }
  };

  return {
    isSupported,
    registration,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
  };
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
