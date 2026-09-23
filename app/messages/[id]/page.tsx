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
    <div className="w-full h-screen md:h-[calc(100vh-20px)] flex bg-[#000000] overflow-hidden">
      {/* Left Pane (Desktop Only): Conversation Sidebar */}
      <div className="hidden md:flex md:w-80 lg:w-[350px] shrink-0 h-full flex-col border-r border-white/5">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={id}
          currentUserId={userId}
          availableContacts={availableContacts}
        />
      </div>

      {/* Right Pane (Desktop: inside rounded card container; Mobile: full-screen) */}
      <div className="flex-1 h-full w-full p-0 md:p-4 lg:p-6 overflow-hidden flex flex-col">
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