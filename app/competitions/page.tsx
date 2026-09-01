import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CompetitionsClient from './CompetitionsClient';

export default async function CompetitionsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.q || '';
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  // Get current user details and follows
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      following: true,
      personalProfile: true
    }
  });

  const followingIds = currentUser?.following.map(f => f.followingId) || [];

  // Fetch Search Results if querying
  let searchResults: any[] = [];
  if (searchQuery.trim() !== '') {
    searchResults = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        name: {
          contains: searchQuery,
          mode: 'insensitive'
        }
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
      take: 20
    });
  }

  // Fetch Following Events
  const followingEvents = await prisma.event.findMany({
    where: {
      creatorId: { in: followingIds },
      status: 'PUBLISHED'
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
    'Public Speaker': ['SpeakUp Championship'],
    'Illustrator': ['ArtSphere Collective', 'DesignSprint League']
  };

  const userIdentity = currentUser?.personalProfile?.mainIdentity || '';
  let relevantOrgNames = suggestedMapping[userIdentity] || [];

  const suggestedEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { creatorId: { in: followingIds } },
      ...(relevantOrgNames.length > 0 ? {
        creator: {
          name: { in: relevantOrgNames }
        }
      } : {
        // Fallback for better general discovery based on account type
        creator: {
          accountType: currentUser?.accountType
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
    where: { status: 'PUBLISHED' },
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

  const { getLeaderboard } = await import('@/lib/ranking-service');
  
  const userCountry = currentUser?.country || undefined;
  const userState = currentUser?.state || undefined;
  const userCity = currentUser?.city || currentUser?.district || undefined;

  const [intlTop, natTop, stateTop, distTop] = await Promise.all([
    getLeaderboard('INTERNATIONAL', undefined, 10),
    getLeaderboard('NATIONAL', userCountry, 10),
    getLeaderboard('STATE', userState, 10),
    getLeaderboard('DISTRICT', userCity, 10),
  ]);

  const rankingData = {
    International: intlTop,
    National: natTop,
    State: stateTop,
    District: distTop
  };

  return (
    <CompetitionsClient 
      followingEvents={followingEvents}
      suggestedEvents={suggestedEvents}
      topEvents={topEvents}
      searchResults={searchResults}
      initialSearchQuery={searchQuery}
      rankingData={rankingData}
      currentUser={currentUser}
      registeredEventIds={registeredEventIds}
    />
  );
}
