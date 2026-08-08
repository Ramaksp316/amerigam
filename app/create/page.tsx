import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreatePostForm from './CreatePostForm';
import CreateStatusForm from './CreateStatusForm';
import CreateCommunityForm from './CreateCommunityForm';
import CreateEventForm from './CreateEventForm';
import Link from 'next/link';
import { GitBranch, ArrowRight } from 'lucide-react';

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
        
        {type === 'competition' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(45, 212, 191, 0.1))', border: '1px solid var(--accent-purple)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
              <div>
                <h3 style={{ margin: '0 0 var(--space-2) 0', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><GitBranch size={18} color="var(--accent-purple)" /> Universal Competition Engine</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Want to build complex tournaments with custom brackets, groups, and advanced scoring rules?</p>
              </div>
              <Link href="/engine/models" className="btn btn-primary" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                Try Beta <ArrowRight size={16} />
              </Link>
            </div>
            
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-1)', padding: '0 15px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR USE BASIC MODE</div>
              <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '0 0 var(--space-6) 0' }} />
            </div>

            <CreateEventForm />
          </div>
        )}

        {type === 'status' && <CreateStatusForm />}
        {type === 'community' && <CreateCommunityForm />}
      </div>
    </div>
  );
}
