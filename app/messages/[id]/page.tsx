import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ChatClient from './ChatClient';

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const { id } = await params;
  
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      user1: true,
      user2: true,
    }
  });

  if (!conversation) {
    redirect('/messages');
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    redirect('/messages');
  }

  const partner = conversation.user1Id === userId ? conversation.user2 : conversation.user1;

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      receiverId: userId,
      isRead: false
    },
    data: { isRead: true }
  });

  const initialMessages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    take: 50
  });

  return (
    <div style={{ backgroundColor: '#000000', height: '100dvh', width: '100%', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50,
        padding: '12px 16px',
        borderBottom: '1px solid #27272A',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Link href="/messages" style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={28} />
        </Link>
        <Link href={`/user/${partner.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexGrow: 1 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#27272A', flexShrink: 0 }}>
            {partner.profilePictureUrl ? (
              <img src={partner.profilePictureUrl} alt={partner.name || partner.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>{partner.name || partner.username}</span>
            <span style={{ color: '#71717A', fontSize: '13px' }}>{partner.accountType}</span>
          </div>
        </Link>
      </div>
      <ChatClient initialMessages={initialMessages} conversationId={id} currentUserId={userId} partnerId={partner.id} />
    </div>
  );
}