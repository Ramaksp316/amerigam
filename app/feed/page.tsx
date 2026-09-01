import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ReelFeedClient from '../components/ReelFeedClient';

export default async function FeedPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!currentUser) redirect('/login');

  // Fetch only video posts with 9:16 aspect ratio
  const reels = await prisma.post.findMany({
    where: {
      mediaType: 'video',
      aspectRatio: '9:16',
      mediaUrl: { not: null }
    },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarData: true, accountType: true }
      },
      _count: {
        select: { likes: true, comments: true }
      },
      likes: {
        where: { userId } // Check if current user liked it
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return (
    <div suppressHydrationWarning style={{ backgroundColor: '#000000', height: '100dvh', width: '100%', maxWidth: '600px', margin: '0 auto', overflow: 'hidden', position: 'relative' }}>
      <ReelFeedClient reels={reels} currentUserId={userId} />
    </div>
  );
}
