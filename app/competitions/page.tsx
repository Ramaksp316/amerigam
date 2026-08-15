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

  const suggestedMapping: Record<string, string[]> = {
    'Developer': ['CodeRush India', 'Buildathon India', 'DesignSprint League'],
    'Founder': ['PitchArena', 'IgniteX Campus League', 'Buildathon India'],
    'Photographer': ['LensQuest', 'ArtSphere Collective'],
    'Musician': ['Rhythm Clash'],
    'Athlete': ['FitBattle India', 'NextGen Sports League'],
    'Filmmaker': ['FrameFest India', 'Creator Clash India'],
    'Gamer': ['GameGrid Esports'],
    'Public Speaker': ['SpeakUp Championship']
  };

  const userIdentity = currentUser?.identity || '';
  let relevantOrgNames = suggestedMapping[userIdentity] || [];

  const suggestedEvents = await prisma.event.findMany({
    where: {
      NOT: { creatorId: { in: followingIds } },
      ...(relevantOrgNames.length > 0 && {
        creator: {
          name: { in: relevantOrgNames }
        }
      })
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

  // Fetch Current User's registrations to pass state down
  const userRegistrations = await prisma.eventRegistration.findMany({
    where: { userId }
  });
  const registeredEventIds = userRegistrations.map(r => r.eventId);

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
      registeredEventIds={registeredEventIds}
    />
  );
}
