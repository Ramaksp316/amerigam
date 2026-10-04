import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CompetitionsClient from './CompetitionsClient';
import AppRightSidebar from '../components/AppRightSidebar';

export const dynamic = 'force-dynamic';

const FALLBACK_POSTERS = [
  '/images/competitions/poster_comp_1.png',
  '/images/competitions/poster_comp_2.png',
  '/images/competitions/poster_comp_3.png',
  '/images/competitions/poster_comp_4.png',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80'
];

export interface CompetitionCardData {
  id: string;
  title: string;
  date: string;
  location: string;
  prize: string;
  prizeLabel: string;
  poster: string;
  category?: string | null;
}

function formatEventToCard(e: any, index: number): CompetitionCardData {
  const startDate = e.startDate ? new Date(e.startDate) : new Date();
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(' ', '');

  const locationStr = (e.city || (e.venue ? e.venue.split(',')[0] : 'ONLINE') || 'SURAT').toUpperCase();
  const rawPrize = e.prizePool ? e.prizePool.split('\n')[0].replace('Prize Pool:', '').trim() : '';
  const prizeStr = rawPrize || (e.entryFee && e.entryFee > 0 ? `AP ${e.entryFee * 3}-$${e.entryFee}` : 'AP 150-$50');
  const poster = e.coverImage || FALLBACK_POSTERS[index % FALLBACK_POSTERS.length];

  return {
    id: e.id,
    title: e.name || 'Competition',
    date: `${formattedDate} ${formattedTime}`,
    location: locationStr,
    prize: prizeStr,
    prizeLabel: '/winner price',
    poster,
    category: e.category
  };
}

export default async function CompetitionsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  // 1. Fetch current user with personal and creator profiles
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      creatorProfile: true
    }
  });

  if (!currentUser) {
    redirect('/login');
  }

  // 2. Extract Profession Keywords for "Competition for you"
  const userProfessionKeywords: string[] = [
    currentUser.mainIdentity,
    currentUser.accountType,
    currentUser.creatorProfile?.creatorType,
    currentUser.creatorProfile?.category,
    currentUser.personalProfile?.profession
  ]
    .filter(Boolean)
    .map(k => String(k).toLowerCase());

  // 3. Extract Hobby Keywords for "Other Competition"
  let userHobbyKeywords: string[] = [];
  if (currentUser.personalProfile) {
    const pProfile = currentUser.personalProfile;
    let skills: string[] = [];
    let interests: string[] = [];
    let hobbies: string[] = [];
    try { if (pProfile.skills) skills = JSON.parse(pProfile.skills); } catch(e){}
    try { if (pProfile.interests) interests = JSON.parse(pProfile.interests); } catch(e){}
    try { if (pProfile.hobbies) hobbies = JSON.parse(pProfile.hobbies); } catch(e){}

    userHobbyKeywords = [
      pProfile.hobby,
      ...skills,
      ...interests,
      ...hobbies
    ]
      .filter(Boolean)
      .map(k => String(k).toLowerCase());
  }

  // 4. Fetch all published events from database
  const allPublishedEvents = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      creator: {
        select: { id: true, name: true, avatarData: true }
      },
      _count: {
        select: { registrations: true }
      }
    },
    orderBy: { startDate: 'desc' }
  });

  const flagshipNames = ['Behind You - Running RR', 'Tried-Jump', 'WAR-E-Man', 'Trocfy'];

  // 5. Sort "Competition for you" matching user's profession
  const scoredForYou = [...allPublishedEvents].sort((a, b) => {
    const aText = `${a.name} ${a.description || ''} ${a.category || ''}`.toLowerCase();
    const bText = `${b.name} ${b.description || ''} ${b.category || ''}`.toLowerCase();

    let scoreA = 0;
    let scoreB = 0;

    // Prioritize flagship events
    if (flagshipNames.some(fn => a.name.toLowerCase().includes(fn.toLowerCase()))) scoreA += 50;
    if (flagshipNames.some(fn => b.name.toLowerCase().includes(fn.toLowerCase()))) scoreB += 50;

    // Match with user profession
    userProfessionKeywords.forEach(kw => {
      if (aText.includes(kw)) scoreA += 15;
      if (bText.includes(kw)) scoreB += 15;
    });

    scoreA += (a._count.registrations || 0);
    scoreB += (b._count.registrations || 0);

    return scoreB - scoreA;
  });

  // Top 8 events for "Competition for you"
  const forYouList = scoredForYou.slice(0, 12);
  const forYouIds = new Set(forYouList.map(e => e.id));

  // 6. Sort "Other Competition" matching user's hobbies & interests
  const otherCandidates = allPublishedEvents.filter(e => !forYouIds.has(e.id));
  const scoredOther = [...otherCandidates].sort((a, b) => {
    const aText = `${a.name} ${a.description || ''} ${a.category || ''}`.toLowerCase();
    const bText = `${b.name} ${b.description || ''} ${b.category || ''}`.toLowerCase();

    let scoreA = 0;
    let scoreB = 0;

    // Match with user hobbies
    userHobbyKeywords.forEach(kw => {
      if (aText.includes(kw)) scoreA += 15;
      if (bText.includes(kw)) scoreB += 15;
    });

    scoreA += (a._count.registrations || 0);
    scoreB += (b._count.registrations || 0);

    return scoreB - scoreA;
  });

  // Format cards
  const formattedForYou = forYouList.map((e, idx) => formatEventToCard(e, idx));
  const formattedOther = scoredOther.map((e, idx) => formatEventToCard(e, idx + forYouList.length));
  const formattedAll = allPublishedEvents.map((e, idx) => formatEventToCard(e, idx));

  return (
    <div
      className="competitions-page-container"
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
        {/* Center Main Content Area (Only this area scrolls independently) */}
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
          <CompetitionsClient
            forYouCompetitions={formattedForYou}
            otherCompetitions={formattedOther}
            allCompetitions={formattedAll}
            userId={userId}
          />
        </div>

        {/* Right Sidebar (Stationary Server Component, does not scroll with center) */}
        <AppRightSidebar userId={userId} mode="competitions" />
      </div>
    </div>
  );
}
