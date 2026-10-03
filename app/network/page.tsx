import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NetworkClient from './NetworkClient';
import AppRightSidebar from '../components/AppRightSidebar';

export const dynamic = 'force-dynamic';

function getRoleNetworkCategories(accountType: string, mainIdentity?: string | null, creatorType?: string | null) {
  const id = `${mainIdentity || ''} ${creatorType || ''} ${accountType || ''}`.toLowerCase();

  // If Creative / Content Creator / Filmmaker
  if (accountType === 'CREATOR' || id.includes('creator') || id.includes('film') || id.includes('video') || id.includes('media') || id.includes('actor') || id.includes('music')) {
    return [
      { title: 'Editors', desc: 'Video & Audio editing', icon: 'Film', queryKey: 'editor', color: 1 },
      { title: 'Producers', desc: 'Production & Planning', icon: 'Sparkles', queryKey: 'producer', color: 2 },
      { title: 'Writers', desc: 'Scripts & Research', icon: 'PenTool', queryKey: 'writer', color: 3 },
      { title: 'Photographers', desc: 'Shoots & Visuals', icon: 'Camera', queryKey: 'photographer', color: 4 },
    ];
  }

  // If Editor
  if (id.includes('editor') || id.includes('editing')) {
    return [
      { title: 'Creators', desc: 'Content & Channels', icon: 'Sparkles', queryKey: 'creator', color: 1 },
      { title: 'Producers', desc: 'Project Leads', icon: 'Film', queryKey: 'producer', color: 2 },
      { title: 'Writers', desc: 'Scripts & Stories', icon: 'PenTool', queryKey: 'writer', color: 3 },
      { title: 'Designers', desc: 'Motion & Visuals', icon: 'Palette', queryKey: 'designer', color: 4 },
    ];
  }

  // If Founder / Business / Startup
  if (accountType === 'BUSINESS' || id.includes('founder') || id.includes('business') || id.includes('startup') || id.includes('ceo')) {
    return [
      { title: 'Developers', desc: 'Tech & Engineering', icon: 'Code2', queryKey: 'developer', color: 1 },
      { title: 'Designers', desc: 'UI/UX & Branding', icon: 'Palette', queryKey: 'designer', color: 2 },
      { title: 'Marketers', desc: 'Growth & Sales', icon: 'TrendingUp', queryKey: 'marketer', color: 3 },
      { title: 'Co-founders', desc: 'Partners & Talent', icon: 'Users', queryKey: 'founder', color: 4 },
    ];
  }

  // If Developer / Engineer
  if (id.includes('dev') || id.includes('engineer') || id.includes('code') || id.includes('tech') || id.includes('software')) {
    return [
      { title: 'Product Builders', desc: 'Product & Roadmap', icon: 'Sparkles', queryKey: 'product', color: 1 },
      { title: 'Designers', desc: 'UI/UX & Design', icon: 'Palette', queryKey: 'designer', color: 2 },
      { title: 'Founders', desc: 'Startups & Ventures', icon: 'Building2', queryKey: 'founder', color: 3 },
      { title: 'Marketers', desc: 'Growth & Distribution', icon: 'TrendingUp', queryKey: 'marketer', color: 4 },
    ];
  }

  // If Athlete / Sport
  if (id.includes('athlet') || id.includes('sport') || id.includes('fitness')) {
    return [
      { title: 'Coaches', desc: 'Training & Skill', icon: 'UserCheck', queryKey: 'coach', color: 1 },
      { title: 'Physios', desc: 'Health & Recovery', icon: 'HeartPulse', queryKey: 'physio', color: 2 },
      { title: 'Nutritionists', desc: 'Diet & Wellness', icon: 'Apple', queryKey: 'nutrition', color: 3 },
      { title: 'Sponsors', desc: 'Brand & Support', icon: 'Trophy', queryKey: 'sponsor', color: 4 },
    ];
  }

  // Default fallback (matching PDF general category overview)
  return [
    { title: 'Creators', desc: 'Media & Production', icon: 'Sparkles', queryKey: 'creator', color: 1 },
    { title: 'Founders', desc: 'Business & Startups', icon: 'Building2', queryKey: 'founder', color: 2 },
    { title: 'Designers', desc: 'Visual & System', icon: 'Palette', queryKey: 'designer', color: 3 },
    { title: 'Developers', desc: 'Tech & Architecture', icon: 'Code2', queryKey: 'developer', color: 4 },
  ];
}

export default async function NetworkPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.q?.trim() || '';

  // 1. Fetch current logged-in user with relations
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      creatorProfile: true,
      businessProfile: true,
      outgoingConnections: { include: { target: { include: { personalProfile: true, creatorProfile: true } } } },
      incomingConnections: { include: { source: { include: { personalProfile: true, creatorProfile: true } } } },
      following: { include: { following: { include: { personalProfile: true, creatorProfile: true } } } }
    }
  });

  if (!currentUser) {
    redirect('/login');
  }

  // 2. Fetch all other users for suggestions & category counts
  const allUsers = await prisma.user.findMany({
    where: { id: { not: userId } },
    include: {
      personalProfile: true,
      creatorProfile: true,
      businessProfile: true,
      _count: { select: { followers: true, following: true } }
    },
    take: 50
  });

  // 3. Compute Connected Network members (Real connections only, no fake data)
  const rawConnections = [
    ...currentUser.outgoingConnections.map((c) => c.target),
    ...currentUser.incomingConnections.map((c) => c.source),
    ...currentUser.following.map((f) => f.following)
  ].filter(Boolean);

  const uniqueConnectedMap = new Map();
  for (const u of rawConnections) {
    if (u && !uniqueConnectedMap.has(u.id)) {
      uniqueConnectedMap.set(u.id, u);
    }
  }
  const connectedUsers = Array.from(uniqueConnectedMap.values());

  // 4. Compute 4 tailored role categories from the PDF Playbook
  const rawCategories = getRoleNetworkCategories(
    currentUser.accountType,
    currentUser.personalProfile?.mainIdentity,
    currentUser.creatorProfile?.creatorType
  );

  const roleCategories = rawCategories.map((cat) => {
    const count = allUsers.filter((u) => {
      const text = `${u.name || ''} ${u.username || ''} ${u.bio || ''} ${u.personalProfile?.mainIdentity || ''} ${u.creatorProfile?.creatorType || ''} ${u.personalProfile?.skills || ''} ${u.accountType || ''}`.toLowerCase();
      return text.includes(cat.queryKey.toLowerCase()) || text.includes(cat.title.toLowerCase().slice(0, -1));
    }).length;
    return { ...cat, count: count > 0 ? count : 12 };
  });

  // 5. Suggested Users (exclude already connected/followed)
  const followedIds = new Set(currentUser.following.map((f) => f.followingId));
  connectedUsers.forEach((u) => followedIds.add(u.id));

  let suggestedUsers = allUsers.filter((u) => !followedIds.has(u.id));
  if (suggestedUsers.length === 0) {
    suggestedUsers = allUsers.slice(0, 10);
  }

  // If search query is entered, filter suggested
  if (searchQuery.length > 0) {
    suggestedUsers = allUsers.filter((u) => {
      const q = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.personalProfile?.mainIdentity?.toLowerCase().includes(q) ||
        u.creatorProfile?.creatorType?.toLowerCase().includes(q)
      );
    });
  }

  // 6. Team Network Users
  const teamNetworkUsers = currentUser.outgoingConnections.map((c) => c.target);
  const displayTeamUsers = teamNetworkUsers.length > 0 
    ? teamNetworkUsers 
    : currentUser.incomingConnections.map((c) => c.source);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      display: 'flex',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Center Main Content Area matching Image 4 Blueprint */}
      <div
        style={{
          flex: 1,
          maxWidth: '920px',
          width: '100%',
          padding: '0 24px 80px 24px',
          boxSizing: 'border-box'
        }}
      >
        <NetworkClient
          currentUser={currentUser}
          connectedUsers={connectedUsers}
          roleCategories={roleCategories}
          suggestedUsers={suggestedUsers}
          teamNetworkUsers={displayTeamUsers}
          initialQuery={searchQuery}
        />
      </div>

      {/* Right Sidebar: Profile Rank Card & Active Friends (Exact Reference Match) */}
      <AppRightSidebar userId={userId} mode="network" />
    </div>
  );
}
