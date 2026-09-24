import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ChatClient from './ChatClient';
import ConversationSidebar, { SerializedConversation } from '../ConversationSidebar';
import MessagesHeader from '../MessagesHeader';

export const dynamic = 'force-dynamic';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const { id } = await params;

  const [currentUser, unreadNotifications, conversation] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, avatarData: true },
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
    prisma.conversation.findUnique({
      where: { id },
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
      },
    }),
  ]);

  if (!currentUser) {
    redirect('/login');
  }

  if (!conversation) {
    redirect('/messages');
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    redirect('/messages');
  }

  const partner =
    conversation.user1Id === userId ? conversation.user2 : conversation.user1;

  // Mark incoming messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      receiverId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  // Fetch initial messages for active conversation
  const rawMessages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    take: 60,
  });

  const initialMessages = rawMessages.map((m) => ({
    id: m.id,
    content: m.content,
    mediaUrl: m.mediaUrl,
    mediaType: m.mediaType,
    voiceDuration: m.voiceDuration,
    senderId: m.senderId,
    receiverId: m.receiverId,
    createdAt: m.createdAt.toISOString(),
    isRead: m.isRead,
  }));

  // Fetch all conversations for Desktop left sidebar
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
    const p = conv.user1Id === userId ? conv.user2 : conv.user1;
    const lastMsg = conv.messages[0];
    return {
      id: conv.id,
      partner: p,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            createdAt: lastMsg.createdAt.toISOString(),
            senderId: lastMsg.senderId,
          }
        : null,
      unreadCount: conv.id === id ? 0 : conv._count.messages,
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
      {/* Top Header matching Normal message 2.png */}
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
        {/* Left Pane (Desktop): Recent messages for you */}
        <div
          className="desktop-only"
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
            activeConversationId={id}
            currentUserId={userId}
            availableContacts={availableContacts}
          />
        </div>

        {/* Right Pane: Message | Community Tabs + ChatClient Card */}
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
          {/* Tabs directly above the card matching Normal message 2.png */}
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
              className="messages-tab-community-link"
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#8E8E93',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
            >
              Community
            </Link>
          </div>

          {/* Active Chat Card */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <ChatClient
              initialMessages={initialMessages}
              conversationId={id}
              currentUserId={userId}
              partner={partner}
            />
          </div>
        </div>
      </div>
    </div>
  );
}