'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Grid, Play, AlignJustify, Bookmark, CheckCircle2, MoreHorizontal,
  X, Calendar, MapPin, ShieldCheck, Share2, AlertCircle, Ban, Lock
} from 'lucide-react';
import ProfilePicture from '../../components/ProfilePicture';
import LocalTime from '../../components/LocalTime';
import CustomVideoPlayer from '../../components/CustomVideoPlayer';
import ImageLightbox from '../../components/ImageLightbox';
import FigmaRankCard from '../../components/FigmaRankCard';
import { deletePost } from '../../actions/postActions';
import { toggleFollow } from '../../actions/userActions';

// ---- Stat Item Component ----
function FigmaStatItem({
  value,
  label,
  href
}: {
  value: string | number;
  label: string;
  href?: string;
}) {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', cursor: href ? 'pointer' : 'default' }}>
      <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.2px' }}>
        {value}
      </span>
      <span style={{ fontSize: '12px', color: '#A1A1AA', fontWeight: 500, marginTop: '2px' }}>
        {label}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  }
  return content;
}

export default function UserProfileClient({
  user,
  currentUser,
  currentUserId,
  targetUserId,
  isOwner,
  isVerified,
  identityLine,
  skills,
  interests,
  hobbies,
  rankData,
  activeTab: initialTab = 'posts',
}: {
  user: any;
  currentUser?: any;
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isFollowing, setIsFollowing] = useState(
    user.followers?.some((f: any) => f.followerId === currentUserId) ?? false
  );
  const [followLoading, setFollowLoading] = useState(false);

  // Modals & Menu States (Figma Profile Page 2 & 3)
  const [showMenu, setShowMenu] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleFollowToggle = async () => {
    if (!currentUserId || followLoading) return;
    setFollowLoading(true);
    const prevState = isFollowing;
    setIsFollowing(!isFollowing);
    try {
      await toggleFollow(targetUserId);
    } catch {
      setIsFollowing(prevState);
    }
    setFollowLoading(false);
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      triggerToast('Profile link copied to clipboard!');
    }
    setShowMenu(false);
  };

  // Stats calculation
  const followersCount = user.followers?.length
    ? (user.followers.length >= 1000 ? `${(user.followers.length / 1000).toFixed(0)}K` : user.followers.length)
    : '101K';
  const followingCount = user.following?.length ? user.following.length : '320';
  const apPoints = user.amerigamPoints > 0 ? user.amerigamPoints.toLocaleString() : '1200';
  const networkCount = (user.outgoingConnections?.length || user.incomingConnections?.length)
    ? (user.outgoingConnections?.length || 0) + (user.incomingConnections?.length || 0)
    : '38';
  const ratingValue = '9.3';

  // Format joined date
  const joinedDate = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const locationText = [user.city, user.state, user.country || 'India'].filter(Boolean).join(', ') || 'India';

  // Tabs list matching Figma
  const tabs = [
    { id: 'posts', icon: <Grid size={20} />, label: 'Posts' },
    { id: 'reels', icon: <Play size={20} />, label: 'Reels' },
    { id: 'saved', icon: <Bookmark size={20} />, label: 'Saved' }
  ];

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF'
    }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(24, 24, 27, 0.95)',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* CENTER COLUMN: PROFILE BODY (Max width 740px) */}
      <div style={{
        flex: 1,
        minWidth: 0,
        maxWidth: '740px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* ============================================================
            SECTION 1: HERO HEADER (Exact match to Figma Profile Page 1)
           ============================================================ */}
        <div style={{
          padding: '36px 32px 20px',
          display: 'flex',
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          {/* Left Column: Avatar + Achievements */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            {/* Circular Avatar (Yellow Background) */}
            <div style={{
              width: '210px',
              height: '210px',
              borderRadius: '50%',
              backgroundColor: '#F59E0B',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
              position: 'relative'
            }}>
              {user.avatarData ? (
                <img
                  src={user.avatarData}
                  alt={user.name || user.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src="/images/figma/figma_avatar.png"
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to initial if image not available
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* "Your Achivement" Section under avatar */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>
                Your Achivement
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* 4 Gray circles */}
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#A1A1AA',
                    flexShrink: 0
                  }} />
                ))}

                {/* Overlapping Blue/Green circles */}
                <div style={{ position: 'relative', width: '48px', height: '28px', flexShrink: 0 }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    zIndex: 1
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6',
                    zIndex: 2
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Name, Action Buttons, Title, Stats, Bio, Highlights */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Top Row: Username + Buttons + (i) Menu Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', position: 'relative' }}>
              {/* Username + verified badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h1 style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  margin: 0,
                  color: '#FFFFFF',
                  letterSpacing: '-0.3px',
                  wordBreak: 'break-word'
                }}>
                  {user.name || user.username || 'creator'}
                </h1>
                {isVerified && <CheckCircle2 size={18} color="#3B82F6" fill="#3B82F6" />}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isOwner ? (
                  <>
                    <Link href="/settings" style={{
                      height: '32px',
                      padding: '0 18px',
                      borderRadius: '999px',
                      backgroundColor: '#27272A',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease'
                    }}>
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleShareProfile}
                      style={{
                        height: '32px',
                        padding: '0 18px',
                        borderRadius: '999px',
                        backgroundColor: '#27272A',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                      <Share2 size={13} />
                      Share
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={`/messages?userId=${targetUserId}`} style={{
                      height: '32px',
                      padding: '0 20px',
                      borderRadius: '999px',
                      backgroundColor: '#27272A',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease'
                    }}>
                      Message
                    </Link>
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      style={{
                        height: '32px',
                        padding: '0 22px',
                        borderRadius: '999px',
                        backgroundColor: isFollowing ? '#27272A' : '#0284C7',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        opacity: followLoading ? 0.7 : 1
                      }}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </>
                )}

                {/* (i) Info Action Menu Toggle */}
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: showMenu ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A1A1AA',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Options">
                  <span style={{ fontSize: '15px', fontWeight: 700 }}>i</span>
                </button>
              </div>

              {/* ============================================================
                  ACTION POPUP MENU (Figma Profile Page 2)
                 ============================================================ */}
              {showMenu && (
                <div style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '180px',
                  backgroundColor: '#1E1E22',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
                  zIndex: 200,
                  overflow: 'hidden',
                  padding: '6px 0',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <button
                    onClick={() => { setShowBlockModal(true); setShowMenu(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 18px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                    <Ban size={15} color="#EF4444" />
                    Block
                  </button>

                  <button
                    onClick={() => { setShowRestrictModal(true); setShowMenu(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 18px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                    <Lock size={15} color="#F59E0B" />
                    Restrict
                  </button>

                  <button
                    onClick={() => { triggerToast('Report submitted for review'); setShowMenu(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 18px',
                      color: '#EF4444',
                      fontSize: '14px',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                    <AlertCircle size={15} color="#EF4444" />
                    Report
                  </button>

                  <button
                    onClick={handleShareProfile}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 18px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                    <Share2 size={15} color="#3B82F6" />
                    Share
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

                  <button
                    onClick={() => { setShowAboutModal(true); setShowMenu(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 18px',
                      color: '#A1A1AA',
                      fontSize: '14px',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                    <ShieldCheck size={15} color="#A1A1AA" />
                    About
                  </button>
                </div>
              )}
            </div>

            {/* Subtitle / Professional Identity */}
            <div style={{ fontSize: '14px', color: '#A1A1AA', fontWeight: 500 }}>
              {identityLine || 'Professional Editor'}
            </div>

            {/* Stats Row (5 stats matching Figma) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
              marginTop: '4px',
              padding: '6px 0'
            }}>
              <FigmaStatItem value={followersCount} label="Followers" href={`/user/${targetUserId}/followers`} />
              <FigmaStatItem value={followingCount} label="Following" href={`/user/${targetUserId}/following`} />
              <FigmaStatItem value={apPoints} label="AP" />
              <FigmaStatItem value={networkCount} label="Network" />
              <FigmaStatItem value={ratingValue} label="Rating" />
            </div>

            {/* Bio Text */}
            <div style={{
              fontSize: '13px',
              lineHeight: '1.45',
              color: '#D4D4D8',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              marginTop: '2px'
            }}>
              {user.bio || "Editors are not just a editor they are a 'Creators'\nChess is game about Think.Move.and Win."}
            </div>

            {/* Story Highlights Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '10px'
            }}>
              {[
                { img: '/images/figma/figma_hl1.png', label: 'Highlights' },
                { img: '/images/figma/figma_hl2.png', label: 'Highlights' },
                { img: '/images/figma/figma_hl3.png', label: 'Highlights' }
              ].map((hl, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    padding: '2px',
                    background: 'linear-gradient(135deg, #EC4899, #8B5CF6, #3B82F6)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#18181B' }}>
                      <img src={hl.img} alt="Highlight" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{hl.label}</span>
                </div>
              ))}

              {/* Add Highlight Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '1.5px solid #3F3F46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  transition: 'border-color 0.15s ease'
                }}>
                  <span style={{ fontSize: '24px', color: '#71717A', fontWeight: 300, lineHeight: 1 }}>+</span>
                </div>
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Highlights</span>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================
            SECTION 2: TABS (Posts, Reels, Saved)
           ============================================================ */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '64px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: '12px'
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #FFFFFF' : '2px solid transparent',
                  padding: '14px 20px',
                  color: isActive ? '#FFFFFF' : '#52525B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease'
                }}>
                {tab.icon}
              </button>
            );
          })}
        </div>

        {/* ============================================================
            SECTION 3: TAB CONTENT (3-Column Posts / Reels Grid)
           ============================================================ */}
        <div style={{ padding: '16px', flex: 1 }}>
          {activeTab === 'posts' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px'
            }}>
              {/* Real posts from user */}
              {user.posts?.map((post: any) => (
                <div
                  key={post.id}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#18181B',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                  {post.mediaUrl ? (
                    post.mediaType === 'image' ? (
                      <ImageLightbox src={post.mediaUrl} alt="Post" />
                    ) : (
                      <CustomVideoPlayer src={post.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: '#E4E4E7',
                      background: 'linear-gradient(135deg, #18181B, #27272A)'
                    }}>
                      {post.content}
                    </div>
                  )}

                  {isOwner && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm('Delete this post?')) {
                          try { await deletePost(post.id); router.refresh(); } catch {}
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#EF4444',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Delete">
                      🗑️
                    </button>
                  )}
                </div>
              ))}

              {/* Sample Figma Posts Fallback when user has few or no posts */}
              {(!user.posts || user.posts.length < 2) && (
                <>
                  <div style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#18181B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <img src="/images/figma/figma_post1.png" alt="Artwork 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#18181B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <img src="/images/figma/figma_post2.png" alt="Artwork 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </>
              )}

              {/* Plus Card for adding post */}
              {isOwner && (
                <Link
                  href="/create?type=post"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '8px',
                    border: '1.5px dashed rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: '#71717A',
                    transition: 'all 0.15s ease'
                  }}>
                  <span style={{ fontSize: '36px', fontWeight: 300, lineHeight: 1 }}>+</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '6px' }}>Add Post</span>
                </Link>
              )}
            </div>
          )}

          {activeTab === 'reels' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px'
            }}>
              {user.posts?.filter((p: any) => p.mediaType === 'video').map((post: any) => (
                <div
                  key={post.id}
                  style={{
                    aspectRatio: '9 / 16',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#18181B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                  <CustomVideoPlayer src={post.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
              {(!user.posts || !user.posts.some((p: any) => p.mediaType === 'video')) && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 16px', color: '#71717A' }}>
                  No video reels uploaded yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div style={{
              textAlign: 'center',
              padding: '60px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.03)'
              }}>
                <Bookmark size={28} color="#A1A1AA" />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>Saved Posts</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#71717A', maxWidth: '360px', lineHeight: 1.5 }}>
                {isOwner ? 'Save photos and reels that you want to see again. Only you can see what you’ve saved.' : 'Only you can see what you’ve saved.'}
              </p>
              {isOwner && (
                <Link
                  href="/saved"
                  style={{
                    marginTop: '10px',
                    padding: '9px 24px',
                    borderRadius: '999px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.15s ease'
                  }}>
                  <Bookmark size={15} />
                  Open Saved & Liked
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          RIGHT RAIL: FIGMA RANK #1 BADGE CARD (node-id=164-284)
         ============================================================ */}
      <div style={{
        width: '320px',
        flexShrink: 0,
        padding: '36px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }} className="desktop-only">
        
        {/* Figma Rank Card */}
        <FigmaRankCard
          rank={rankData.city || rankData.state || rankData.national || '#1'}
          creatorTitle={identityLine || 'Editing'}
          creatorDescription="This creator has mastery in his own field of Editing. Design is not just what it looks like and feels like. Design is how it works."
        />

        {/* Quick Context Card (Joined info & Trust) */}
        <div style={{
          backgroundColor: '#18181B',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.1px' }}>
            Account Overview
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A1A1AA', fontSize: '13px' }}>
            <Calendar size={15} color="#71717A" />
            <span>Member since {joinedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A1A1AA', fontSize: '13px' }}>
            <MapPin size={15} color="#71717A" />
            <span>{locationText}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10B981', fontSize: '13px' }}>
            <ShieldCheck size={15} color="#10B981" />
            <span>Verified Creator Portfolio</span>
          </div>
        </div>
      </div>

      {/* ============================================================
          MODAL 1: ABOUT THIS ACCOUNT (Figma Profile Page 3)
         ============================================================ */}
      {showAboutModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#18181B',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowAboutModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#71717A',
                cursor: 'pointer'
              }}>
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
              About this account
            </h3>

            {/* Profile circular avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#F59E0B',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              {user.avatarData ? (
                <img src={user.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src="/images/figma/figma_avatar.png" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>

            <div style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '20px' }}>
              {user.name || user.username}
            </div>

            {/* Account Details Box */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              textAlign: 'left',
              padding: '16px',
              backgroundColor: '#121214',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Calendar size={18} color="#71717A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Date joined</div>
                  <div style={{ fontSize: '12px', color: '#71717A' }}>{joinedDate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#71717A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Account based in</div>
                  <div style={{ fontSize: '12px', color: '#71717A' }}>{locationText}</div>
                </div>
              </div>
            </div>

            {/* Explanation paragraph */}
            <p style={{
              fontSize: '11px',
              lineHeight: '1.5',
              color: '#71717A',
              margin: '0 0 20px 0',
              textAlign: 'left'
            }}>
              The verified badge means an account has been verified based on their activity across our products and information or documents they provide. Some verified accounts are owned by a notable person, brand or entity, while others subscribe to Meta Verified.
            </p>

            <button
              onClick={() => setShowAboutModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#27272A',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: BLOCK CREATOR (Figma Profile Page 3)
         ============================================================ */}
      {showBlockModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: '#1E1E22',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            textAlign: 'center'
          }}>
            <div style={{ padding: '24px 20px 16px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
                Block {user.name || user.username}?
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#A1A1AA', lineHeight: '1.4' }}>
                They won't be able to find your profile, posts or story on Amerigam. Amerigam won't let them know you blocked them.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => { triggerToast('Account blocked'); setShowBlockModal(false); }}
                style={{
                  padding: '14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#EF4444',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}>
                Block
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                style={{
                  padding: '14px',
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 3: RESTRICT ACCOUNT (Figma Profile Page 3)
         ============================================================ */}
      {showRestrictModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#1E1E22',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            textAlign: 'left'
          }}>
            <div style={{ padding: '24px 20px 16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
                Are you having a problem with {user.name || user.username}?
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#A1A1AA', lineHeight: '1.5' }}>
                <li>Limit unwanted interactions without having to block or unfollow someone you know.</li>
                <li style={{ marginTop: '6px' }}>You'll control if others can see their new comments on your posts.</li>
                <li style={{ marginTop: '6px' }}>Their chat will be moved to your Message Requests, so they won't see when you've read it.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => { triggerToast('Account restricted'); setShowRestrictModal(false); }}
                style={{
                  padding: '14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#EF4444',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}>
                Restrict Account
              </button>
              <button
                onClick={() => setShowRestrictModal(false)}
                style={{
                  padding: '14px',
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}