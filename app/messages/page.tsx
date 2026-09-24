import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ConversationSidebar, { SerializedConversation } from './ConversationSidebar';
import EmptyStateIllustration from './EmptyStateIllustration';
import MessagesHeader from './MessagesHeader';

export const dynamic = 'force-dynamic';

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const params = await searchParams;
  const targetUserId = params.userId;

  if (targetUserId && targetUserId !== userId) {
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: targetUserId,
        },
      });
    }
    redirect(`/messages/${conversation.id}`);
  }

  // Fetch current user and unread notification count
  const [currentUser, unreadNotifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, avatarData: true },
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  // Fetch all conversations for the user
  const rawConversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarData: true,
          status: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarData: true,
          status: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          content: true,
          createdAt: true,
          senderId: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              receiverId: userId,
              isRead: false,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const conversations: SerializedConversation[] = rawConversations.map((conv) => {
    const partner = conv.user1Id === userId ? conv.user2 : conv.user1;
    const lastMsg = conv.messages[0];
    return {
      id: conv.id,
      partner,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            createdAt: lastMsg.createdAt.toISOString(),
            senderId: lastMsg.senderId,
          }
        : null,
      unreadCount: conv._count.messages,
    };
  });

  // Fetch contacts for "New Message" modal
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarData: true,
          status: true,
        },
      },
    },
    take: 30,
  });

  const availableContacts = follows.map((f) => f.following);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000000',
        color: '#FFFFFF'
      }}
    >
      {/* Top Header matching Normal messagar.png */}
      <MessagesHeader
        currentUser={currentUser}
        unreadNotifications={unreadNotifications}
      />

      {/* Main Container below header */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Left Pane: Recent messages for you */}
        <div
          style={{
            width: '320px',
            minWidth: '280px',
            maxWidth: '360px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000000',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}
        >
          <ConversationSidebar
            conversations={conversations}
            currentUserId={userId}
            availableContacts={availableContacts}
          />
        </div>

        {/* Right Pane: Message | Community Tabs + 3D Speech Bubble Card */}
        <div
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 24px 20px 24px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            backgroundColor: '#000000'
          }}
        >
          {/* Tabs directly above the card matching Normal messagar.png */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              padding: '4px 8px 12px 8px',
              flexShrink: 0
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'default'
              }}
            >
              Message
            </span>
            <Link
              href="/communities"
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#8E8E93',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
            >
              Community
            </Link>
          </div>

          {/* Large Dark Rounded Card containing 3D Speech Bubble Illustration */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              backgroundColor: '#16171B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <EmptyStateIllustration />
          </div>
        </div>
      </div>
    </div>
  );
}
