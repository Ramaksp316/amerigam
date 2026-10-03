import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CommunitiesClient, { CommunityItem } from './CommunitiesClient';
import AppRightSidebar from '../components/AppRightSidebar';

export const dynamic = 'force-dynamic';

export default async function CommunitiesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  // 1. Fetch user with profiles for field & hobby personalization
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      creatorProfile: true
    }
  });

  if (!user) redirect('/login');

  // 2. Fetch all user's joined communities
  const joinedMemberships = await prisma.communityMember.findMany({
    where: { userId },
    include: {
      community: {
        include: {
          _count: { select: { members: true } }
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  });

  const joinedCommunityIds = new Set(joinedMemberships.map(m => m.communityId));

  const mineCommunities: CommunityItem[] = joinedMemberships.map(m => ({
    id: m.community.id,
    name: m.community.name,
    category: m.community.category,
    description: m.community.description,
    avatarData: m.community.avatarData,
    memberCount: m.community._count.members,
    isJoined: true
  }));

  // 3. Fetch all public communities
  const allRawCommunities = await prisma.community.findMany({
    include: {
      _count: { select: { members: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const allCommunities: CommunityItem[] = allRawCommunities.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    description: c.description,
    avatarData: c.avatarData,
    memberCount: c._count.members,
    isJoined: joinedCommunityIds.has(c.id)
  }));

  // 4. Personalized Scoring for Top Communities matching user's field and hobbies
  const userKeywords: string[] = [
    user.mainIdentity,
    user.accountType,
    user.personalProfile?.hobby,
    ...(user.personalProfile?.interests || []),
    user.creatorProfile?.creatorType,
    user.creatorProfile?.category
  ]
    .filter(Boolean)
    .map(k => String(k).toLowerCase());

  // Priority curation names for the 8 top spots
  const priorityTopNames = [
    'Welcome Gamers',
    'Racers',
    'Athletes',
    'Chill Word',
    'Chill World',
    'Creative Arts',
    'Entrepreneurs',
    'Tech & AI',
    'Music & Beats'
  ].map(n => n.toLowerCase());

  const scoredCommunities = [...allCommunities].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    const catA = (a.category || '').toLowerCase();
    const catB = (b.category || '').toLowerCase();

    // Check user field/hobby match
    for (const kw of userKeywords) {
      if (nameA.includes(kw) || catA.includes(kw)) scoreA += 15;
      if (nameB.includes(kw) || catB.includes(kw)) scoreB += 15;
    }

    // Check priority top names
    if (priorityTopNames.some(pn => nameA.includes(pn))) scoreA += 10;
    if (priorityTopNames.some(pn => nameB.includes(pn))) scoreB += 10;

    // Member count boost
    scoreA += Math.min(a.memberCount, 10);
    scoreB += Math.min(b.memberCount, 10);

    return scoreB - scoreA;
  });

  const topCommunities = scoredCommunities.slice(0, 8);
  const topCommunityIds = new Set(topCommunities.map(c => c.id));

  // 5. Suggested Communities (Curated 4 cards not in top)
  const suggestedCandidates = allCommunities.filter(c => !topCommunityIds.has(c.id));
  
  // Specific preferred suggested names from Figma
  const preferredSuggestedNames = [
    'Nature Explorers',
    'Indie Developers',
    'Book Enthusiasts',
    'Film & Media',
    'Digital Art',
    'UI Inspiration',
    'Photography Lovers'
  ].map(n => n.toLowerCase());

  const sortedSuggested = [...suggestedCandidates].sort((a, b) => {
    const aIsPreferred = preferredSuggestedNames.some(pn => a.name.toLowerCase().includes(pn)) ? 1 : 0;
    const bIsPreferred = preferredSuggestedNames.some(pn => b.name.toLowerCase().includes(pn)) ? 1 : 0;
    return bIsPreferred - aIsPreferred;
  });

  const suggestedCommunities = sortedSuggested.slice(0, 4);

  return (
    <div
      className="community-page-container"
      style={{
        width: '100%',
        height: '100vh',
        maxHeight: '100vh',
        backgroundColor: '#0A0A0A',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'flex-start',
        overflow: 'hidden'
      }}
    >
      <div style={{
        width: '100%',
        height: '100vh',
        minWidth: 0,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Center Main Content Area (Only this area scrolls) */}
        <div style={{
          flex: 1,
          height: '100vh',
          minWidth: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <CommunitiesClient
            userId={userId}
            userAvatar={user.avatarData}
            userName={user.name}
            mineCommunities={mineCommunities}
            topCommunities={topCommunities}
            suggestedCommunities={suggestedCommunities}
            allCommunities={allCommunities}
          />
        </div>

        {/* Right Sidebar (Stationary Server Component, does not scroll with center) */}
        <AppRightSidebar userId={userId} mode="communities" />
      </div>
    </div>
  );
}
