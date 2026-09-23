import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ConversationSidebar, { SerializedConversation } from './ConversationSidebar';
import EmptyStateIllustration from './EmptyStateIllustration';

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
      {/* Left Pane: Conversation Sidebar */}
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
          currentUserId={userId}
          availableContacts={availableContacts}
        />
      </div>

      {/* Right Pane (Desktop): Figma 17.png Empty State Illustration inside dark rounded card */}
      <div
        className="messages-main-container"
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
        <div
          className="messages-card-shell"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#16171B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '28px',
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
  );
}
