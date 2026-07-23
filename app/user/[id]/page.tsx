import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ShareButton from '../../feed/ShareButton';
import Link from 'next/link';
import FollowButton from '../../components/FollowButton';
import { Metadata } from 'next';
import { MessageCircle, Settings, Play, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import ProfilePicture from '../../components/ProfilePicture';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { title: 'User not found' };

  const title = `${user.username || user.name} on Amerigam`;
  const description = user.bio || `Check out ${user.name}'s profile on Amerigam`;
  return {
    title, description,
    openGraph: { title, description, url: `/user/${user.id}`, images: user.avatarData ? [user.avatarData] : [], type: 'profile' },
    twitter: { card: 'summary', title, description, images: user.avatarData ? [user.avatarData] : [] }
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
      posts: { include: { likes: true, comments: { include: { author: true } } }, orderBy: { createdAt: 'desc' } },
      participations: { include: { competition: true } },
      achievements: true,
      timeTableEntries: true
    }
  });

  if (!user) notFound();

  const isFollowing = currentUserId ? user.followers.some(f => f.followerId === currentUserId) : false;
  const authorInitial = (user.name || user.username || '?').charAt(0).toUpperCase();

  const isOwner = currentUserId === targetUserId;
  const canSeeProductivity = isOwner || user.shareTimeTable;

  // Calculate live status
  let liveTask = null;
  if (canSeeProductivity && user.timeTableEntries) {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${currentHours}:${currentMinutes}`;
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDay = dayNames[now.getDay()];

    liveTask = user.timeTableEntries.find(entry => 
      entry.daysOfWeek.includes(currentDay) && timeStr >= entry.startTime && timeStr <= entry.endTime
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      
      {/* Profile Header (Glass Card) */}
      <div className="glass-card" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
        {/* Background Accent Glow */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-glow-strong)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 'var(--space-6)', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
          {/* Avatar with Gradient Ring */}
          <div style={{ width: '124px', height: '124px', borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)', padding: '3px', flexShrink: 0, boxShadow: 'var(--shadow-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ProfilePicture user={user} size={118} />
          </div>

          {/* User Info */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <h1 className="heading-jakaas" style={{ margin: 0, fontSize: 'var(--text-3xl)' }}>{user.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)', fontWeight: 500 }}>@{user.username || user.name?.toLowerCase().replace(/\s+/g, '')}</p>
                  {canSeeProductivity && (
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {user.productivityScore} pts
                    </span>
                  )}
                </div>
                {(user.masterPath || user.corePath) && (
                  <div style={{ display: 'inline-block', marginTop: 'var(--space-2)', padding: 'var(--space-1) var(--space-3)', background: 'var(--surface-2)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-pink)', border: '1px solid var(--border-color)' }}>
                    {user.masterPath} {user.corePath ? `• ${user.corePath}` : ''}
                  </div>
                )}
                {liveTask && (
                  <div style={{ marginTop: 'var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'rgba(59, 130, 246, 0.15)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 8px #3b82f6', animation: 'pulse 2s infinite' }}></span>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#60a5fa' }}>Live: {liveTask.title}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                {currentUserId && currentUserId !== targetUserId && (
                  <>
                    <FollowButton targetUserId={targetUserId} initialIsFollowing={isFollowing} />
                    <form action={`/messages/${targetUserId}`}>
                      <button type="submit" className="btn btn-small btn-outline">
                        <MessageCircle size={16} /> <span className="text">Message</span>
                      </button>
                    </form>
                  </>
                )}
                {currentUserId === targetUserId && (
                  <Link href="/settings" className="btn btn-small btn-outline">
                    <Settings size={16} /> <span className="text">Edit</span>
                  </Link>
                )}
                <ShareButton url={`/user/${user.id}`} title={`${user.username || user.name} on Amerigam`} />
              </div>
            </div>

            <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{user.bio}</p>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              {user.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                  <MapPin size={14} /> {user.location}
                </div>
              )}
              {user.portfolioUrl && (
                <a href={user.portfolioUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--accent-cyan)', fontSize: 'var(--text-xs)', textDecoration: 'none', fontWeight: 600 }}>
                  <LinkIcon size={14} /> Portfolio
                </a>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                <Calendar size={14} /> Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-around', padding: 'var(--space-4)', margin: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ display: 'block', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>{user.posts.length}</strong>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '1px' }}>Posts</span>
        </div>
        <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ display: 'block', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>{user.followers.length}</strong>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '1px' }}>Followers</span>
        </div>
        <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <strong style={{ display: 'block', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>{user.following.length}</strong>
          <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '1px' }}>Following</span>
        </div>
      </div>

      {/* Modern Tab Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'var(--surface-2)', padding: 'var(--space-1)', borderRadius: 'var(--radius-lg)' }}>
        {['posts', 'competitions', 'achievements', 'productivity'].map((t) => (
          <Link key={t} href={`/user/${targetUserId}?tab=${t}`} style={{
            flex: 1, textAlign: 'center', padding: 'var(--space-2) var(--space-4)', textDecoration: 'none', borderRadius: 'var(--radius-md)',
            color: activeTab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: activeTab === t ? 'var(--surface-3)' : 'transparent',
            boxShadow: activeTab === t ? 'var(--shadow-sm)' : 'none',
            fontWeight: activeTab === t ? 700 : 500, fontSize: 'var(--text-sm)', textTransform: 'capitalize', transition: 'all var(--duration-fast) var(--ease-smooth)'
          }}>
            {t}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '300px' }}>
        {activeTab === 'posts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
            {user.posts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>No posts yet.</div>
            ) : user.posts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`} className="hoverable-card" style={{ aspectRatio: '1/1', backgroundColor: 'var(--surface-2)', position: 'relative', overflow: 'hidden', display: 'block', borderRadius: 'var(--radius-md)', padding: 0 }}>
                {post.mediaUrl ? (
                  post.mediaType === 'image' ? 
                    <img src={post.mediaUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <video src={post.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <Play size={24} color="white" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }} />
                    </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', background: 'var(--surface-1)' }}>
                    {post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'competitions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {user.participations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>No competitions joined.</div>
            ) : user.participations.map(part => (
              <div key={part.id} className="card hoverable-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                <div>
                  <strong style={{ display: 'block', fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>{part.competition.title}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{part.competition.level} • {part.competition.category}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {part.rank ? (
                    <span style={{ display: 'block', fontSize: 'var(--text-lg)', fontWeight: 800, color: part.rank === 1 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                      Rank #{part.rank}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Pending Result</span>
                  )}
                  {part.score && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Score: {part.score}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
            {user.achievements.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>No achievements yet.</div>
            ) : user.achievements.map(ach => (
              <div key={ach.id} className="glass-card hoverable-card" style={{ textAlign: 'center', padding: 'var(--space-4)', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.1))' }}>{ach.badgeIcon || '🏆'}</div>
                <strong style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.2 }}>{ach.title}</strong>
                {ach.description && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{ach.description}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'productivity' && (
          <div style={{ padding: 'var(--space-4)', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
            {!canSeeProductivity ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--space-4)' }}>🔒</span>
                This user's routine and productivity score are private.
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>Daily Routine (Time Table)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {user.timeTableEntries.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No routine set.</p>
                  ) : (
                    user.timeTableEntries.map(entry => (
                      <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{entry.title}</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                            {entry.startTime} - {entry.endTime} • Repeats: {JSON.parse(entry.daysOfWeek).join(', ')}
                          </div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-amber)', fontSize: 'var(--text-sm)' }}>
                          +{entry.pointsReward} pts
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
