import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreatePostForm from './CreatePostForm';
import CreateEventForm from './CreateEventForm';
import CreateCommunityForm from './CreateCommunityForm';

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ type?: string, communityId?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      businessProfile: true,
      creatorProfile: true,
    }
  });

  if (!currentUser) redirect('/login');

  const params = await searchParams;
  const type = params.type || 'post';
  const communityId = params.communityId;

  if (type === 'competition' && currentUser.accountType !== 'ORGANIZATION') {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: 'var(--space-8)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '2rem' }}>Unauthorized</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Only Competition Organizations can create competitions.</p>
      </div>
    );
  }

  const isPostFlow = type === 'post' || type === 'status' || type === 'project' || type === 'story' || type === 'reel' || type === 'blog';

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#000000' }}>
      {isPostFlow ? (
        <CreatePostForm currentUser={currentUser} isReel={type === 'reel'} isStory={type === 'story'} communityId={communityId} />
      ) : (
        <div className="glass-card" style={{ maxWidth: '680px', margin: '40px auto', padding: 'var(--space-6)', minHeight: '80vh' }}>
          {type === 'competition' && (
             <>
               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px' }}>
                  <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Host Competition</h1>
               </div>
               <CreateEventForm />
             </>
          )}
          {type === 'community' && <CreateCommunityForm />}
        </div>
      )}
    </div>
  );
}
