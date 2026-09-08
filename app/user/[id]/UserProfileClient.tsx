'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageCircle, Bookmark, Repeat2, Send, MoreHorizontal, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import ProfilePicture from '../../components/ProfilePicture';
import LocalTime from '../../components/LocalTime';
import LikeButton from '../../components/LikeButton';
import CustomVideoPlayer from '../../components/CustomVideoPlayer';
import PostActionButtons from '../../components/PostActionButtons';
import ImageLightbox from '../../components/ImageLightbox';
import { deletePost } from '../../actions/postActions';
import { toggleFollow } from '../../actions/userActions';

// ============================================================
// TYPOGRAPHY & SPACING SCALE
// name:        20–22px  bold,  #FFFFFF  — max 2 lines
// username:    14px     medium #71717A
// profession:  14px     medium #A1A1AA
// bio:         15px     normal #E4E4E7  — 3 line clamp
// metadata:    13px     normal #71717A
// section-hdg: 14px     semibold #A1A1AA  uppercase tracking
// chip:        12px     medium  subtle bg
// stat-num:    17px     bold   #FFFFFF
// stat-label:  12px     medium #71717A
// ============================================================

// ---- Chip Component ----
function Chip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      fontSize: '12px',
      color: '#D4D4D8',
      fontWeight: 500,
      lineHeight: '20px',
    }}>
      {label}
    </span>
  );
}

// ---- Stat Cell ----
function StatCell({ value, label, href }: { value: string | number; label: string; href?: string }) {
  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <span style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1' }}>{value}</span>
      <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 500 }}>{label}</span>
    </div>
  );
  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>;
  }
  return inner;
}

// ---- Rank Cell ----
function RankCell({ label, rank }: { label: string; rank?: number | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: 1 }}>
      <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontSize: '15px', fontWeight: 700, color: rank ? '#FFFFFF' : '#3F3F46' }}>
        {rank ? `#${rank}` : '—'}
      </span>
    </div>
  );
}

// ---- Profile Actions (Client-interactive) ----
function ProfileActions({ isOwner, targetUserId, isFollowing: initialIsFollowing, currentUserId }: {
  isOwner: boolean;
  targetUserId: string;
  isFollowing: boolean;
  currentUserId?: string;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUserId || followLoading) return;
    setFollowLoading(true);
    const previousState = isFollowing;
    try {
      setIsFollowing(!isFollowing);
      await toggleFollow(targetUserId);
    } catch (e) {
      setIsFollowing(previousState);
    }
    setFollowLoading(false);
  };

  if (isOwner) {
    return (
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <Link href="/settings" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 16px', height: '34px',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '8px',
          color: '#FFFFFF',
          fontSize: '14px', fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          background: 'rgba(255,255,255,0.05)',
          letterSpacing: '-0.1px'
        }}>
          Edit Profile
        </Link>
        <Link href={`/user/${targetUserId}/share`} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 14px', height: '34px',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '8px',
          color: '#A1A1AA',
          fontSize: '14px', fontWeight: 600,
          textDecoration: 'none',
          background: 'rgba(255,255,255,0.04)',
          letterSpacing: '-0.1px'
        }}>
          Share
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
      <button
        onClick={handleFollow}
        disabled={followLoading}
        style={{
          height: '34px', padding: '0 18px',
          borderRadius: '8px',
          background: isFollowing ? 'rgba(255,255,255,0.06)' : '#3B82F6',
          border: isFollowing ? '1px solid rgba(255,255,255,0.18)' : 'none',
          color: '#FFFFFF',
          fontSize: '14px', fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.1px',
          transition: 'background 0.15s ease',
          opacity: followLoading ? 0.7 : 1
        }}>
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      <Link href={`/messages?userId=${targetUserId}`} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '34px', padding: '0 14px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.18)',
        color: '#FFFFFF',
        fontSize: '14px', fontWeight: 600,
        textDecoration: 'none',
        background: 'rgba(255,255,255,0.05)',
        whiteSpace: 'nowrap',
        letterSpacing: '-0.1px'
      }}>
        Message
      </Link>
      <Link
        href={`/challenge/create/${targetUserId}`}
        title="Challenge"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '34px', width: '34px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.18)',
          color: '#A1A1AA',
          fontSize: '16px',
          textDecoration: 'none',
          background: 'rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}>
        ⚔️
      </Link>
    </div>
  );
}

// ---- Bio with expand ----
function BioText({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldClamp = bio.length > 120;

  return (
    <div>
      <p style={{
        fontSize: '15px',
        color: '#E4E4E7',
        margin: 0,
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: expanded ? 'unset' : 3,
        overflow: expanded ? 'visible' : 'hidden',
        wordBreak: 'break-word',
      }}>
        {bio}
      </p>
      {shouldClamp && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#71717A', fontSize: '13px', padding: '4px 0 0 0',
            display: 'flex', alignItems: 'center', gap: '2px'
          }}>
          {expanded ? <>less <ChevronUp size={13} /></> : <>more <ChevronDown size={13} /></>}
        </button>
      )}
    </div>
  );
}

// ---- Main Client Component ----
export default function UserProfileClient({
  user,
  currentUserId,
  targetUserId,
  isOwner,
  isVerified,
  identityLine,
  skills,
  interests,
  hobbies,
  rankData,
  activeTab,
}: {
  user: any;
  currentUserId?: string;
  targetUserId: string;
  isOwner: boolean;
  isVerified: boolean;
  identityLine: string;
  skills: string[];
  interests: string[];
  hobbies: string[];
  rankData: { city?: number | null; state?: number | null; national?: number | null; intl?: number | null };
  activeTab: string;
}) {
  const isPersonal = user.accountType === 'PERSONAL';

  const metadataParts: string[] = [];
  if (user.location) metadataParts.push(user.location);
  if (user.city || user.state) {
    const geo = [user.city, user.state].filter(Boolean).join(', ');
    if (geo && !user.location) metadataParts.push(geo);
  }
  const joined = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  metadataParts.push(`Joined ${joined}`);
  const metaLine = metadataParts.join(' · ');

  const isFollowing = user.followers?.some((f: any) => f.followerId === currentUserId) ?? false;

  const tabs = ['posts', 'about', 'achievements', 'competitions'];

  const apPoints = user.amerigamPoints ?? 0;
  const hasRankData = rankData.city || rankData.state || rankData.national || rankData.intl;

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', maxWidth: '600px', margin: '0 auto' }}>
      {/* ===== PROFILE HEADER ===== */}
      <div style={{ padding: '16px 16px 0' }}>

        {/* Row 1: Avatar + Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          {/* Avatar */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.15)',
            overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ProfilePicture user={user} size={84} showStatus={false} />
          </div>

          {/* Action Buttons — vertically centered with avatar */}
          <div style={{ paddingTop: '6px' }}>
            <ProfileActions
              isOwner={isOwner}
              targetUserId={targetUserId}
              isFollowing={isFollowing}
              currentUserId={currentUserId}
            />
          </div>
        </div>

        {/* Row 2: Identity */}
        <div style={{ marginTop: '12px' }}>
          {/* Name + Verified */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <h1 style={{
              margin: 0,
              fontSize: '21px',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: '1.2',
              letterSpacing: '-0.3px',
              wordBreak: 'break-word'
            }}>
              {user.name || user.username}
            </h1>
            {isVerified && <CheckCircle2 size={16} color="#3B82F6" fill="#3B82F6" style={{ flexShrink: 0 }} />}
          </div>

          {/* Username */}
          <p style={{ margin: '3px 0 0 0', fontSize: '14px', color: '#71717A', fontWeight: 400 }}>
            @{user.username}
          </p>

          {/* Profession / Identity line */}
          {identityLine && (
            <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#A1A1AA', fontWeight: 500 }}>
              {identityLine}
            </p>
          )}

          {/* Connected roles (if any, tappable) */}
          {user.outgoingConnections?.length > 0 && (
            <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {user.outgoingConnections.slice(0, 2).map((conn: any) => (
                <Link key={conn.id} href={`/user/${conn.targetId}`} style={{
                  fontSize: '13px', color: '#3B82F6',
                  textDecoration: 'none', fontWeight: 500
                }}>
                  {conn.role.replace('_', ' ')} at {conn.target.name || conn.target.username}
                </Link>
              ))}
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <div style={{ marginTop: '10px' }}>
              <BioText bio={user.bio} />
            </div>
          )}

          {/* Metadata line */}
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#52525B', lineHeight: '1.4' }}>
            {metaLine}
          </p>
        </div>

        {/* Row 3: Stats */}
        <div style={{
          display: 'flex', gap: '24px', marginTop: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #1A1A1A'
        }}>
          <StatCell value={user.followers?.length ?? 0} label="Followers" href={`/user/${targetUserId}/followers`} />
          <StatCell value={user.following?.length ?? 0} label="Following" href={`/user/${targetUserId}/following`} />
          {isPersonal && (
            <StatCell value={apPoints > 0 ? apPoints.toLocaleString() : '—'} label="AP" />
          )}
        </div>

        {/* Row 4: Ranking — only for PERSONAL */}
        {isPersonal && (
          <div style={{ paddingTop: '14px', paddingBottom: '14px', borderBottom: '1px solid #1A1A1A' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Ranking
            </p>
            {hasRankData ? (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <RankCell label="City" rank={rankData.city} />
                <div style={{ width: '1px', background: '#1A1A1A' }} />
                <RankCell label="State" rank={rankData.state} />
                <div style={{ width: '1px', background: '#1A1A1A' }} />
                <RankCell label="National" rank={rankData.national} />
                <div style={{ width: '1px', background: '#1A1A1A' }} />
                <RankCell label="Intl." rank={rankData.intl} />
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#3F3F46' }}>Not ranked yet</p>
            )}
          </div>
        )}

        {/* Row 5: Skills / Interests / Hobbies — only if data exists */}
        {(skills.length > 0 || interests.length > 0 || hobbies.length > 0) && (
          <div style={{ paddingTop: '14px', paddingBottom: '14px', borderBottom: '1px solid #1A1A1A' }}>
            {skills.length > 0 && (
              <div style={{ marginBottom: interests.length > 0 || hobbies.length > 0 ? '10px' : 0 }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Skills
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skills.map((s, i) => <Chip key={i} label={s} />)}
                </div>
              </div>
            )}
            {interests.length > 0 && (
              <div style={{ marginBottom: hobbies.length > 0 ? '10px' : 0 }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Interests
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {interests.map((s, i) => <Chip key={i} label={s} />)}
                </div>
              </div>
            )}
            {hobbies.length > 0 && (
              <div>
                <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Hobbies
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {hobbies.map((s, i) => <Chip key={i} label={s} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== TABS — sticky below header ===== */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: '#000000',
        borderBottom: '1px solid #1A1A1A',
        display: 'flex',
        overflowX: 'auto',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none' as any,
      }}>
        {tabs.map(t => (
          <Link
            key={t}
            href={`/user/${targetUserId}?tab=${t}`} scroll={false}
            style={{
              flex: '1 0 auto',
              textAlign: 'center',
              padding: '13px 4px',
              color: activeTab === t ? '#FFFFFF' : '#52525B',
              fontWeight: activeTab === t ? 600 : 500,
              textDecoration: 'none',
              fontSize: '14px',
              textTransform: 'capitalize',
              letterSpacing: '-0.1px',
              position: 'relative',
              whiteSpace: 'nowrap',
              borderBottom: activeTab === t ? '2px solid #3B82F6' : '2px solid transparent',
              transition: 'color 0.15s ease'
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Link>
        ))}
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div style={{ paddingBottom: '90px' /* bottom nav clearance */ }}>

        {/* POSTS */}
        {activeTab === 'posts' && (
          <div>
            {user.posts.length === 0 ? (
              <div style={{ padding: '48px 16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>No posts yet</p>
                {isOwner ? (
                  <>
                    <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#71717A' }}>Share what you're working on</p>
                    <Link href="/create?type=post" style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '10px 24px',
                      background: '#3B82F6',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '14px', fontWeight: 600,
                      textDecoration: 'none'
                    }}>
                      Create Post
                    </Link>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: '14px', color: '#52525B' }}>Nothing shared yet</p>
                )}
              </div>
            ) : (
              user.posts.map((post: any) => {
                const hasLiked = post.likes?.some((l: any) => l.userId === currentUserId) ?? false;
                return (
                  <div key={post.id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #111111',
                  }}>
                    {/* Post header */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <Link href={`/user/${targetUserId}`} style={{ flexShrink: 0 }}>
                        <ProfilePicture user={user} size={40} showStatus={false} />
                      </Link>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                                {user.name || user.username}
                              </span>
                              {isVerified && <CheckCircle2 size={13} color="#3B82F6" fill="#3B82F6" />}
                            </div>
                            <div style={{ fontSize: '12px', color: '#52525B', marginTop: '1px' }}>
                              @{user.username} · <LocalTime date={post.createdAt} format="relative" />
                            </div>
                          </div>
                          {isOwner ? (
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this post?')) {
                                  try {
                                    await deletePost(post.id);
                                  } catch (e) {
                                    console.error('Failed to delete', e);
                                  }
                                }
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                              title="Delete Post"
                            >
                              <span style={{ fontSize: '14px' }}>🗑️</span>
                            </button>
                          ) : (
                            <button style={{ background: 'transparent', border: 'none', color: '#52525B', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}>
                              <MoreHorizontal size={17} />
                            </button>
                          )}
                        </div>

                        {/* Post content */}
                        {post.content && (
                          <p style={{
                            fontSize: '15px', color: '#F4F4F5',
                            margin: '8px 0 0 0',
                            lineHeight: '1.45',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            letterSpacing: '-0.1px'
                          }}>
                            {post.content}
                          </p>
                        )}

                        {post.mediaUrl && (
                          <div style={{ marginTop: '10px' }}>
                            {post.mediaType === 'image' ? (
                              <ImageLightbox src={post.mediaUrl} alt="Post media" />
                            ) : (
                              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #1A1A1A', background: '#0A0A0A', width: '100%' }}>
                                <CustomVideoPlayer src={post.mediaUrl} style={{ width: '100%', display: 'block' }} />
                              </div>
                            )}
                          </div>
                        )}

                        <PostActionButtons
                          postId={post.id}
                          hasLiked={hasLiked}
                          likesCount={post.likes?.length ?? 0}
                          commentsCount={post.comments?.length ?? 0}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ABOUT */}
        {activeTab === 'about' && (
          <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {user.bio && (
              <div>
                <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bio</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#E4E4E7', lineHeight: '1.55' }}>{user.bio}</p>
              </div>
            )}

            {identityLine && (
              <div>
                <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profession</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#E4E4E7' }}>{identityLine}</p>
              </div>
            )}

            {user.outgoingConnections?.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Experience</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {user.outgoingConnections.map((conn: any) => (
                    <Link key={conn.id} href={`/user/${conn.targetId}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        border: '1px solid #1A1A1A'
                      }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                          {conn.role.replace('_', ' ')}
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#71717A' }}>
                          {conn.target.name || conn.target.username}
                          {conn.status === 'PAST' ? ' · Past' : ' · Current'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}


            {user.incomingConnections?.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Team</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {user.incomingConnections.map((conn: any) => (
                    <Link key={conn.id} href={`/user/${conn.sourceId}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        border: '1px solid #1A1A1A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {conn.source.avatarData ? (
                            <img src={conn.source.avatarData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ color: 'white', fontSize: '16px' }}>{conn.source.name?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                            {conn.source.name || conn.source.username}
                          </p>
                          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#71717A' }}>
                            {conn.role.replace('_', ' ')}
                            {conn.status === 'PAST' ? ' · Past' : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(user.location || user.city || user.state || user.country) && (
              <div>
                <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#A1A1AA' }}>
                  {[user.location || user.city, user.state, user.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            <div>
              <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#52525B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member Since</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#A1A1AA' }}>
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div style={{ padding: '16px' }}>
            {user.achievements?.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>No achievements yet</p>
                {isOwner && <p style={{ margin: 0, fontSize: '13px', color: '#52525B' }}>Join competitions to earn achievements</p>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {user.achievements?.map((ach: any) => (
                  <div key={ach.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    border: '1px solid #1A1A1A'
                  }}>
                    <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}>{ach.badgeIcon || '🏆'}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.1px' }}>{ach.title}</p>
                      {ach.description && <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#71717A' }}>{ach.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMPETITIONS */}
        {activeTab === 'competitions' && (
          <div style={{ padding: '16px' }}>
            {user.eventRegistrations?.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>No competitions yet</p>
                {isOwner && (
                  <Link href="/competitions" style={{ display: 'inline-block', marginTop: '12px', fontSize: '14px', color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}>
                    Browse Competitions →
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {user.eventRegistrations?.map((reg: any) => (
                  <Link key={reg.id} href={`/competitions/${reg.event.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '10px',
                      border: '1px solid #1A1A1A'
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {reg.event.name}
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#71717A' }}>{reg.event.category}</p>
                      </div>
                      <span style={{
                        marginLeft: '12px', flexShrink: 0,
                        fontSize: '12px', fontWeight: 600,
                        color: reg.status === 'APPROVED' ? '#10B981' : reg.status === 'REJECTED' ? '#EF4444' : '#3B82F6',
                        letterSpacing: '0.02em'
                      }}>
                        {reg.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
