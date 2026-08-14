import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { MessageCircle, Settings, Play, MapPin, Calendar, CheckCircle2, Bookmark, MoreHorizontal, Repeat2, Send } from 'lucide-react';
import ProfilePicture from '../../components/ProfilePicture';
import ProfileRightSidebar from '../../components/ProfileRightSidebar';
import ShareButton from '../../feed/ShareButton';
import LocalTime from '../../components/LocalTime';
import LikeButton from '../../components/LikeButton';
import CustomVideoPlayer from '../../components/CustomVideoPlayer';

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
      eventRegistrations: { include: { event: true } },
      achievements: true,
      personalProfile: true,
      outgoingConnections: { include: { target: true } }
    }
  });

  if (!user) notFound();

  const isOwner = currentUserId === targetUserId;
  const isVerified = user.accountType !== 'PERSONAL' || user.followers.length > 100; // Mock verification

  // Identity Line calculation
  let identityLine = '';
  if (user.outgoingConnections && user.outgoingConnections.length > 0) {
    const conn = user.outgoingConnections[0];
    identityLine = `${conn.role.replace('_', ' ')} at ${conn.target.name || conn.target.username}`;
  } else if (user.personalProfile?.mainIdentity) {
    identityLine = user.personalProfile.mainIdentity;
  } else {
    identityLine = user.accountType.charAt(0) + user.accountType.slice(1).toLowerCase();
  }

  // Parse JSON traits
  let skills: string[] = [];
  let interests: string[] = [];
  if (user.personalProfile?.skills) {
    try { skills = JSON.parse(user.personalProfile.skills); } catch (e) {}
  }
  if (user.personalProfile?.interests) {
    try { interests = JSON.parse(user.personalProfile.interests); } catch (e) {}
  }
  const allTraits = [...skills, ...interests].slice(0, 5); // display up to 5

  return (
    <div className="layout-3-col">
      <div className="layout-center" style={{ padding: '0', maxWidth: '800px' }}>
        
        {/* Sticky Header Back Navigation could go here, for now just empty top spacing or banner */}
        <div style={{
          height: '140px',
          background: 'linear-gradient(to bottom, rgba(29, 155, 240, 0.1), rgba(0,0,0,0))',
          width: '100%',
        }}></div>

        <div style={{ padding: '0 20px', marginTop: '-60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              border: '4px solid var(--background)', 
              background: 'var(--surface-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <ProfilePicture user={user} size={112} />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'white',
                borderRadius: '24px',
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}>Edit Profile</button>
              
              <button style={{
                background: 'rgba(29, 155, 240, 0.1)',
                border: '1px solid rgba(29, 155, 240, 0.3)',
                color: '#1D9BF0',
                borderRadius: '24px',
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}>Share Profile</button>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{user.name}</h1>
              {isVerified && <CheckCircle2 size={18} color="#1D9BF0" fill="#1D9BF0" />}
            </div>
            
            <p style={{ color: '#71717A', fontSize: '15px', margin: '4px 0 0 0' }}>
              @{user.username}
            </p>
            
            {identityLine && (
              <p style={{ color: '#E4E4E7', fontSize: '15px', margin: '8px 0 0 0', fontWeight: 500 }}>
                {identityLine}
              </p>
            )}

            {user.bio && (
              <p style={{ color: 'white', fontSize: '15px', margin: '12px 0 0 0', lineHeight: 1.4 }}>
                {user.bio}
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', color: '#71717A', fontSize: '14px' }}>
              {user.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={16} /> {user.location}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={16} /> Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', fontSize: '15px' }}>
                <strong style={{ color: 'white' }}>{user.followers.length}</strong> <span style={{ color: '#71717A' }}>Followers</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', fontSize: '15px' }}>
                <strong style={{ color: 'white' }}>{user.following.length}</strong> <span style={{ color: '#71717A' }}>Following</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', fontSize: '15px' }}>
                <strong style={{ color: 'white' }}>—</strong> <span style={{ color: '#71717A' }}>AP Points</span>
              </div>
            </div>
          </div>
          
          {/* Geographic Ranking */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px' }}>City Rank</div>
              <strong style={{ fontSize: '16px', color: 'white' }}>—</strong>
              <div style={{ fontSize: '12px', color: '#71717A', marginTop: '4px' }}>Not ranked yet</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px' }}>State Rank</div>
              <strong style={{ fontSize: '16px', color: 'white' }}>—</strong>
              <div style={{ fontSize: '12px', color: '#71717A', marginTop: '4px' }}>Not ranked yet</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px' }}>National Rank</div>
              <strong style={{ fontSize: '16px', color: 'white' }}>—</strong>
              <div style={{ fontSize: '12px', color: '#71717A', marginTop: '4px' }}>Not ranked yet</div>
            </div>
          </div>

          {/* Skills & Interests */}
          {allTraits.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0' }}>Skills & Interests</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allTraits.map((trait, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: '#E4E4E7'
                  }}>{trait}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          borderBottom: '1px solid var(--border-color)',
          marginTop: '20px'
        }}>
          {['posts', 'about', 'achievements', 'competitions'].map(t => (
            <Link href={`/user/${targetUserId}?tab=${t}`} key={t} style={{
              flex: 1, textAlign: 'center', padding: '16px 0',
              color: activeTab === t ? 'white' : '#71717A',
              fontWeight: activeTab === t ? 700 : 500,
              textDecoration: 'none',
              position: 'relative',
              textTransform: 'capitalize'
            }}>
              {t}
              {activeTab === t && (
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '40px', height: '4px', background: '#1D9BF0', borderRadius: '4px 4px 0 0' }} />
              )}
            </Link>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content" style={{ minHeight: '400px' }}>
          
          {activeTab === 'posts' && (
            <div className="feed-stream">
              {user.posts.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#71717A', fontSize: '15px' }}>
                  <p>No posts yet.</p>
                </div>
              ) : (
                user.posts.map((post) => {
                  const hasLiked = post.likes.some(like => like.userId === currentUserId);
                  return (
                    <div key={post.id} className="feed-post" style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      gap: '12px',
                      transition: 'background 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ flexShrink: 0 }}>
                        <ProfilePicture user={user} size={40} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{user.name}</span>
                              {isVerified && <CheckCircle2 size={14} color="#1D9BF0" fill="#1D9BF0" />}
                              <span style={{ color: '#71717A', fontSize: '15px', marginLeft: '4px' }}>@{user.username}</span>
                              <span style={{ color: '#71717A', fontSize: '15px' }}>·</span>
                              <span style={{ color: '#71717A', fontSize: '15px' }}><LocalTime date={post.createdAt} format="time" /></span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '2px' }}>{identityLine}</div>
                          </div>
                          <button style={{ background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', padding: '4px' }}><MoreHorizontal size={18} /></button>
                        </div>
                        {post.content && (
                          <div style={{ fontSize: '15px', color: 'white', marginTop: '8px', lineHeight: '1.4', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {post.content}
                          </div>
                        )}
                        {post.mediaUrl && (
                          <div style={{ marginTop: '12px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            {post.mediaType === 'image' ? (
                              <img src={post.mediaUrl} alt="Post media" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <CustomVideoPlayer src={post.mediaUrl} style={{ width: '100%' }} />
                            )}
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#71717A', maxWidth: '425px' }}>
                          <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}><MessageCircle size={18} /> {post.comments.length > 0 ? post.comments.length : ''}</button>
                          <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}><Repeat2 size={18} /> {Math.floor(Math.random() * 50)}</button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasLiked ? '#F91880' : 'inherit' }}><LikeButton postId={post.id} initialHasLiked={hasLiked} initialLikesCount={post.likes.length} /></div>
                          <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}><Send size={18} /></button>
                          <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}><Bookmark size={18} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#71717A', fontSize: '15px' }}>
              <p>Detailed structured identity information will appear here.</p>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div style={{ padding: '20px' }}>
              {user.achievements.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#71717A', fontSize: '15px' }}>
                  <p>No achievements yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {user.achievements.map(ach => (
                    <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '32px' }}>{ach.badgeIcon || '🏆'}</div>
                      <div>
                        <strong style={{ display: 'block', color: 'white', fontSize: '15px' }}>{ach.title}</strong>
                        <span style={{ color: '#A1A1AA', fontSize: '14px' }}>{ach.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'competitions' && (
            <div style={{ padding: '20px' }}>
              {user.eventRegistrations.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#71717A', fontSize: '15px' }}>
                  <p>No competitions joined.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {user.eventRegistrations.map(reg => (
                    <div key={reg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <strong style={{ display: 'block', color: 'white', fontSize: '15px' }}>{reg.event.name}</strong>
                        <span style={{ color: '#A1A1AA', fontSize: '14px' }}>{reg.event.category}</span>
                      </div>
                      <div style={{ color: '#1D9BF0', fontSize: '14px', fontWeight: 600 }}>{reg.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <div className="layout-right">
        <ProfileRightSidebar userId={targetUserId} />
      </div>
    </div>
  );
}
