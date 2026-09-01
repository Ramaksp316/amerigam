import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ChallengeCreateClient from './ChallengeCreateClient';

export default async function ChallengeCreatePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: targetUserId } = await params;
  
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;

  if (!currentUserId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { id: true, accountType: true }
  });

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, username: true, avatarData: true, accountType: true }
  });

  if (!targetUser || !currentUser) {
    notFound();
  }

  if (currentUser.accountType !== 'PERSONAL' || targetUser.accountType !== 'PERSONAL' || currentUser.id === targetUser.id) {
    redirect('/network'); // Redirect if invalid
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-primary)', paddingBottom: '80px' }}>
      <ChallengeCreateClient targetUser={targetUser} />
    </div>
  );
}
