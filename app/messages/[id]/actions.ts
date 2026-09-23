'use server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function sendMessage(conversationId: string, receiverId: string, content: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return { success: false };

  try {
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
        conversationId
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageId: message.id }
    });

    // Notify receiver
    const actorUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } });
    const actorName = actorUser?.name || actorUser?.username || 'Someone';

    await prisma.notification.create({
      data: {
        userId: receiverId,
        actorId: userId,
        type: 'message',
        content: 'sent you a message.',
        link: `/messages/${conversationId}`
      }
    });

    revalidatePath(`/messages/${receiverId}`);
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath('/messages');

    return { success: true, message };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false };
  }
}

export async function getLatestMessages(conversationId: string, take = 50) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return [];

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
      return [];
    }

    // Mark as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take
    });

    return messages;
  } catch (err) {
    console.error('Error fetching latest messages:', err);
    return [];
  }
}