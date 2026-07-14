import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
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
      <div className="card" style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>You cannot message yourself.</p>
        <a href="/messages" className="btn">Back to Inbox</a>
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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '70vh', padding: '0', overflow: 'hidden' }}>
      
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
          <a href={`/user/${partnerId}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            {partner.name || partner.email}
          </a>
        </h2>
        <a href="/messages" className="btn-text">Back to Inbox</a>
      </div>
      
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', backgroundColor: 'var(--bg-color)' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>No messages yet. Say hi!</p>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === userId;
            return (
              <div key={msg.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isMe ? 'flex-end' : 'flex-start',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  maxWidth: '75%',
                  padding: '12px 18px', 
                  backgroundColor: isMe ? 'var(--text-primary)' : 'var(--card-bg)', 
                  color: isMe ? 'var(--bg-color)' : 'var(--text-primary)',
                  border: isMe ? 'none' : '1px solid var(--border-color)',
                  borderRadius: isMe ? '20px 20px 0 20px' : '20px 20px 20px 0',
                  fontSize: '1.05rem',
                  lineHeight: '1.4'
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
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
