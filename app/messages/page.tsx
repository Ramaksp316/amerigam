import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MessageCircle, Search, Edit } from 'lucide-react';
import Link from 'next/link';

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
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100%', maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' }}>
      
      {/* Premium Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50,
        padding: '16px',
        borderBottom: '1px solid #27272A'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'white' }}>Messages</h1>
          <Link href="/network" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(29, 155, 240, 0.1)', color: '#1D9BF0' }}>
            <Edit size={20} />
          </Link>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#71717A" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            style={{
              width: '100%',
              backgroundColor: '#18181B',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 16px 12px 42px',
              color: 'white',
              fontSize: '15px',
              outline: 'none'
            }}
          />
        </div>
      </div>
      
      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column' }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ margin: '0 auto 16px', width: '64px', height: '64px', borderRadius: '50%', background: '#18181B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={32} color="#71717A" />
            </div>
            <h3 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '18px' }}>No messages</h3>
            <p style={{ color: '#71717A', margin: 0, fontSize: '15px' }}>Start a conversation with someone.</p>
          </div>
        ) : (
          conversations.map(conv => {
            const partner = conv.user1Id === userId ? conv.user2 : conv.user1;
            const lastMessage = conv.messages[0];
            const unreadCount = conv._count.messages;

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`} style={{ textDecoration: 'none', padding: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #18181B' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#27272A', flexShrink: 0 }}>
                  {partner.avatarData ? (
                    <img src={partner.avatarData} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
                
                <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {partner.name || partner.username}
                    </span>
                    {lastMessage && (
                      <span style={{ color: unreadCount > 0 ? '#1D9BF0' : '#71717A', fontSize: '13px', flexShrink: 0, marginLeft: '8px' }}>
                        {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ 
                      color: unreadCount > 0 ? 'white' : '#71717A', 
                      fontSize: '15px', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      fontWeight: unreadCount > 0 ? 600 : 400 
                    }}>
                      {lastMessage ? (lastMessage.senderId === userId ? 'You: ' + lastMessage.content : lastMessage.content) : 'No messages yet'}
                    </span>
                    
                    {unreadCount > 0 && (
                      <div style={{ backgroundColor: '#1D9BF0', color: 'white', fontSize: '11px', fontWeight: 700, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '8px' }}>
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
