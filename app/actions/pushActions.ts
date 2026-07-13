'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';

export async function savePushSubscription(subscription: any) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId || !subscription) {
    return { success: false, error: 'Unauthorized or missing subscription' };
  }

  try {
    const existingSub = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (existingSub) {
      if (existingSub.userId !== userId) {
        // If same device but different user logged in, update it
        await prisma.pushSubscription.update({
          where: { endpoint: subscription.endpoint },
          data: { userId }
        });
      }
      return { success: true };
    }

    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return { success: false, error: 'Failed to save subscription' };
  }
}
