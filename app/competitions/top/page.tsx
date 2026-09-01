import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ViewAllPageClient from '../ViewAllPageClient';

export default async function TopCompetitionsPage({ searchParams }: { searchParams: { scope?: string } }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const resolvedParams = await searchParams;
  const scope = resolvedParams.scope || 'International';

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      eventRegistrations: { select: { eventId: true } }
    }
  });

  if (!user) redirect('/login');

  const registeredEventIds = user.eventRegistrations.map((r: any) => r.eventId);

  // Normalize string for case insensitive match if needed, but DB is normalized now
  const topEvents = await prisma.event.findMany({
    where: { 
      eventLevel: { equals: scope, mode: 'insensitive' }
    },
    include: {
      creator: { select: { name: true, avatarData: true } },
      _count: { select: { registrations: true } }
    },
    orderBy: { createdAt: 'desc' } // Real app might sort by popularity
  });

  return (
    <ViewAllPageClient 
      title={`Top ${scope} Competitions`}
      events={topEvents} 
      registeredEventIds={registeredEventIds} 
    />
  );
}
