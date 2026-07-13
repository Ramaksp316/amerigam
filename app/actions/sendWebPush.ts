import webpush from 'web-push';
import { prisma } from '../../lib/prisma';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@amerigam.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendWebPushNotification(userId: string, title: string, body: string, url: string) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured, skipping web push notification.');
    return;
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: '/icon.png'
    });

    const sendPromises = subscriptions.map(sub => 
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            auth: sub.auth,
            p256dh: sub.p256dh
          }
        },
        payload
      ).catch(async (error) => {
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Subscription has expired or is no longer valid
          console.log('Subscription has expired or is invalid. Deleting from database.');
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error('Error sending push notification:', error);
        }
      })
    );

    await Promise.all(sendPromises);
  } catch (error) {
    console.error('Failed to send web push notifications:', error);
  }
}
