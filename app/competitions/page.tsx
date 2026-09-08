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

  // Get User Keywords for Personalization
  let userKeywords: string[] = [];
  if (currentUser?.personalProfile) {
    const pProfile = currentUser.personalProfile;
    let skills: string[] = [];
    let interests: string[] = [];
    let hobbies: string[] = [];
    try { if (pProfile.skills) skills = JSON.parse(pProfile.skills); } catch(e){}
    try { if (pProfile.interests) interests = JSON.parse(pProfile.interests); } catch(e){}
    try { if (pProfile.hobbies) hobbies = JSON.parse(pProfile.hobbies); } catch(e){}
    
    userKeywords = [
      pProfile.mainIdentity,
      ...skills,
      ...interests,
      ...hobbies
    ].filter(Boolean).map(k => String(k).toLowerCase());
  }

  // Fetch all published events not created by following (since following is shown above)
  const availableEvents = await prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { creatorId: { in: followingIds } }
    },
    include: {
      creator: {
        select: { id: true, name: true, avatarData: true, accountType: true }
      },
      _count: {
        select: { registrations: true }
      }
    }
  });

  // Score events for Suggestions and Top
  const scoredEvents = availableEvents.map(event => {
    let score = 0;
    const matchText = [
      event.name,
      event.description,
      event.category,
      event.creator.name
    ].join(' ').toLowerCase();

    userKeywords.forEach(kw => {
      if (matchText.includes(kw)) score += 3;
    });

    if (event.creator.accountType === currentUser?.accountType) {
      score += 1;
    }

    // Popularity modifier
    const popularity = (event._count.registrations || 0) + (event.participantLimit ? event.participantLimit / 100 : 0);
    
    return { event, score, popularity };
  });

  // Suggested Events: Prioritize personalization score
  const suggestedEvents = [...scoredEvents]
    .sort((a, b) => b.score - a.score || b.popularity - a.popularity)
    .map(item => item.event)
    .slice(0, 10);

  // Top Events: Prioritize popularity, but boost with personalization score
  const topEvents = [...scoredEvents]
    .sort((a, b) => (b.popularity + b.score * 10) - (a.popularity + a.score * 10))
    .map(item => item.event)
    .slice(0, 15);

  // Fetch Current User's registrations to pass state down
  const userRegistrations = await prisma.eventRegistration.findMany({
    where: { userId }
  });
  const registeredEventIds = userRegistrations.map(r => r.eventId);

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
