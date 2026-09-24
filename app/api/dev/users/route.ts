import { NextRequest, NextResponse } from 'next/server';
import { isDevAuthenticatedFromRequest } from '@/lib/dev-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = req.nextUrl.searchParams.get('url') || '';
    const search = req.nextUrl.searchParams.get('search') || '';
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          accountType: true,
          onboarded: true,
          createdAt: true,
          lastSeen: true,
          status: true,
          city: true,
          state: true,
          country: true,
          amerigamPoints: true,
          bio: true,
          personalProfile: {
            select: { mainIdentity: true }
          },
          _count: {
            select: { posts: true, followers: true, following: true }
          }
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Dev users error:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      // 1. User's own bookmarks
      await tx.bookmark.deleteMany({ where: { userId } });

      // 2. Cascade delete all posts authored by this user, including other users' comments/likes/bookmarks on them
      const userPosts = await tx.post.findMany({ where: { authorId: userId }, select: { id: true } });
      const postIds = userPosts.map((p) => p.id);
      if (postIds.length > 0) {
        await tx.comment.deleteMany({ where: { postId: { in: postIds } } });
        await tx.like.deleteMany({ where: { postId: { in: postIds } } });
        await tx.bookmark.deleteMany({ where: { postId: { in: postIds } } });
        await tx.post.deleteMany({ where: { id: { in: postIds } } });
      }

      // 3. Likes and comments by this user on other posts
      await tx.like.deleteMany({ where: { userId } });
      await tx.comment.deleteMany({ where: { authorId: userId } });

      // 4. Notifications
      await tx.notification.deleteMany({ where: { OR: [{ userId }, { actorId: userId }] } });

      // 5. Push subscriptions
      await tx.pushSubscription.deleteMany({ where: { userId } });

      // 6. Messages & Conversations
      await tx.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } });
      await tx.conversation.deleteMany({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } });

      // 7. Follows
      await tx.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } });

      // 8. Stories
      await tx.story.deleteMany({ where: { authorId: userId } });

      // 9. Community interactions & notes
      await tx.communityNote.deleteMany({ where: { updatedById: userId } });
      await tx.communityMessage.deleteMany({ where: { senderId: userId } });
      await tx.communityPost.deleteMany({ where: { authorId: userId } });
      await tx.communityTask.deleteMany({ where: { OR: [{ creatorId: userId }, { assignedToId: userId }] } });
      await tx.communityMember.deleteMany({ where: { userId } });
      await tx.community.deleteMany({ where: { creatorId: userId } });

      // 10. Event relations
      await tx.eventResult.deleteMany({ where: { userId } });
      await tx.eventRegistration.deleteMany({ where: { userId } });
      await tx.eventCheckIn.deleteMany({ where: { scannedById: userId } });
      await tx.eventEvaluation.deleteMany({ where: { judgeId: userId } });
      await tx.eventTeam.deleteMany({ where: { captainId: userId } });
      await tx.event.deleteMany({ where: { creatorId: userId } });

      // 11. Challenges & Transactions
      await tx.challenge.deleteMany({ where: { OR: [{ challengerId: userId }, { challengedId: userId }] } });
      await tx.apTransaction.deleteMany({ where: { userId } });
      await tx.achievement.deleteMany({ where: { userId } });
      await tx.competitionEntity.deleteMany({ where: { userId } });
      await tx.competition.deleteMany({ where: { creatorId: userId } });
      await tx.competitionModel.deleteMany({ where: { creatorId: userId } });

      // 12. Profiles & Connections
      await tx.personalProfile.deleteMany({ where: { userId } });
      await tx.businessProfile.deleteMany({ where: { userId } });
      await tx.creatorProfile.deleteMany({ where: { userId } });
      await tx.influencerProfile.deleteMany({ where: { userId } });
      await tx.organizationProfile.deleteMany({ where: { userId } });
      await tx.entityConnection.deleteMany({ where: { OR: [{ sourceId: userId }, { targetId: userId }] } });

      // 13. Dev error logs
      await tx.devErrorLog.deleteMany({ where: { userId } });

      // 14. Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete user:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete user' }, { status: 500 });
  }
}
