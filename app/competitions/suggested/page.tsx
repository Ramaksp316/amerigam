import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ViewAllPageClient from '../ViewAllPageClient';

export default async function SuggestedCompetitionsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      eventRegistrations: { select: { eventId: true } }
    }
  });

  if (!user) redirect('/login');

  const registeredEventIds = user.eventRegistrations.map((r: any) => r.eventId);

  let userKeywords: string[] = [];
  if (user.personalProfile) {
    const pp = user.personalProfile;
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

  const allEvents = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      creator: { select: { name: true, avatarData: true, accountType: true } },
      _count: { select: { registrations: true } }
    }
  });

  const scoredEvents = allEvents.map(event => {
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

    if (event.creator.accountType === user.accountType) {
      score += 1;
    }

    const popularity = (event._count.registrations || 0) + (event.participantLimit ? event.participantLimit / 100 : 0);
    return { event, score, popularity };
  });

  let suggestedEvents = [...scoredEvents]
    .sort((a, b) => b.score - a.score || b.popularity - a.popularity)
    .map(item => item.event)
    .slice(0, 30);

  return (
    <ViewAllPageClient 
      title="Suggested For You" 
      events={suggestedEvents} 
      registeredEventIds={registeredEventIds} 
    />
  );
}
