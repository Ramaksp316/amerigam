import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ViewAllPageClient from '../ViewAllPageClient';

export default async function FollowingCompetitionsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      following: { select: { followingId: true } },
      eventRegistrations: { select: { eventId: true } }
    }
  });

  if (!user) redirect('/login');

  const followedIds = user.following.map((f: any) => f.followingId);
  const registeredEventIds = user.eventRegistrations.map((r: any) => r.eventId);

  const followingEvents = await prisma.event.findMany({
    where: { creatorId: { in: followedIds } },
    include: {
      creator: { select: { name: true, avatarData: true } },
      _count: { select: { registrations: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <ViewAllPageClient 
      title="Following" 
      events={followingEvents} 
      registeredEventIds={registeredEventIds} 
    />
  );
}
