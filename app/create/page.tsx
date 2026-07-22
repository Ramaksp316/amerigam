import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreatePostForm from './CreatePostForm';

export default async function CreatePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!currentUser) redirect('/login');
  if (!currentUser.onboarded) redirect('/onboarding');

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '2.5rem' }}>Create New Post</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Share a status, project, or thought with your network.</p>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <CreatePostForm currentUser={currentUser} />
      </div>
    </div>
  );
}
