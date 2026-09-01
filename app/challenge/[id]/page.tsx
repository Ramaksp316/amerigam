import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ChallengeDetailClient from './ChallengeDetailClient';

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;

  if (!currentUserId) {
    redirect('/login');
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      challenger: { select: { id: true, name: true, username: true, avatarData: true } },
      challenged: { select: { id: true, name: true, username: true, avatarData: true } }
    }
  });

  if (!challenge) {
    notFound();
  }

  // Only participants can view detail (for beta)
  if (challenge.challengerId !== currentUserId && challenge.challengedId !== currentUserId) {
    redirect('/network');
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-primary)', paddingBottom: '80px' }}>
      <ChallengeDetailClient challenge={challenge} currentUserId={currentUserId} />
    </div>
  );
}
