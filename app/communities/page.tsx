import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCommunity, joinCommunity } from './actions';

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
    <div>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 className="heading-jakaas">COMMUNITIES</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Find your tribe. Build your network.</p>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px', fontFamily: 'Oswald, sans-serif' }}>START A NEW COMMUNITY</h2>
        <form action={createCommunity}>
          <div style={{ marginBottom: '15px' }}>
            <input type="text" name="name" className="input-field" placeholder="Community Name" required />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <textarea name="description" className="input-field" placeholder="What is this community about?" style={{ resize: 'vertical', minHeight: '60px' }}></textarea>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <select name="category" className="input-field" style={{ cursor: 'pointer' }}>
              <option value="Tech & AI">Tech & AI</option>
              <option value="Business & Startups">Business & Startups</option>
              <option value="Visual Arts">Visual Arts</option>
              <option value="Fitness & Strength">Fitness & Strength</option>
              <option value="Travel & Culture">Travel & Culture</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="btn">Create Community</button>
        </form>
      </div>

      <div className="divider">EXPLORE COMMUNITIES</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {communities.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No communities yet. Be the first to start one!</p>
        )}
        
        {communities.map(community => {
          const isMember = community.members.length > 0;

          return (
            <div key={community.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{community.name}</h3>
                <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {community.category}
                </span>
              </div>
              
              <p style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{community.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  👥 {community._count.members} Members
                </span>
                
                {isMember ? (
                  <a href={`/communities/${community.id}`} className="btn btn-small" style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}>
                    Enter Community
                  </a>
                ) : (
                  <form action={joinCommunity}>
                    <input type="hidden" name="communityId" value={community.id} />
                    <button type="submit" className="btn btn-outline btn-small">Join Community</button>
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
