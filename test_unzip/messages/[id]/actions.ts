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
        link: `/messages/${receiverId}`
      }
    });

    // We skip the push import here to avoid path issues, or we can assume it's silent on push failure.
    // Assuming standard web push logic if imported, but database notification is what matters for the UI.

    revalidatePath(`/messages/${receiverId}`);
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath('/messages');

    return { success: true, message };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false };
  }
}