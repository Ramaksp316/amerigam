import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LocalTime from '../../components/LocalTime';
import ChatClient from '../../components/ChatClient';
import MessageList from '../../components/MessageList';
import ProfilePicture from '../../components/ProfilePicture';
import { sendWebPushNotification } from '../../actions/sendWebPush';

async function sendMessage(formData: FormData) {
  'use server';
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const receiverId = formData.get('receiverId') as string;
  const content = formData.get('content') as string;

  if (content && content.trim().length > 0) {
    await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
      }
    });

    await prisma.notification.create({
      data: {
        userId: receiverId,
        actorId: userId,
        type: 'message',
        content: 'sent you a message.',
        link: `/messages/${userId}`,
      }
    });

    const actorUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, username: true } });
    const actorName = actorUser ? (actorUser.username || actorUser.name || 'Someone') : 'Someone';
    await sendWebPushNotification(receiverId, 'New Message', `${actorName}: ${content.length > 30 ? content.substring(0, 30) + '...' : content}`, `/messages/${userId}`);

    revalidatePath(`/messages/${receiverId}`);
  }
}

async function deleteMessage(formData: FormData) {
  'use server';
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const messageId = formData.get('messageId') as string;
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  
  if (message && message.senderId === userId) {
    const THREE_HOURS = 3 * 60 * 60 * 1000;
    if (Date.now() - message.createdAt.getTime() < THREE_HOURS) {
      await prisma.message.delete({ where: { id: messageId } });
      revalidatePath(`/messages/${message.receiverId}`);
    }
  }
}

async function editMessage(formData: FormData) {
  'use server';
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const messageId = formData.get('messageId') as string;
  const content = formData.get('content') as string;
  
  if (!content || content.trim().length === 0) return;

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  
  if (message && message.senderId === userId) {
    const THREE_HOURS = 3 * 60 * 60 * 1000;
    if (Date.now() - message.createdAt.getTime() < THREE_HOURS) {
      await prisma.message.update({ 
        where: { id: messageId },
        data: { content, isEdited: true }
      });
      revalidatePath(`/messages/${message.receiverId}`);
    }
  }
}

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const { id: partnerId } = await params;
  
  if (userId === partnerId) {
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: 'var(--space-8)', padding: 'var(--space-8)' }}>
        <p style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-4)' }}>You cannot message yourself.</p>
        <Link href="/messages" className="btn btn-small">Back to Inbox</Link>
      </div>
    );
  }

  const partner = await prisma.user.findUnique({ where: { id: partnerId } });
  if (!partner) {
    notFound();
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="card" style={{ 
      display: 'flex', flexDirection: 'column', 
      height: '100%', maxHeight: 'calc(100dvh - 80px)',
      padding: '0', overflow: 'hidden', margin: '0 auto', maxWidth: '750px',
      position: 'relative'
    }}>
      
      {/* Chat Header */}
      <div style={{ 
        padding: 'var(--space-3) var(--space-4)', 
        borderBottom: '1px solid var(--border-color)', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface-1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link href="/messages" className="btn-text" style={{ padding: '4px' }} title="Back to Inbox">
            <ArrowLeft size={20} />
          </Link>
          <Link href={`/user/${partnerId}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none' }}>
            <ProfilePicture user={partner} size={40} />
            <h2 style={{ fontSize: 'var(--text-md)', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
              {partner.name || partner.username || partner.email}
            </h2>
          </Link>
        </div>
      </div>
      
      {/* Messages Thread Container */}
      <div id="chat-container" style={{ 
        flexGrow: 1, overflowY: 'auto', padding: 'var(--space-4)', 
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        backgroundColor: 'var(--surface-0)'
      }}>
        <MessageList 
          messages={messages} 
          myId={userId} 
          partnerId={partnerId} 
          deleteAction={deleteMessage} 
          editAction={editMessage} 
        />
      </div>

      <ChatClient myId={userId} partnerId={partnerId} sendMessageAction={sendMessage} />

    </div>
  );
}
