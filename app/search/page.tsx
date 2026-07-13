import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
    <div>
      <h1 className="heading-jakaas" style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '30px' }}>SEARCH</h1>
      
      <div className="card" style={{ marginBottom: '30px' }}>
        <form method="GET" action="/search" style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            name="q" 
            defaultValue={query} 
            className="input-field" 
            placeholder="Search for people by name or email..." 
            style={{ margin: 0, flexGrow: 1 }} 
            required
          />
          <button type="submit" className="btn" style={{ width: 'auto', padding: '0 30px' }}>Search</button>
        </form>
      </div>

      {query && (
        <div>
          <div className="divider" style={{ marginBottom: '20px' }}>RESULTS FOR "{query}"</div>
          
          {users.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {users.map(user => (
                <a key={user.id} href={`/user/${user.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card hoverable-card" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    <div>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'block' }}>{user.name || 'Unnamed User'}</strong>
                      <small style={{ color: 'var(--text-secondary)' }}>{user.email}</small>
                    </div>
                    
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {user.followers.length} Followers
                    </div>

                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
