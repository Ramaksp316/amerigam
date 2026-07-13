'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { savePushSubscription } from '../actions/pushActions';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        console.error('Missing VAPID public key');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      const result = await savePushSubscription(subscription.toJSON());
      if (result.success) {
        setIsSubscribed(true);
        alert('Push Notifications enabled successfully!');
      } else {
        console.error('Failed to save push subscription');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      alert('Could not enable notifications. Check browser permissions.');
    }
  }

  if (!isSupported || isSubscribed) {
    return null; // Don't show if not supported or already subscribed
  }

  return (
    <div style={{
      margin: '20px 0',
      padding: '15px',
      backgroundColor: 'rgba(var(--text-primary-rgb), 0.05)',
      borderRadius: '10px',
      border: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BellOff size={20} color="var(--text-secondary)" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Get notified when people interact with you!</span>
      </div>
      <button 
        onClick={subscribeToPush}
        className="button-primary"
        style={{ padding: '8px 15px', fontSize: '0.85rem' }}
      >
        Turn On
      </button>
    </div>
  );
}
