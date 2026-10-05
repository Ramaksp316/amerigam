import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ExploreClient from './ExploreClient';
import AppRightSidebar from '../components/AppRightSidebar';

export const dynamic = 'force-dynamic';

export default async function ExplorePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || '';

  // 1. Fetch current user
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      creatorProfile: true,
      following: true
    }
  });

  if (!currentUser) {
    redirect('/login');
  }

  // 2. Fetch video posts/reels
  const dbReels = await prisma.post.findMany({
    where: {
      OR: [
        { mediaType: 'video' },
        { mediaUrl: { contains: '.mp4' } }
      ]
    },
    include: {
      author: {
        include: {
          personalProfile: true,
          creatorProfile: true
        }
      },
      likes: true,
      comments: true
    },
    orderBy: { createdAt: 'desc' },
    take: 24
  });

  // Curated fallback reels if database has few video posts to fulfill 4x3 grid (12 cards)
  const fallbackReels = [
    {
      id: 'fallback-1',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      mediaType: 'video',
      content: 'Cinematic color grading breakdown for documentary work.',
      category: 'Editing',
      author: { id: 'fb-user-1', name: 'Aarav Mehta', username: 'aarav_cuts', avatarData: null },
      likes: [1, 2, 3, 4, 5]
    },
    {
      id: 'fallback-2',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      mediaType: 'video',
      content: 'Behind the scenes: 3-point lighting setup on budget.',
      category: 'Cinematography',
      author: { id: 'fb-user-2', name: 'Priya Sharma', username: 'priyashoots', avatarData: null },
      likes: [1, 2, 3, 4, 5, 6, 7]
    },
    {
      id: 'fallback-3',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      mediaType: 'video',
      content: 'Building a SaaS landing page in 48 hours using Next.js.',
      category: 'Tech',
      author: { id: 'fb-user-3', name: 'Vikram Joshi', username: 'vikram_dev', avatarData: null },
      likes: [1, 2, 3, 4]
    },
    {
      id: 'fallback-4',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      mediaType: 'video',
      content: 'How we scaled our consumer brand from 0 to 10k orders.',
      category: 'Business',
      author: { id: 'fb-user-4', name: 'Rhea Sengupta', username: 'rhea_brands', avatarData: null },
      likes: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    {
      id: 'fallback-5',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      mediaType: 'video',
      content: 'Motion graphics typography reel 2026.',
      category: 'Design',
      author: { id: 'fb-user-5', name: 'Kunal Verma', username: 'kunal_motion', avatarData: null },
      likes: [1, 2, 3]
    },
    {
      id: 'fallback-6',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      mediaType: 'video',
      content: 'Audio mixing tips for voiceovers and podcast clarity.',
      category: 'Audio',
      author: { id: 'fb-user-6', name: 'Devika Ray', username: 'devika_sound', avatarData: null },
      likes: [1, 2, 3, 4, 5, 6]
    },
    {
      id: 'fallback-7',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
      mediaType: 'video',
      content: 'Drone shots from the Western Ghats at sunrise.',
      category: 'Travel',
      author: { id: 'fb-user-7', name: 'Aditya Nair', username: 'aditya_nair', avatarData: null },
      likes: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    {
      id: 'fallback-8',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      mediaType: 'video',
      content: 'VFX breakdown: Sci-fi compositor workflow.',
      category: 'VFX',
      author: { id: 'fb-user-8', name: 'Zoya Patel', username: 'zoya_vfx', avatarData: null },
      likes: [1, 2, 3, 4, 5]
    },
    {
      id: 'fallback-9',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      mediaType: 'video',
      content: 'Daily sprint routine: Endurance and speed training.',
      category: 'Athletics',
      author: { id: 'fb-user-9', name: 'Rohan Deshmukh', username: 'rohan_athlete', avatarData: null },
      likes: [1, 2, 3, 4, 5, 6, 7]
    },
    {
      id: 'fallback-10',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      mediaType: 'video',
      content: 'Top 5 mistakes in product discovery interviews.',
      category: 'Product',
      author: { id: 'fb-user-10', name: 'Ananya Gupta', username: 'ananya_builds', avatarData: null },
      likes: [1, 2, 3, 4]
    },
    {
      id: 'fallback-11',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      mediaType: 'video',
      content: 'Storyboarding your first short film without fancy gear.',
      category: 'Film',
      author: { id: 'fb-user-11', name: 'Manish Rawat', username: 'manish_cinema', avatarData: null },
      likes: [1, 2, 3, 4, 5, 6]
    },
    {
      id: 'fallback-12',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      mediaType: 'video',
      content: 'Fast UI prototyping tips in Figma to code.',
      category: 'Design',
      author: { id: 'fb-user-12', name: 'Tanvi Shah', username: 'tanvi_ui', avatarData: null },
      likes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
  ];

  // Combine real DB reels with curated fallbacks up to at least 12
  const combinedReels = [...dbReels, ...fallbackReels.filter(f => !dbReels.some(r => r.id === f.id))].slice(0, 24);

  // 3. Search query resolution
  let searchUsers: any[] = [];
  let searchBusinesses: any[] = [];
  let searchCompetitions: any[] = [];
  let searchReels: any[] = [];

  if (query.length > 0) {
    const [foundUsers, foundComps, foundReels] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } }
          ],
          id: { not: userId }
        },
        include: {
          personalProfile: true,
          creatorProfile: true,
          businessProfile: true,
          followers: { select: { followerId: true } }
        },
        take: 30
      }),
      prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          creator: { select: { id: true, name: true, avatarData: true } },
          _count: { select: { registrations: true } }
        },
        take: 6
      }),
      prisma.post.findMany({
        where: {
          AND: [
            {
              OR: [
                { mediaType: 'video' },
                { mediaUrl: { contains: '.mp4' } }
              ]
            },
            {
              OR: [
                { content: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: {
          author: {
            include: {
              personalProfile: true,
              creatorProfile: true
            }
          },
          likes: true
        },
        take: 12
      })
    ]);

    // Separate businesses vs individual creators/people
    searchBusinesses = foundUsers.filter((u) => u.accountType === 'BUSINESS' || u.businessProfile != null);
    searchUsers = foundUsers.filter((u) => u.accountType !== 'BUSINESS' && u.businessProfile == null);
    searchCompetitions = foundComps;
    searchReels = foundReels.length > 0 ? foundReels : combinedReels.filter(r => 
      r.content?.toLowerCase().includes(query.toLowerCase()) || 
      r.category?.toLowerCase().includes(query.toLowerCase())
    );
  }

  return (
    <div
      className="explore-page-container"
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* Center Main Content Area matching Image 2 Blueprint */}
      <div
        className="explore-center-column"
        style={{
          flex: 1,
          maxWidth: '920px',
          width: '100%',
          padding: '0 24px 80px 24px',
          boxSizing: 'border-box'
        }}
      >
        <ExploreClient
          initialReels={combinedReels}
          currentUser={currentUser}
          searchUsers={searchUsers}
          searchBusinesses={searchBusinesses}
          searchCompetitions={searchCompetitions}
          searchReels={searchReels}
          initialQuery={query}
        />
      </div>

      {/* Right Sidebar: Profile Rank Card & Active Friends (Exact Reference Match) */}
      <AppRightSidebar userId={userId} mode="network" />
    </div>
  );
}
