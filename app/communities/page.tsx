import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCommunity, joinCommunity } from './actions';
import { Users, LayoutGrid } from 'lucide-react';

export default async function CommunitiesPage() {
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

  const communities = await prisma.community.findMany({
    include: {
      _count: {
        select: { members: true }
      },
      members: {
        where: { userId } // Check if current user is a member
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
          <LayoutGrid size={36} color="var(--accent-purple)" /> COMMUNITIES
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Find your tribe. Build your network.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: 'var(--space-10)', padding: 'var(--space-6)' }}>
        <h2 style={{ marginBottom: 'var(--space-4)', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>START A NEW COMMUNITY</h2>
        <form action={createCommunity} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <input type="text" name="name" className="input-field" placeholder="Community Name" required />
          </div>
          <div>
            <textarea name="description" className="input-field" placeholder="What is this community about?" style={{ resize: 'vertical', minHeight: '80px' }}></textarea>
          </div>
          <div>
            <select name="category" className="input-field" style={{ cursor: 'pointer' }}>
              <option value="Tech & AI">Tech & AI</option>
              <option value="Business & Startups">Business & Startups</option>
              <option value="Visual Arts">Visual Arts</option>
              <option value="Fitness & Strength">Fitness & Strength</option>
              <option value="Travel & Culture">Travel & Culture</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="btn" style={{ marginTop: 'var(--space-2)' }}>Create Community</button>
        </form>
      </div>

      <div className="divider" style={{ fontSize: 'var(--text-sm)' }}>EXPLORE COMMUNITIES</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {communities.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-secondary)' }}>
            No communities yet. Be the first to start one!
          </div>
        )}
        
        {communities.map(community => {
          const isMember = community.members.length > 0;

          return (
            <div key={community.id} className="glass-card hoverable-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{community.name}</h3>
                <span style={{ fontSize: '0.7rem', background: 'var(--surface-2)', color: 'var(--accent-cyan)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid var(--border-color)' }}>
                  {community.category}
                </span>
              </div>
              
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{community.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontWeight: 600 }}>
                  <Users size={14} /> {community._count.members} Members
                </span>
                
                {isMember ? (
                  <a href={`/communities/${community.id}`} className="btn btn-small" style={{ borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                    Enter
                  </a>
                ) : (
                  <form action={joinCommunity}>
                    <input type="hidden" name="communityId" value={community.id} />
                    <button type="submit" className="btn btn-outline btn-small" style={{ borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Join</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
