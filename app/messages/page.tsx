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
    // Check if conversation exists
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

  // Fetch contacts for the "New Message" modal
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
    <div className="w-full h-full min-h-[calc(100vh-62px)] md:h-[calc(100vh-20px)] flex flex-col md:flex-row bg-[#000000] overflow-hidden">
      {/* Left Pane: Conversation Sidebar */}
      <div className="w-full md:w-80 lg:w-[350px] shrink-0 h-full flex flex-col border-r border-white/5 pb-20 md:pb-0">
        <ConversationSidebar
          conversations={conversations}
          currentUserId={userId}
          availableContacts={availableContacts}
        />
      </div>

      {/* Right Pane (Desktop Only): Figma 17.png Empty State Illustration inside dark rounded card */}
      <div className="hidden md:flex flex-1 h-full p-4 lg:p-6 overflow-hidden">
        <div className="w-full h-full bg-[#18191c] border border-white/5 rounded-[28px] overflow-hidden flex items-center justify-center shadow-2xl">
          <EmptyStateIllustration />
        </div>
      </div>
    </div>
  );
}
