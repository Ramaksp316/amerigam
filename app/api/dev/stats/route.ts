import { NextRequest, NextResponse } from 'next/server';
import { isDevAuthenticatedFromRequest } from '@/lib/dev-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isDevAuthenticatedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      totalUsers,
      onboardedUsers,
      todayUsers,
      totalPosts,
      totalEvents,
      totalCommunities,
      totalMessages,
      activeUsers,
      unresolvedErrors,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { onboarded: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.post.count().catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.community.count().catch(() => 0),
      prisma.message.count().catch(() => 0),
      prisma.user.count({
        where: {
          lastSeen: {
            gte: new Date(Date.now() - 3 * 60 * 1000), // last 3 minutes (matches activeStatusTracker ping)
          },
        },
      }),
      prisma.devErrorLog.count({ where: { resolved: false } }).catch(() => 0),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          city: true,
          country: true,
          onboarded: true,
          accountType: true,
        },
      }),
    ]);

    // Weekly signup trend (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklySignups = await prisma.user.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const signupsByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      signupsByDay[key] = 0;
    }
    weeklySignups.forEach(u => {
      const key = u.createdAt.toISOString().split('T')[0];
      if (signupsByDay[key] !== undefined) signupsByDay[key]++;
    });

    return NextResponse.json({
      totalUsers,
      onboardedUsers,
      notOnboarded: totalUsers - onboardedUsers,
      todayUsers,
      totalPosts,
      totalEvents,
      totalCommunities,
      totalMessages,
      activeUsers,
      unresolvedErrors,
      recentSignups,
      weeklySignupTrend: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
    });
  } catch (err) {
    console.error('Dev stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
