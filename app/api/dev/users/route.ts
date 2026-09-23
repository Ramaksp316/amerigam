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
      // 1. Notifications
      await tx.notification.deleteMany({ where: { OR: [{ userId }, { actorId: userId }] } }).catch(() => {});
      // 2. Push subscriptions
      await tx.pushSubscription.deleteMany({ where: { userId } }).catch(() => {});
      // 3. Messages & Conversations
      await tx.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }).catch(() => {});
      await tx.conversation.deleteMany({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } }).catch(() => {});
      // 4. Follows
      await tx.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }).catch(() => {});
      // 5. Likes & Comments
      await tx.like.deleteMany({ where: { userId } }).catch(() => {});
      await tx.comment.deleteMany({ where: { authorId: userId } }).catch(() => {});
      // 6. Posts & Stories
      await tx.post.deleteMany({ where: { authorId: userId } }).catch(() => {});
      await tx.story.deleteMany({ where: { authorId: userId } }).catch(() => {});
      // 7. Community interactions
      await tx.communityMessage.deleteMany({ where: { senderId: userId } }).catch(() => {});
      await tx.communityPost.deleteMany({ where: { authorId: userId } }).catch(() => {});
      await tx.communityTask.deleteMany({ where: { OR: [{ creatorId: userId }, { assignedToId: userId }] } }).catch(() => {});
      await tx.communityMember.deleteMany({ where: { userId } }).catch(() => {});
      await tx.community.deleteMany({ where: { creatorId: userId } }).catch(() => {});
      // 8. Event relations
      await tx.eventRegistration.deleteMany({ where: { userId } }).catch(() => {});
      await tx.eventCheckIn.deleteMany({ where: { scannedById: userId } }).catch(() => {});
      await tx.eventEvaluation.deleteMany({ where: { judgeId: userId } }).catch(() => {});
      await tx.eventTeam.deleteMany({ where: { captainId: userId } }).catch(() => {});
      await tx.event.deleteMany({ where: { creatorId: userId } }).catch(() => {});
      // 9. Challenges & Transactions
      await tx.challenge.deleteMany({ where: { OR: [{ challengerId: userId }, { challengedId: userId }] } }).catch(() => {});
      await tx.apTransaction.deleteMany({ where: { userId } }).catch(() => {});
      await tx.achievement.deleteMany({ where: { userId } }).catch(() => {});
      await tx.competitionEntity.deleteMany({ where: { userId } }).catch(() => {});
      await tx.competition.deleteMany({ where: { creatorId: userId } }).catch(() => {});
      await tx.competitionModel.deleteMany({ where: { creatorId: userId } }).catch(() => {});
      // 10. Profiles & Connections
      await tx.personalProfile.deleteMany({ where: { userId } }).catch(() => {});
      await tx.businessProfile.deleteMany({ where: { userId } }).catch(() => {});
      await tx.creatorProfile.deleteMany({ where: { userId } }).catch(() => {});
      await tx.influencerProfile.deleteMany({ where: { userId } }).catch(() => {});
      await tx.organizationProfile.deleteMany({ where: { userId } }).catch(() => {});
      await tx.entityConnection.deleteMany({ where: { OR: [{ sourceId: userId }, { targetId: userId }] } }).catch(() => {});
      // 11. Dev error logs
      await tx.devErrorLog.deleteMany({ where: { userId } }).catch(() => {});

      // Finally delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete user:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete user' }, { status: 500 });
  }
}
