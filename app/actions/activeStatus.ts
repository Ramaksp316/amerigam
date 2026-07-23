'use server';

import { prisma } from '../../lib/prisma';

export async function pingActiveStatus(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() }
    });
  } catch (err) {
    console.error('Failed to update active status:', err);
  }
}
