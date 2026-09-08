import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReelFeedClient from '../components/ReelFeedClient';

export default async function FeedPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const fullUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { personalProfile: true }
  });

  if (!fullUser) redirect('/login');

  let userKeywords: string[] = [];
  if (fullUser.personalProfile) {
    const pp = fullUser.personalProfile;
    let skills: string[] = [];
    let interests: string[] = [];
    let hobbies: string[] = [];
    try { if (pp.skills) skills = JSON.parse(pp.skills); } catch(e){}
    try { if (pp.interests) interests = JSON.parse(pp.interests); } catch(e){}
    try { if (pp.hobbies) hobbies = JSON.parse(pp.hobbies); } catch(e){}
    
    userKeywords = [
      pp.mainIdentity,
      ...skills,
      ...interests,
      ...hobbies
    ].filter(Boolean).map(k => String(k).toLowerCase());
  }

  // Fetch only video posts with 9:16 aspect ratio
  const allReels = await prisma.post.findMany({
    where: {
      mediaType: 'video',
      aspectRatio: '9:16',
      mediaUrl: { not: null }
    },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarData: true, accountType: true, personalProfile: true }
      },
      _count: {
        select: { likes: true, comments: true }
      },
      likes: {
        where: { userId } // Check if current user liked it
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Pool to score
  });

  const scoredReels = allReels.map(reel => {
    let score = 0;
    const contentText = (reel.content || '').toLowerCase();
    
    userKeywords.forEach(kw => {
      if (contentText.includes(kw)) score += 3;
    });

    if (reel.author.personalProfile) {
      const up = reel.author.personalProfile as any;
      let uSkills: string[] = [];
      let uInterests: string[] = [];
      let uHobbies: string[] = [];
      try { if (up.skills) uSkills = JSON.parse(up.skills); } catch(e){}
      try { if (up.interests) uInterests = JSON.parse(up.interests); } catch(e){}
      try { if (up.hobbies) uHobbies = JSON.parse(up.hobbies); } catch(e){}

      const authorText = [up.mainIdentity, ...uSkills, ...uInterests, ...uHobbies].join(' ').toLowerCase();
      userKeywords.forEach(kw => {
        if (authorText.includes(kw)) score += 2;
      });
    }

    if (reel.author.accountType === fullUser.accountType) {
      score += 1;
    }
    
    return { reel, score };
  });

  const reels = scoredReels
    .sort((a, b) => b.score - a.score)
    .map(item => item.reel)
    .slice(0, 20);

  return (
    <div suppressHydrationWarning style={{ backgroundColor: '#000000', height: '100dvh', width: '100%', maxWidth: '600px', margin: '0 auto', overflow: 'hidden', position: 'relative' }}>
      <ReelFeedClient reels={reels} currentUserId={userId} />
    </div>
  );
}
