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
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '1.8rem' }}>Create New Post</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Share a status, project, or thought with your network.</p>
      </div>

      <div className="card">
        <CreatePostForm currentUser={currentUser} />
      </div>
    </div>
  );
}
