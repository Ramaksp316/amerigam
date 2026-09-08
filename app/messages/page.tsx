import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MessageCircle, Search, Edit } from 'lucide-react';
import Link from 'next/link';
import ProfilePicture from '../components/ProfilePicture';

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ userId?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const params = await searchParams;
  const targetUserId = params.userId;

  if (targetUserId && targetUserId !== userId) {
    // Check if conversation exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId }
        ]
      }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: targetUserId
        }
      });
    }
    redirect(`/messages/${conversation.id}`);
  }

  // Fetch all conversations for the user
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    },
    include: {
      user1: true,
      user2: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      _count: {
        select: {
          messages: {
            where: {
              receiverId: userId,
              isRead: false
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100%', maxWidth: '600px', margin: '0 auto', overflowX: 'hidden', paddingBottom: '70px' }}>
      
      {/* Premium Compact Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50,
        padding: '12px 16px',
        borderBottom: '1px solid #18181B'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-sans), sans-serif' }}>Messages</h1>
          <Link href="/network" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', color: '#1D9BF0' }}>
            <Edit size={22} />
          </Link>
        </div>

        {/* Compact Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#71717A" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            style={{
              width: '100%',
              backgroundColor: '#18181B',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px 8px 36px',
              color: 'white',
              fontSize: '14px',
              fontFamily: 'var(--font-sans), sans-serif',
              outline: 'none'
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-sans), sans-serif' }}>No messages yet</h3>
            <p style={{ color: '#71717A', margin: '0 0 16px 0', fontSize: '14px', fontFamily: 'var(--font-sans), sans-serif' }}>Start a conversation.</p>
            <Link href="/network" style={{ display: 'inline-block', backgroundColor: '#1D9BF0', color: 'white', fontWeight: 600, fontSize: '14px', padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', fontFamily: 'var(--font-sans), sans-serif' }}>
              New Message
            </Link>
          </div>
        ) : (
          conversations.map(conv => {
            const partner = conv.user1Id === userId ? conv.user2 : conv.user1;
            const lastMessage = conv.messages[0];
            const unreadCount = conv._count.messages;
            const isUnread = unreadCount > 0;

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`} style={{ textDecoration: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #18181B' }}>
                <ProfilePicture user={partner} size={48} showStatus={false} />
                
                <div style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: isUnread ? 700 : 500, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans), sans-serif' }}>
                      {partner.name || partner.username}
                    </span>
                    {lastMessage && (
                      <span style={{ color: isUnread ? '#1D9BF0' : '#71717A', fontSize: '12px', flexShrink: 0, marginLeft: '8px', fontWeight: isUnread ? 600 : 400, fontFamily: 'var(--font-sans), sans-serif' }}>
                        {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      color: isUnread ? '#E4E4E7' : '#71717A', 
                      fontSize: '14px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      fontWeight: isUnread ? 500 : 400,
                      fontFamily: 'var(--font-sans), sans-serif'
                    }}>
                      {lastMessage ? (lastMessage.senderId === userId ? 'You: ' + lastMessage.content : lastMessage.content) : 'No messages yet'}
                    </span>
                    
                    {isUnread && (
                      <div style={{ backgroundColor: '#1D9BF0', color: 'white', fontSize: '10px', fontWeight: 700, minWidth: '16px', height: '16px', padding: '0 4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '8px', fontFamily: 'var(--font-sans), sans-serif' }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
