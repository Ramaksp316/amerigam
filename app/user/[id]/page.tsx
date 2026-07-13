import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import ShareButton from '../../feed/ShareButton';
import Link from 'next/link';
import FollowButton from '../../components/FollowButton';

export default async function UserProfilePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string }> }) {
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get('userId')?.value;
  const { id: targetUserId } = await params;
  const { tab } = await searchParams;
  const activeTab = tab || 'posts';

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      followers: true,
      following: true,
      posts: {
        include: { likes: true, comments: { include: { author: true } } },
        orderBy: { createdAt: 'desc' }
      },
      participations: {
        include: { competition: true }
      },
      achievements: true
    }
  });

  if (!user) {
    notFound();
  }

  const isFollowing = currentUserId ? user.followers.some(f => f.followerId === currentUserId) : false;
  const authorInitial = (user.name || user.username || '?').charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'center' }}>
        <div style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: 'bold',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {user.avatarData ? <img src={user.avatarData} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : authorInitial}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{user.username || user.name}</h1>
            
            {currentUserId && currentUserId !== targetUserId && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <FollowButton targetUserId={targetUserId} initialIsFollowing={isFollowing} />
                <form action={`/messages/${targetUserId}`}>
                  <button type="submit" className="btn btn-small btn-outline" style={{ fontWeight: 600 }}>Message</button>
                </form>
              </div>
            )}
            {currentUserId === targetUserId && (
              <Link href="/settings" className="btn btn-small btn-outline" style={{ fontWeight: 600 }}>Edit Profile</Link>
            )}
          </div>

          <div style={{ display: 'flex', gap: '30px', marginBottom: '15px' }}>
            <span><strong>{user.posts.length}</strong> posts</span>
            <span><strong>{user.followers.length}</strong> followers</span>
            <span><strong>{user.following.length}</strong> following</span>
          </div>

          <div>
            <strong style={{ display: 'block' }}>{user.name}</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.masterPath} {user.corePath ? `• ${user.corePath}` : ''}</span>
            <p style={{ marginTop: '5px', whiteSpace: 'pre-line' }}>{user.bio}</p>
            {user.portfolioUrl && <a href={user.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#00376b', textDecoration: 'none', fontWeight: 600, display: 'block', marginTop: '5px' }}>{user.portfolioUrl}</a>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', marginTop: '20px', marginBottom: '20px' }}>
        <Link href={`/user/${targetUserId}?tab=posts`} style={{
          flex: 1, textAlign: 'center', padding: '15px 0', textDecoration: 'none', color: activeTab === 'posts' ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderTop: activeTab === 'posts' ? '1px solid var(--text-primary)' : '1px solid transparent', marginTop: '-1px', fontWeight: activeTab === 'posts' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px'
        }}>
          Posts & Projects
        </Link>
        <Link href={`/user/${targetUserId}?tab=competitions`} style={{
          flex: 1, textAlign: 'center', padding: '15px 0', textDecoration: 'none', color: activeTab === 'competitions' ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderTop: activeTab === 'competitions' ? '1px solid var(--text-primary)' : '1px solid transparent', marginTop: '-1px', fontWeight: activeTab === 'competitions' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px'
        }}>
          Competitions
        </Link>
        <Link href={`/user/${targetUserId}?tab=achievements`} style={{
          flex: 1, textAlign: 'center', padding: '15px 0', textDecoration: 'none', color: activeTab === 'achievements' ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderTop: activeTab === 'achievements' ? '1px solid var(--text-primary)' : '1px solid transparent', marginTop: '-1px', fontWeight: activeTab === 'achievements' ? 600 : 400, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px'
        }}>
          Achievements
        </Link>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'posts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {user.posts.length === 0 ? (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No posts yet.</div>
            ) : user.posts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`} style={{ aspectRatio: '1/1', backgroundColor: 'var(--border-color)', position: 'relative', overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                {post.mediaUrl ? (
                  post.mediaType === 'image' ? 
                    <img src={post.mediaUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                    <video src={post.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', fontSize: '0.9rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                    {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'competitions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {user.participations.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>No competitions joined yet.</p>
            ) : user.participations.map(part => (
              <div key={part.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.2rem' }}>{part.competition.title}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{part.competition.level} • {part.competition.category}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {part.rank ? (
                    <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: part.rank === 1 ? '#eab308' : part.rank === 2 ? '#9ca3af' : '#d97706' }}>
                      Rank #{part.rank}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Pending Result</span>
                  )}
                  {part.score && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Score: {part.score}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {user.achievements.length === 0 ? (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No achievements yet.</div>
            ) : user.achievements.map(ach => (
              <div key={ach.id} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{ach.badgeIcon || '🏆'}</div>
                <strong style={{ display: 'block' }}>{ach.title}</strong>
                {ach.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>{ach.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
