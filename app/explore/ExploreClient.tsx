'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Play,
  Heart,
  MessageCircle,
  Share2,
  Building2,
  Trophy,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  UserCheck,
  UserPlus,
  Compass
} from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';
import { toggleFollow } from '../actions/userActions';
import { toggleLike } from '../actions/postActions';

export default function ExploreClient({
  initialReels = [],
  currentUser,
  searchUsers = [],
  searchBusinesses = [],
  searchCompetitions = [],
  searchReels = [],
  initialQuery = ''
}: {
  initialReels: any[];
  currentUser: any;
  searchUsers?: any[];
  searchBusinesses?: any[];
  searchCompetitions?: any[];
  searchReels?: any[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activeSearchFilter, setActiveSearchFilter] = useState<'all' | 'people' | 'businesses' | 'reels' | 'competitions'>('all');
  const [activeReel, setActiveReel] = useState<any | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const isSearching = query.trim().length > 0;

  const handleFollowToggle = async (targetId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = !currentStatus;
    setFollowingMap((prev) => ({ ...prev, [targetId]: newStatus }));
    try {
      await toggleFollow(targetId);
    } catch {
      setFollowingMap((prev) => ({ ...prev, [targetId]: currentStatus }));
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ========================================================
          TOP SEARCH BAR (Centered Frosted Pill matching Figma 18)
         ======================================================== */}
      <div style={{
        width: '100%',
        padding: '18px 0 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/explore?q=${encodeURIComponent(query)}`);
          }}
          style={{ width: '100%', maxWidth: '480px', margin: 0 }}
        >
          <div
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '999px',
              backgroundColor: 'rgba(26, 27, 32, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              gap: '12px',
              boxSizing: 'border-box'
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators, reels, businesses, competitions..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 400,
                width: '100%',
                outline: 'none'
              }}
            />
            {query.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  router.push('/explore');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#A1A1AA',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            ) : (
              <button
                type="submit"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#A1A1AA',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Search size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ========================================================
          SUB-TABS: Explore | Network (Exact Reference Blueprint)
         ======================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '20px',
        paddingLeft: '4px'
      }}>
        {/* Active Tab: Explore */}
        <div style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#FFFFFF',
          position: 'relative',
          letterSpacing: '0.2px'
        }}>
          Explore
          <span style={{
            position: 'absolute',
            bottom: '-6px',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: '#FFFFFF',
            borderRadius: '999px'
          }} />
        </div>

        {/* Inactive Tab: Network */}
        <Link
          href="/network"
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: '#71717A',
            textDecoration: 'none',
            letterSpacing: '0.2px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
        >
          Network
        </Link>
      </div>

      {/* ========================================================
          SEARCH VIEW: If user is actively searching
         ======================================================== */}
      {isSearching ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search Category Filter Pills */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'people', label: `People (${searchUsers.length})` },
              { id: 'businesses', label: `Businesses (${searchBusinesses.length})` },
              { id: 'reels', label: `Reels (${searchReels.length})` },
              { id: 'competitions', label: `Competitions (${searchCompetitions.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSearchFilter(tab.id as any)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '999px',
                  border: activeSearchFilter === tab.id ? '1px solid #0284C7' : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: activeSearchFilter === tab.id ? 'rgba(2, 132, 199, 0.18)' : '#18181B',
                  color: activeSearchFilter === tab.id ? '#38BDF8' : '#A1A1AA',
                  fontSize: '13px',
                  fontWeight: activeSearchFilter === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section: Businesses matching search */}
          {(activeSearchFilter === 'all' || activeSearchFilter === 'businesses') && searchBusinesses.length > 0 && (
            <div style={{
              backgroundColor: '#18181B',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#38BDF8' }}>
                <Building2 size={18} />
                <span>Verified Businesses & Startups</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {searchBusinesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/user/${biz.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <ProfilePicture src={biz.avatarData} name={biz.name || biz.username} size={44} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {biz.name || biz.username}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(6, 182, 212, 0.2)',
                            color: '#22D3EE',
                            border: '1px solid rgba(6, 182, 212, 0.4)'
                          }}>
                            Business
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '2px' }}>
                          @{biz.username || 'company'} • {biz.businessProfile?.industry || 'Enterprise'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section: People / Creators matching search */}
          {(activeSearchFilter === 'all' || activeSearchFilter === 'people') && searchUsers.length > 0 && (
            <div style={{
              backgroundColor: '#18181B',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                People & Creators ({searchUsers.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {searchUsers.map((user) => {
                  const isFollowing = followingMap[user.id] ?? user.followers?.some((f: any) => f.followerId === currentUser?.id);
                  return (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <Link
                        href={`/user/${user.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, textDecoration: 'none' }}
                      >
                        <ProfilePicture src={user.avatarData} name={user.name || user.username} size={42} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.name || user.username}
                          </div>
                          <div style={{ fontSize: '11px', color: '#A1A1AA' }}>
                            @{user.username} • {user.personalProfile?.mainIdentity || user.creatorProfile?.creatorType || user.accountType}
                          </div>
                        </div>
                      </Link>

                      {currentUser?.id !== user.id && (
                        <button
                          onClick={(e) => handleFollowToggle(user.id, isFollowing, e)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '999px',
                            backgroundColor: isFollowing ? '#27272A' : '#0284C7',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Reels matching search */}
          {(activeSearchFilter === 'all' || activeSearchFilter === 'reels') && (
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px', paddingLeft: '4px' }}>
                Reels matching &quot;{query}&quot; ({searchReels.length})
              </div>
              {searchReels.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px'
                }}>
                  {searchReels.map((reel) => (
                    <ReelCard key={reel.id} reel={reel} onOpen={() => setActiveReel(reel)} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#71717A', fontSize: '14px' }}>
                  No video reels found matching &quot;{query}&quot;.
                </div>
              )}
            </div>
          )}

          {/* Section: Competitions matching search */}
          {(activeSearchFilter === 'all' || activeSearchFilter === 'competitions') && searchCompetitions.length > 0 && (
            <div style={{
              backgroundColor: '#18181B',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#F59E0B' }}>
                <Trophy size={18} />
                <span>Competitions & Events</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {searchCompetitions.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/competitions/${comp.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      textDecoration: 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{comp.name}</div>
                      <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '2px' }}>
                        {comp.category} • {comp._count?.registrations || 0} enrolled
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#EAB308', fontWeight: 600 }}>View</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ========================================================
            DEFAULT EXPLORE VIEW: 4-COLUMN REELS GRID (Image 2)
           ======================================================== */
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }} className="explore-reels-grid">
            {initialReels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} onOpen={() => setActiveReel(reel)} />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          FULL SCREEN REEL VIEWER MODAL
         ======================================================== */}
      {activeReel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setActiveReel(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              height: '85vh',
              maxHeight: '740px',
              backgroundColor: '#000000',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveReel(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20
              }}
            >
              <X size={20} />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Video Player */}
            <video
              src={activeReel.mediaUrl}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Bottom Details Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px 20px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.95) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 10
            }}>
              {/* Creator Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link
                  href={`/user/${activeReel.author?.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
                >
                  <ProfilePicture src={activeReel.author?.avatarData} name={activeReel.author?.name || activeReel.author?.username} size={38} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                      {activeReel.author?.name || activeReel.author?.username || 'Creator'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#A1A1AA' }}>
                      @{activeReel.author?.username || 'creator'}
                    </div>
                  </div>
                </Link>

                <Link
                  href={`/feed`}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Open in Feed
                </Link>
              </div>

              {/* Caption */}
              {activeReel.content && (
                <div style={{ fontSize: '13px', color: '#E4E4E7', lineHeight: '1.4', maxHeight: '42px', overflow: 'hidden' }}>
                  {activeReel.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ---- Vertical Reel Card (4-column Grid Item matching Image 2) ----
function ReelCard({ reel, onOpen }: { reel: any; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Extract author & fallback
  const authorName = reel.author?.name || reel.author?.username || 'Creator';
  const authorHandle = reel.author?.username ? `@${reel.author.username}` : '@creator';
  const likeCount = reel.likes?.length || reel.likesCount || 0;

  // Background fallback gradients matching reference
  const bgGradients = [
    'linear-gradient(180deg, #991B1B 0%, #450A0A 100%)',
    'linear-gradient(180deg, #854D0E 0%, #422006 100%)',
    'linear-gradient(180deg, #166534 0%, #052E16 100%)',
    'linear-gradient(180deg, #0F766E 0%, #134E4A 100%)',
    'linear-gradient(180deg, #1E40AF 0%, #172554 100%)',
    'linear-gradient(180deg, #6B21A8 0%, #3B0764 100%)',
    'linear-gradient(180deg, #9D174D 0%, #500724 100%)',
    'linear-gradient(180deg, #374151 0%, #111827 100%)',
  ];
  const bg = bgGradients[Math.abs((reel.id || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % bgGradients.length];

  return (
    <div
      onClick={onOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        aspectRatio: '9 / 14',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        background: bg,
        border: hovered ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: hovered ? '0 12px 32px rgba(0, 0, 0, 0.7)' : '0 6px 18px rgba(0, 0, 0, 0.4)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
        boxSizing: 'border-box'
      }}
    >
      {/* Video element if mediaUrl exists */}
      {reel.mediaUrl ? (
        <video
          ref={videoRef}
          src={reel.mediaUrl}
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: '13px',
          fontWeight: 500
        }}>
          {reel.content || 'Inspiring Reel'}
        </div>
      )}

      {/* Floating Center Play Icon on Hover */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: hovered ? 1 : 0.65,
          transition: 'all 0.2s ease',
          pointerEvents: 'none'
        }}
      >
        <Play size={20} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: '3px' }} />
      </div>

      {/* Bottom Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 12px 12px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {/* Author Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ProfilePicture src={reel.author?.avatarData} name={authorName} size={26} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {authorName}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {authorHandle}
            </div>
          </div>
        </div>

        {/* Likes Count & Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFFFFF', fontSize: '11px', fontWeight: 600 }}>
            <Heart size={12} fill="#EF4444" color="#EF4444" />
            <span>{likeCount}</span>
          </div>

          {reel.category && (
            <span style={{
              fontSize: '9.5px',
              padding: '2px 6px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(4px)',
              color: '#FFFFFF'
            }}>
              {reel.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
