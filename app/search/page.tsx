import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (currentUser && !currentUser.onboarded) {
    redirect('/onboarding');
  }

  const query = resolvedSearchParams.q || '';

  let users: any[] = [];
  
  if (query.trim().length > 0) {
    users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      },
      include: {
        followers: true,
      },
      take: 20
    });
  }

  return (
    <div style={{ animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <h1 className="heading-jakaas" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 'var(--space-6)' }}>SEARCH</h1>
      
      <div className="glass-card" style={{ marginBottom: 'var(--space-8)' }}>
        <form method="GET" action="/search" style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input 
            type="text" 
            name="q" 
            defaultValue={query} 
            className="input-field" 
            placeholder="Search for people by name or email..." 
            style={{ margin: 0, flexGrow: 1, border: '1px solid var(--border-color)', background: 'var(--surface-0)' }} 
            required
          />
          <button type="submit" className="btn" style={{ width: 'auto', padding: '0 var(--space-8)' }}>Search</button>
        </form>
      </div>

      {query && (
        <div>
          <div className="divider" style={{ marginBottom: 'var(--space-6)' }}>RESULTS FOR "{query}"</div>
          
          {users.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-8)' }}>
              No users found matching "{query}".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {users.map(user => (
                <Link key={user.id} href={`/user/${user.id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card hoverable-card" style={{ padding: 'var(--space-4)', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div className="post-avatar" style={{ width: '48px', height: '48px' }}>
                        <div className="post-avatar-inner" style={{ fontSize: '1.2rem' }}>
                          {(user.name || user.username || '?').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', display: 'block' }}>{user.name || 'Unnamed User'}</strong>
                        <small style={{ color: 'var(--text-secondary)' }}>@{user.username || user.name?.toLowerCase().replace(/\s+/g, '') || 'user'}</small>
                      </div>
                    </div>
                    
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                      {user.followers.length} Followers
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
