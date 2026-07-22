import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ShareButton from '../../feed/ShareButton';
import Link from 'next/link';
import FollowButton from '../../components/FollowButton';
import { Metadata } from 'next';
import { MessageCircle, Settings, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return { title: 'User not found' };

  const title = `${user.username || user.name} on Amerigam`;
  const description = user.bio || `Check out ${user.name}'s profile on Amerigam`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/user/${user.id}`,
      images: user.avatarData ? [user.avatarData] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: user.avatarData ? [user.avatarData] : [],
    }
  };
}

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
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Avatar with Gradient Ring */}
        <div className="post-avatar" style={{ width: '130px', height: '130px', flexShrink: 0 }}>
          <div className="post-avatar-inner" style={{ fontSize: 'var(--text-4xl)' }}>
            {user.avatarData ? <img src={user.avatarData} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : authorInitial}
          </div>
        </div>

        {/* User Stats & Info */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>{user.username || user.name}</h1>
            
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              {currentUserId && currentUserId !== targetUserId && (
                <>
                  <FollowButton targetUserId={targetUserId} initialIsFollowing={isFollowing} />
                  <form action={`/messages/${targetUserId}`}>
                    <button type="submit" className="btn btn-small btn-outline" style={{ fontWeight: 600 }}>
                      <MessageCircle size={15} /> Message
                    </button>
                  </form>
                </>
              )}
              {currentUserId === targetUserId && (
                <Link href="/settings" className="btn btn-small btn-outline" style={{ fontWeight: 600 }}>
                  <Settings size={15} /> Edit Profile
                </Link>
              )}
              <ShareButton 
                url={`/user/${user.id}`} 
                title={`${user.username || user.name} on Amerigam`} 
                text={`Check out ${user.name}'s profile!`} 
              />
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            <span><strong style={{ fontSize: 'var(--text-md)' }}>{user.posts.length}</strong> posts</span>
            <span><strong style={{ fontSize: 'var(--text-md)' }}>{user.followers.length}</strong> followers</span>
            <span><strong style={{ fontSize: 'var(--text-md)' }}>{user.following.length}</strong> following</span>
          </div>

          {/* Bio Glass Card */}
          <div className="card" style={{ padding: 'var(--space-4)', margin: 0 }}>
            <strong style={{ display: 'block', fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>{user.name}</strong>
            {(user.masterPath || user.corePath) && (
              <span style={{ color: 'var(--accent-pink)', fontSize: 'var(--text-xs)', fontWeight: 700, display: 'block', marginBottom: 'var(--space-2)' }}>
                {user.masterPath} {user.corePath ? `• ${user.corePath}` : ''}
              </span>
            )}
            <p style={{ whiteSpace: 'pre-line', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user.bio}</p>
            {user.portfolioUrl && (
              <a href={user.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600, fontSize: 'var(--text-xs)', display: 'block', marginTop: 'var(--space-2)' }}>
                🔗 {user.portfolioUrl.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

        </div>
      </div>

      {/* Grid Filter Tabs */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--space-6)' }}>
        <Link href={`/user/${targetUserId}?tab=posts`} style={{
          flex: 1, textAlign: 'center', padding: 'var(--space-3) 0', textDecoration: 'none', 
          color: activeTab === 'posts' ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'posts' ? '2px solid var(--accent-pink)' : '2px solid transparent',
          fontWeight: activeTab === 'posts' ? 700 : 500, fontSize: 'var(--text-xs)', letterSpacing: '1px', textTransform: 'uppercase'
        }}>
          Posts & Projects
        </Link>
        <Link href={`/user/${targetUserId}?tab=competitions`} style={{
          flex: 1, textAlign: 'center', padding: 'var(--space-3) 0', textDecoration: 'none', 
          color: activeTab === 'competitions' ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'competitions' ? '2px solid var(--accent-pink)' : '2px solid transparent',
          fontWeight: activeTab === 'competitions' ? 700 : 500, fontSize: 'var(--text-xs)', letterSpacing: '1px', textTransform: 'uppercase'
        }}>
          Competitions
        </Link>
        <Link href={`/user/${targetUserId}?tab=achievements`} style={{
          flex: 1, textAlign: 'center', padding: 'var(--space-3) 0', textDecoration: 'none', 
          color: activeTab === 'achievements' ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderBottom: activeTab === 'achievements' ? '2px solid var(--accent-pink)' : '2px solid transparent',
          fontWeight: activeTab === 'achievements' ? 700 : 500, fontSize: 'var(--text-xs)', letterSpacing: '1px', textTransform: 'uppercase'
        }}>
          Achievements
        </Link>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'posts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            {user.posts.length === 0 ? (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>No posts yet.</div>
            ) : user.posts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`} style={{ aspectRatio: '1/1', backgroundColor: 'var(--surface-2)', position: 'relative', overflow: 'hidden', display: 'block', borderRadius: 'var(--radius-md)' }}>
                {post.mediaUrl ? (
                  post.mediaType === 'image' ? 
                    <img src={post.mediaUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <video src={post.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <Play size={20} color="white" style={{ position: 'absolute', top: '10px', right: '10px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                    </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-3)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-1)' }}>
                    {post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'competitions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {user.participations.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-6)' }}>No competitions joined yet.</p>
            ) : user.participations.map(part => (
              <div key={part.id} className="card hoverable-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                <div>
                  <strong style={{ display: 'block', fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>{part.competition.title}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{part.competition.level} • {part.competition.category}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {part.rank ? (
                    <span style={{ display: 'block', fontSize: 'var(--text-lg)', fontWeight: 800, color: part.rank === 1 ? '#F59E0B' : part.rank === 2 ? '#9CA3AF' : '#D97706' }}>
                      Rank #{part.rank}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>Pending Result</span>
                  )}
                  {part.score && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Score: {part.score}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            {user.achievements.length === 0 ? (
              <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>No achievements yet.</div>
            ) : user.achievements.map(ach => (
              <div key={ach.id} className="card hoverable-card" style={{ textAlign: 'center', padding: 'var(--space-4)', margin: 0 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>{ach.badgeIcon || '🏆'}</div>
                <strong style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{ach.title}</strong>
                {ach.description && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>{ach.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
