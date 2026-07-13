import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    <div>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 className="heading-jakaas">YOUR NETWORK</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Connect with people on the same path.</p>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Why these matches?</h3>
        <p>Because you are <strong>{currentUser.masterPath}</strong> interested in <strong>{currentUser.corePath}</strong>.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {similarPeople.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No matches found yet. Check back later!</p>
        )}
        
        {similarPeople.map(person => (
          <div key={person.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <strong><a href={`/user/${person.id}`} style={{ textDecoration: 'none', fontSize: '1.2rem' }}>{person.name || person.username}</a></strong>
              {person.corePath === currentUser.corePath && (
                <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--btn-primary-bg)', color: '#000', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>100% Match</span>
              )}
            </div>
            
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{person.masterPath} • {person.corePath}</span>
            <p style={{ fontSize: '0.9rem' }}>{person.bio}</p>
            
            <a href={`/user/${person.id}`} className="btn btn-outline btn-small" style={{ textAlign: 'center', marginTop: 'auto' }}>View Profile</a>
          </div>
        ))}
      </div>
    </div>
  );
}
