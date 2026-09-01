import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ViewAllPageClient from '../ViewAllPageClient';

const suggestedMapping: Record<string, string[]> = {
  'Coding': ['Technology', 'Programming', 'Hackathon'],
  'Software Developer': ['Technology', 'Programming', 'Hackathon'],
  'React Developer': ['Technology', 'Programming'],
  'Designer': ['Art/Design', 'Creative'],
  'Illustrator': ['Art/Design', 'Creative'],
  'Photography': ['Art/Design', 'Photography'],
  'Music': ['Music', 'Entertainment'],
  'Dance': ['Dance', 'Entertainment'],
  'Writing': ['Literature', 'Writing'],
  'Business': ['Business', 'Entrepreneurship'],
  'Gaming': ['Gaming', 'Esports'],
  'Fitness': ['Sports', 'Fitness'],
  'Sports': ['Sports', 'Fitness'],
  'Science': ['Science', 'Education'],
  'Student': ['Education', 'Campus']
};

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

  let targetCategories: string[] = [];
  if (user.personalProfile) {
    const pp = user.personalProfile;
    const traits = [
      ...(pp.skills || []),
      ...(pp.interests || []),
      ...(pp.hobbies || []),
      pp.mainIdentity || ''
    ];
    for (const t of traits) {
      if (!t) continue;
      for (const key in suggestedMapping) {
        if (t.toLowerCase().includes(key.toLowerCase())) {
          targetCategories.push(...suggestedMapping[key]);
        }
      }
    }
  }
  
  targetCategories = [...new Set(targetCategories)];

  let suggestedEvents: any[] = [];
  if (targetCategories.length > 0) {
    suggestedEvents = await prisma.event.findMany({
      where: { category: { in: targetCategories } },
      include: {
        creator: { select: { name: true, avatarData: true } },
        _count: { select: { registrations: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  // Fallback to top events if very few suggested found
  if (suggestedEvents.length < 5) {
      const topFallback = await prisma.event.findMany({
          take: 20,
          include: {
            creator: { select: { name: true, avatarData: true } },
            _count: { select: { registrations: true } }
          },
          orderBy: { createdAt: 'desc' }
      });
      
      const existingIds = suggestedEvents.map(e => e.id);
      for (const e of topFallback) {
          if (!existingIds.includes(e.id)) {
              suggestedEvents.push(e);
          }
      }
  }

  return (
    <ViewAllPageClient 
      title="Suggested For You" 
      events={suggestedEvents} 
      registeredEventIds={registeredEventIds} 
    />
  );
}
