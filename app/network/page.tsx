import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NetworkPage() {
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

  // Find people with similar interests
  const similarPeople = await prisma.user.findMany({
    where: {
      id: { not: userId },
      onboarded: true,
      OR: [
        { corePath: currentUser.corePath || undefined },
        { mindset: currentUser.mindset || undefined },
      ]
    },
    take: 10
  });

  return (
    <div style={{ animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '2.5rem' }}>YOUR NETWORK</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Connect with people on the same path.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: 'var(--space-8)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--gradient-primary)' }}></div>
        <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>Why these matches?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)' }}>Because you are <strong style={{ color: 'var(--text-primary)' }}>{currentUser.masterPath}</strong> interested in <strong style={{ color: 'var(--text-primary)' }}>{currentUser.corePath}</strong>.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {similarPeople.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-secondary)' }}>
            No matches found yet. Check back later!
          </div>
        )}
        
        {similarPeople.map(person => (
          <div key={person.id} className="glass-card hoverable-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Link href={`/user/${person.id}`} style={{ textDecoration: 'none' }}>
                <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{person.name || person.username}</strong>
              </Link>
              {person.corePath === currentUser.corePath && (
                <span style={{ fontSize: '0.65rem', background: 'var(--gradient-primary)', color: '#FFF', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  100% Match
                </span>
              )}
            </div>
            
            <span style={{ color: 'var(--accent-pink)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
              {person.masterPath} {person.corePath ? `• ${person.corePath}` : ''}
            </span>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {person.bio || "No bio provided."}
            </p>
            
            <Link href={`/user/${person.id}`} className="btn btn-outline btn-small" style={{ textAlign: 'center', marginTop: 'auto', width: '100%' }}>
              View Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
