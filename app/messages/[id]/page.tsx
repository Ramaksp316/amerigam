import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LocalTime from '../../components/LocalTime';
import ChatClient from '../../components/ChatClient';
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
      height: 'calc(100vh - 120px)', maxHeight: '750px',
      padding: '0', overflow: 'hidden', margin: '0 auto', maxWidth: '750px'
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
          <h2 style={{ fontSize: 'var(--text-md)', margin: 0, fontWeight: 700 }}>
            <Link href={`/user/${partnerId}`} style={{ color: 'var(--text-primary)' }}>
              {partner.name || partner.username || partner.email}
            </Link>
          </h2>
        </div>
      </div>
      
      {/* Messages Thread Container */}
      <div id="chat-container" style={{ 
        flexGrow: 1, overflowY: 'auto', padding: 'var(--space-4)', 
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        backgroundColor: 'var(--surface-0)'
      }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'var(--space-8)', fontSize: 'var(--text-sm)' }}>
            No messages yet. Say hi!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
              <div key={msg.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isMe ? 'flex-end' : 'flex-start',
              }}>
                <div style={{ 
                  maxWidth: '75%',
                  padding: 'var(--space-2) var(--space-4)', 
                  background: isMe ? 'var(--gradient-primary)' : 'var(--surface-2)', 
                  color: isMe ? '#FFFFFF' : 'var(--text-primary)',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: 'var(--text-sm)',
                  lineHeight: '1.4',
                  boxShadow: isMe ? 'var(--shadow-sm)' : 'none',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px', padding: '0 4px' }}>
                  <LocalTime date={msg.createdAt} format="time" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <ChatClient myId={userId} partnerId={partnerId} sendMessageAction={sendMessage} />

    </div>
  );
}
