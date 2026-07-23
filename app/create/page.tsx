import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreatePostForm from './CreatePostForm';
import CreateStatusForm from './CreateStatusForm';
import CreateCommunityForm from './CreateCommunityForm';

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
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

  const params = await searchParams;
  const type = params.type || 'post';

  let title = "Create New Post";
  let subtitle = "Share a status, project, or thought with your network.";

  if (type === 'status') {
    title = "Update Status";
    subtitle = "Set a 24-hour status visible on your profile.";
  } else if (type === 'project') {
    title = "Launch Project";
    subtitle = "Showcase your work to the community.";
  } else if (type === 'competition') {
    title = "Host Competition";
    subtitle = "Organize an event for others to participate in.";
  } else if (type === 'community') {
    title = "Start Community";
    subtitle = "Build a space for like-minded people.";
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '2.5rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>{subtitle}</p>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        {type === 'post' && <CreatePostForm currentUser={currentUser} />}
        {type === 'project' && <div style={{textAlign: 'center', padding: '2rem'}}>Project Creation coming soon!</div>}
        {type === 'competition' && <div style={{textAlign: 'center', padding: '2rem'}}>Competition Creation coming soon!</div>}
        {type === 'status' && <CreateStatusForm />}
        {type === 'community' && <CreateCommunityForm />}
      </div>
    </div>
  );
}
