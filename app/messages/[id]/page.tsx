import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatClient from './ChatClient';
import ConversationSidebar, { SerializedConversation } from '../ConversationSidebar';

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

  const conversation = await prisma.conversation.findUnique({
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
  });

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
      className="messages-root-layout"
      style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000000',
        color: '#FFFFFF'
      }}
    >
      {/* Left Pane (Desktop): Conversation Sidebar */}
      <div
        className="messages-sidebar-panel"
        style={{
          width: '340px',
          minWidth: '300px',
          maxWidth: '380px',
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

      {/* Right Pane (Desktop: rounded card; Mobile: full-screen) */}
      <div
        className="messages-main-container mobile-active"
        style={{
          flex: 1,
          height: '100%',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxSizing: 'border-box'
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
  );
}