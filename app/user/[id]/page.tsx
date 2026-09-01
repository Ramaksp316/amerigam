import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import UserProfileClient from './UserProfileClient';
import { getUserAllRanks } from '../../../lib/ranking-service';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { title: 'User not found' };

  const title = `${user.name || user.username} on Amerigam`;
  const description = user.bio || `Check out ${user.name}'s profile on Amerigam`;
  return {
    title, description,
    openGraph: { title, description, url: `/user/${user.id}`, images: user.avatarData ? [user.avatarData] : [], type: 'profile' },
    twitter: { card: 'summary', title, description, images: user.avatarData ? [user.avatarData] : [] }
  };
}

export default async function UserProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;
  const { id: targetUserId } = await params;
  const { tab } = await searchParams;
  const activeTab = tab || 'posts';

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      followers: true,
      following: true,
      posts: {
        include: { likes: true, comments: { include: { author: true } } },
        orderBy: { createdAt: 'desc' }
      },
      eventRegistrations: { include: { event: true } },
      achievements: true,
      personalProfile: true,
      outgoingConnections: { include: { target: true } },
      incomingConnections: { include: { source: true } }
    }
  });

  if (!user) notFound();

  const isOwner = currentUserId === targetUserId;
  const isVerified = user.accountType !== 'PERSONAL' || user.followers.length > 100;

  // Identity line
  let identityLine = '';
  if (user.personalProfile?.mainIdentity) {
    identityLine = user.personalProfile.mainIdentity;
  } else if (user.accountType === 'BUSINESS') {
    identityLine = 'Business';
  } else if (user.accountType === 'CREATOR') {
    identityLine = 'Creator';
  } else if (user.accountType === 'INFLUENCER') {
    identityLine = 'Influencer';
  } else if (user.accountType === 'ORGANIZATION') {
    identityLine = 'Organization';
  }

  // Parse JSON traits — distinguish skills vs interests vs hobbies
  let skills: string[] = [];
  let interests: string[] = [];
  let hobbies: string[] = [];
  try { skills = user.personalProfile?.skills ? JSON.parse(user.personalProfile.skills) : []; } catch {}
  try { interests = user.personalProfile?.interests ? JSON.parse(user.personalProfile.interests) : []; } catch {}
  try { hobbies = user.personalProfile?.hobbies ? JSON.parse(user.personalProfile.hobbies) : []; } catch {}

  // Geographic ranking — only for PERSONAL accounts, uses efficient single-query approach
  let rankData: { city?: number | null; state?: number | null; national?: number | null; intl?: number | null } = {};
  if (user.accountType === 'PERSONAL') {
    try {
      const allRanks = await getUserAllRanks(targetUserId);
      rankData = {
        city: allRanks.city ?? allRanks.district ?? null,
        state: allRanks.state ?? null,
        national: allRanks.national ?? null,
        intl: allRanks.international ?? null,
      };
    } catch {}
  }

  return (
    <UserProfileClient
      user={user}
      currentUserId={currentUserId}
      targetUserId={targetUserId}
      isOwner={isOwner}
      isVerified={isVerified}
      identityLine={identityLine}
      skills={skills}
      interests={interests}
      hobbies={hobbies}
      rankData={rankData}
      activeTab={activeTab}
    />
  );
}
