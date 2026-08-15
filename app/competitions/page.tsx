import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CompetitionsClient from './CompetitionsClient';

export default async function CompetitionsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  // Get current user details and follows
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      following: true
    }
  });

  const followingIds = currentUser?.following.map(f => f.followingId) || [];

  // Fetch Following Events
  const followingEvents = await prisma.event.findMany({
    where: {
      creatorId: { in: followingIds }
    },
    include: {
      creator: {
        select: { id: true, name: true, avatarData: true }
      },
      _count: {
        select: { registrations: true }
      }
    },
    orderBy: { startDate: 'asc' },
    take: 10
  });

  // Fetch Suggested Events (based on user category or just random if not mapped)
  // For now we'll do a simple fetch
  const suggestedEvents = await prisma.event.findMany({
    where: {
      NOT: { creatorId: { in: followingIds } }
    },
    include: {
      creator: {
        select: { id: true, name: true, avatarData: true }
      },
      _count: {
        select: { registrations: true }
      }
    },
    orderBy: { startDate: 'desc' },
    take: 10
  });

  // Fetch Top Events
  const topEvents = await prisma.event.findMany({
    include: {
      creator: {
        select: { id: true, name: true, avatarData: true }
      },
      _count: {
        select: { registrations: true }
      }
    },
    orderBy: {
      participantLimit: 'desc' // or _count: { registrations: 'desc' } but Prisma requires special grouping for order by count, participantLimit is easy
    },
    take: 15
  });

  // Fetch Top People dummy data
  const topPeople = await prisma.user.findMany({
    where: { accountType: 'PERSONAL' },
    take: 10,
    select: { id: true, name: true, avatarData: true, identity: true }
  });

  return (
    <CompetitionsClient 
      followingEvents={followingEvents}
      suggestedEvents={suggestedEvents}
      topEvents={topEvents}
      topPeople={topPeople}
      currentUser={currentUser}
    />
  );
}
