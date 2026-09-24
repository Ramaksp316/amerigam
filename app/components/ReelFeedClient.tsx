'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Search,
  Activity,
  Globe,
  Bell,
  Settings,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Play,
  X,
  Send,
  Check,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { toggleLike, addComment, toggleBookmark } from '../actions/postActions';
import { toggleFollow } from '../actions/userActions';

// Helper to format counts cleanly (e.g. 0 -> '0', 134 -> '134', 1500 -> '1.5k', 55000 -> '55k')
function formatCount(num: number | undefined | null): string {
  if (num === undefined || num === null || num === 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (num >= 10_000) return `${(num / 1000).toFixed(1).replace('.0', '')}k`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.0', '')}k`;
  return String(num);
}

export default function ReelFeedClient({
  reels = [],
  currentUserId,
  currentUserAvatar,
  currentUserName
}: {
  reels: any[];
  currentUserId?: string;
  currentUserAvatar?: string | null;
  currentUserName?: string;
}) {
  // Fallback reels only if database has 0 reels
  const fallbackReels = [
    {
      id: 'demo-reel-1',
      content: "Read this 👇.. Don't worry warriors just follow me.\nFull guideline 🗿\nFor Join winter ar",
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      mediaType: 'video',
      author: {
        id: 'creator-demo',
        name: 'Creator',
        username: 'creator',
        avatarData: null,
        followers: []
      },
      _count: { likes: 0, comments: 0 },
      likes: [],
      comments: []
    }
  ];

  const displayReels = reels && reels.length > 0 ? reels : fallbackReels;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCommentsReel, setActiveCommentsReel] = useState<any | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  }, []);

  const scrollToReel = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= displayReels.length) return;
    const el = reelRefs.current[targetIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveIndex(targetIndex);
    }
  }, [displayReels.length]);

  // IntersectionObserver for tracking active reel on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) {
              setActiveIndex(idx);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.55
      }
    );

    reelRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [displayReels.length]);

  // Keyboard navigation: ArrowUp, ArrowDown, M (mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToReel(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToReel(activeIndex - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsGlobalMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, scrollToReel]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>

      {/* ========================================================
          1. TOP NAVBAR (matching media_1789994912197.png)
         ======================================================== */}
      <header style={{
        height: '60px',
        padding: '0 32px',
        borderBottom: '1px solid #18181B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#000000',
        zIndex: 50,
        flexShrink: 0
      }}>
        {/* Left: Amerigam Logo */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/amerigam-logo-transparent.png"
            alt="Amerigam"
            width={116}
            height={28}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>

        {/* Center: Search pill bar */}
        <div style={{
          width: '420px',
          maxWidth: '40vw',
          height: '38px',
          borderRadius: '999px',
          backgroundColor: '#18181B',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Search"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              width: '100%',
              outline: 'none'
            }}
          />
          <Search size={16} color="#71717A" />
        </div>

        {/* Right: 4 Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <Link href="/ranking" style={{ color: '#D4D4D8', display: 'flex', transition: 'color 0.15s' }} title="Activity / Rankings">
            <Activity size={20} />
          </Link>
          <Link href="/search" style={{ color: '#D4D4D8', display: 'flex', transition: 'color 0.15s' }} title="Explore">
            <Globe size={20} />
          </Link>
          <Link href="/notifications" style={{ color: '#D4D4D8', display: 'flex', transition: 'color 0.15s' }} title="Notifications">
            <Bell size={20} />
          </Link>
          <Link href="/settings" style={{ color: '#D4D4D8', display: 'flex', transition: 'color 0.15s' }} title="Settings">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* ========================================================
          2. VERTICAL SNAP-SCROLL CONTAINER FOR ALL REELS
         ======================================================== */}
      <main
        ref={containerRef}
        className="reel-scroll-snap-feed"
      >
        {displayReels.map((reel, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={reel.id || index}
              ref={(el) => {
                reelRefs.current[index] = el;
              }}
              data-index={index}
              className="reel-snap-item"
            >
              <SingleReelCard
                reel={reel}
                index={index}
                isActive={isActive}
                currentUserId={currentUserId}
                isMuted={isGlobalMuted}
                toggleMute={() => setIsGlobalMuted((prev) => !prev)}
                onOpenComments={(targetReel) => setActiveCommentsReel(targetReel)}
                onShowToast={showToast}
              />
            </div>
          );
        })}
      </main>

      {/* ========================================================
          3. FLOATING DESKTOP UP / DOWN NAVIGATION ARROWS
         ======================================================== */}
      <div style={{
        position: 'fixed',
        right: '28px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 45
      }} className="desktop-only">
        <button
          onClick={() => scrollToReel(activeIndex - 1)}
          disabled={activeIndex === 0}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(24, 24, 27, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: activeIndex === 0 ? '#52525B' : '#FFFFFF',
            cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            transition: 'all 0.15s ease',
            opacity: activeIndex === 0 ? 0.35 : 1
          }}
          title="Previous Reel (Up Arrow)"
        >
          <ChevronUp size={22} />
        </button>

        <button
          onClick={() => scrollToReel(activeIndex + 1)}
          disabled={activeIndex === displayReels.length - 1}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(24, 24, 27, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: activeIndex === displayReels.length - 1 ? '#52525B' : '#FFFFFF',
            cursor: activeIndex === displayReels.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            transition: 'all 0.15s ease',
            opacity: activeIndex === displayReels.length - 1 ? 0.35 : 1
          }}
          title="Next Reel (Down Arrow)"
        >
          <ChevronDown size={22} />
        </button>
      </div>

      {/* ========================================================
          4. COMMENTS SLIDE-OVER DRAWER
         ======================================================== */}
      {activeCommentsReel && (
        <CommentsDrawer
          reel={activeCommentsReel}
          currentUserId={currentUserId}
          currentUserAvatar={currentUserAvatar}
          currentUserName={currentUserName}
          onClose={() => setActiveCommentsReel(null)}
          onCommentAdded={(newComment) => {
            // Update reel comment count dynamically
            activeCommentsReel._count = {
              ...activeCommentsReel._count,
              comments: (activeCommentsReel._count?.comments || 0) + 1
            };
            if (!activeCommentsReel.comments) activeCommentsReel.comments = [];
            if (!activeCommentsReel.comments.some((c: any) => c.id === newComment.id)) {
              activeCommentsReel.comments.unshift(newComment);
            }
          }}
        />
      )}

      {/* ========================================================
          5. TOAST NOTIFICATION
         ======================================================== */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1E1E22',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          padding: '10px 22px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
          zIndex: 100,
          animation: 'slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {toastMessage}
        </div>
      )}

    </div>
  );
}

/* =========================================================================
   SINGLE REEL CARD COMPONENT
   Strictly matches media_1789994912197.png:
   - Left: Creator Profile (Avatar, Name, Follow button, Multi-line Caption)
   - Center: 9:16 Video Card that fits within viewport (no overflow!)
   - Right: Action Icons (Heart, Comment, Share, Bookmark, More with REAL numbers)
   ========================================================================= */
function SingleReelCard({
  reel,
  index,
  isActive,
  currentUserId,
  isMuted,
  toggleMute,
  onOpenComments,
  onShowToast
}: {
  reel: any;
  index: number;
  isActive: boolean;
  currentUserId?: string;
  isMuted: boolean;
  toggleMute: () => void;
  onOpenComments: (reel: any) => void;
  onShowToast: (msg: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(
    reel.likes && reel.likes.length > 0 ? true : false
  );
  // Real database counts — no hardcoded 55k or 20.3k!
  const [likeCount, setLikeCount] = useState<number>(reel._count?.likes ?? 0);
  const [commentCount, setCommentCount] = useState<number>(reel._count?.comments ?? 0);
  const [shareCount, setShareCount] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(
    (reel.bookmarks && reel.bookmarks.length > 0) || false
  );
  const [isFollowing, setIsFollowing] = useState(
    reel.author?.followers && reel.author.followers.length > 0 ? true : false
  );
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Autoplay / Pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, isMuted]);

  // Handle Play/Pause toggle on video click
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle Like
  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (reel.id && !reel.id.startsWith('demo-')) {
      try {
        await toggleLike(reel.id);
      } catch (e) {}
    }
  };

  // Handle Follow
  const handleFollow = async () => {
    if (!reel.author?.id) return;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    try {
      await toggleFollow(reel.author.id);
      onShowToast(nextState ? `Following @${reel.author?.username || 'creator'}` : `Unfollowed @${reel.author?.username || 'creator'}`);
    } catch (e) {}
  };

  // Handle Share
  const handleShare = async () => {
    setShareCount((prev) => prev + 1);
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${reel.id}` : '';
    let shared = false;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Reel by @${reel.author?.username || 'creator'} on Amerigam`,
          url: shareUrl
        });
        shared = true;
        onShowToast('Shared successfully! 🚀');
      } catch (e) {
        // Fallback to clipboard
      }
    }
    if (!shared) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = shareUrl;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        onShowToast('Link copied to clipboard! 📋');
      } catch (e) {
        onShowToast('Link copied! 📋');
      }
    }
  };

  // Handle Save / Bookmark
  const handleBookmark = async () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    onShowToast(nextState ? 'Reel saved! 🔖' : 'Removed from saved');
    try {
      if (reel.id && !reel.id.startsWith('demo-')) {
        await toggleBookmark(reel.id);
      }
    } catch (e) {
      setIsSaved(!nextState);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '18px',
      width: '100%',
      margin: '0 auto',
      padding: '8px 16px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>

      {/* ========================================================
          LEFT COLUMN: CREATOR INFO & CAPTION (Desktop, matching Reels.png)
         ======================================================== */}
      <div
        className="desktop-only"
        style={{
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          paddingBottom: '20px',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        {/* Creator Avatar + Name + Follow Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Link href={`/user/${reel.author?.id}`} style={{ textDecoration: 'none', display: 'flex', flexShrink: 0 }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#27272A',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {reel.author?.avatarData ? (
                <img
                  src={reel.author.avatarData}
                  alt={reel.author?.name || 'Creator'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700 }}>
                  {(reel.author?.name || reel.author?.username || 'C')[0].toUpperCase()}
                </span>
              )}
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href={`/user/${reel.author?.id}`}
              style={{
                textDecoration: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px'
              }}
            >
              {reel.author?.name || reel.author?.username || 'Creator'}
            </Link>

            {currentUserId !== reel.author?.id && (
              <button
                onClick={handleFollow}
                style={{
                  backgroundColor: isFollowing ? 'rgba(255,255,255,0.15)' : '#0284C7',
                  color: '#FFFFFF',
                  border: isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  borderRadius: '999px',
                  padding: '5px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Multiline caption */}
        {reel.content && (
          <div style={{ maxWidth: '280px' }}>
            <p style={{
              fontSize: '13px',
              color: '#F4F4F5',
              lineHeight: '1.5',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              display: isCaptionExpanded ? 'block' : '-webkit-box',
              WebkitLineClamp: isCaptionExpanded ? 'unset' : 4,
              WebkitBoxOrient: 'vertical',
              overflow: isCaptionExpanded ? 'visible' : 'hidden'
            }}>
              {reel.content}
            </p>
            {reel.content.length > 120 && (
              <button
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A1A1AA',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: 0,
                  marginTop: '4px',
                  cursor: 'pointer'
                }}
              >
                {isCaptionExpanded ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          CENTER: 9:16 VERTICAL VIDEO CARD (Instagram style)
         ======================================================== */}
      <div style={{
        height: 'min(calc(100vh - 100px), 640px)',
        maxHeight: '640px',
        aspectRatio: '9 / 16',
        borderRadius: '20px',
        backgroundColor: '#121215',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {reel.mediaUrl ? (
          <video
            ref={videoRef}
            src={reel.mediaUrl}
            loop
            playsInline
            muted={isMuted}
            onClick={handleTogglePlay}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer'
            }}
          />
        ) : (
          <div style={{ color: '#71717A', fontSize: '13px' }}>No video available</div>
        )}

        {/* Play Icon overlay when paused */}
        {!isPlaying && (
          <div
            onClick={handleTogglePlay}
            style={{
              position: 'absolute',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(6px)',
              pointerEvents: 'auto',
              zIndex: 10
            }}
          >
            <Play size={30} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: '4px' }} />
          </div>
        )}

        {/* Mute / Unmute Button in top right */}
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            zIndex: 15,
            transition: 'transform 0.15s ease'
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Mobile-Only Creator Overlay (Shown inside video card on phones) */}
        <div
          className="mobile-only"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '28px 16px 18px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 60%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 15,
            pointerEvents: 'none'
          }}
        >
          {/* Creator Avatar (Clean, NO yellow ring) + Username + Follow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
            <Link href={`/user/${reel.author?.id}`} style={{ textDecoration: 'none', display: 'flex', flexShrink: 0 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#27272A',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {reel.author?.avatarData ? (
                  <img
                    src={reel.author.avatarData}
                    alt={reel.author?.name || 'Creator'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700 }}>
                    {(reel.author?.name || reel.author?.username || 'C')[0].toUpperCase()}
                  </span>
                )}
              </div>
            </Link>

            <Link
              href={`/user/${reel.author?.id}`}
              style={{
                textDecoration: 'none',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '140px'
              }}
            >
              @{reel.author?.username || reel.author?.name || 'creator'}
            </Link>

            {currentUserId !== reel.author?.id && (
              <button
                onClick={handleFollow}
                style={{
                  backgroundColor: isFollowing ? 'rgba(255,255,255,0.15)' : '#0284C7',
                  color: '#FFFFFF',
                  border: isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  borderRadius: '999px',
                  padding: '4px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Caption */}
          {reel.content && (
            <div style={{ pointerEvents: 'auto' }}>
              <p style={{
                fontSize: '13px',
                color: '#F4F4F5',
                lineHeight: '1.45',
                margin: 0,
                wordBreak: 'break-word',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                display: isCaptionExpanded ? 'block' : '-webkit-box',
                WebkitLineClamp: isCaptionExpanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: isCaptionExpanded ? 'visible' : 'hidden'
              }}>
                {reel.content}
              </p>
              {reel.content.length > 80 && (
                <button
                  onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#A1A1AA',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: 0,
                    marginTop: '2px',
                    cursor: 'pointer'
                  }}
                >
                  {isCaptionExpanded ? 'less' : 'more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: ACTION BUTTONS (Symmetrically 280px, matching Reels.png)
         ======================================================== */}
      <div
        className="reel-side-rail-right"
        style={{
          width: '280px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          paddingBottom: '20px',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <div style={{
          width: '56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          position: 'relative'
        }}>

          {/* Like */}
          <button
            onClick={handleLike}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: 0
            }}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <div style={{
              transform: isLiked ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <Heart
                size={26}
                color={isLiked ? '#EF4444' : '#FFFFFF'}
                fill={isLiked ? '#EF4444' : 'transparent'}
                strokeWidth={1.8}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#D4D4D8', fontWeight: 600 }}>
              {formatCount(likeCount)}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => onOpenComments(reel)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: 0
            }}
            title="Comments"
          >
            <MessageCircle size={26} color="#FFFFFF" strokeWidth={1.8} />
            <span style={{ fontSize: '11px', color: '#D4D4D8', fontWeight: 600 }}>
              {formatCount(commentCount)}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: 0
            }}
            title="Share"
          >
            <Share2 size={26} color="#FFFFFF" strokeWidth={1.8} />
            <span style={{ fontSize: '11px', color: '#D4D4D8', fontWeight: 600 }}>
              {formatCount(shareCount)}
            </span>
          </button>

          {/* Bookmark / Save */}
          <button
            onClick={handleBookmark}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              padding: '4px'
            }}
            title={isSaved ? 'Remove from saved' : 'Save'}
          >
            <Bookmark
              size={26}
              color="#FFFFFF"
              fill={isSaved ? '#FFFFFF' : 'transparent'}
              strokeWidth={1.8}
            />
          </button>

          {/* More Options (···) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
                padding: '4px'
              }}
              title="More"
            >
              <MoreHorizontal size={26} color="#FFFFFF" strokeWidth={1.8} />
            </button>

            {/* More popover menu */}
            {showMoreMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: '8px',
                  backgroundColor: '#1E1E22',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '6px',
                  minWidth: '150px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.85)',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <button
                  onClick={() => {
                    handleShare();
                    setShowMoreMenu(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Copy link
                </button>
                <Link
                  href={`/user/${reel.author?.id}`}
                  onClick={() => setShowMoreMenu(false)}
                  style={{
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  View profile
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

/* =========================================================================
   COMMENTS DRAWER
   Shows reel comments & allows posting new comment in real-time
   ========================================================================= */
function CommentsDrawer({
  reel,
  currentUserId,
  currentUserAvatar,
  currentUserName,
  onClose,
  onCommentAdded
}: {
  reel: any;
  currentUserId?: string;
  currentUserAvatar?: string | null;
  currentUserName?: string;
  onClose: () => void;
  onCommentAdded: (comment: any) => void;
}) {
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>(reel.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Sync if reel comments change
  useEffect(() => {
    setCommentsList(reel.comments || []);
  }, [reel.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInput.trim();
    if (!text || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const newCommentObj = {
      id: tempId,
      content: text,
      createdAt: new Date(),
      author: {
        id: currentUserId || 'me',
        name: currentUserName || 'You',
        username: currentUserName || 'you',
        avatarData: currentUserAvatar || null
      }
    };

    setCommentsList((prev) => [newCommentObj, ...prev.filter(c => c.id !== tempId)]);
    setCommentInput('');

    try {
      if (reel.id && !reel.id.startsWith('demo-')) {
        const res = await addComment(reel.id, text);
        if (res?.success && res.comment) {
          // Replace temp placeholder with real comment and ensure no duplicate
          setCommentsList((prev) => {
            const filtered = prev.filter(c => c.id !== tempId && c.id !== res.comment.id);
            return [res.comment, ...filtered];
          });
          onCommentAdded(res.comment);
        }
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Deduplicate comments list by ID
  const uniqueComments = Array.from(new Map(commentsList.map(c => [c.id, c])).values());

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: 0,
      bottom: 0,
      width: '380px',
      maxWidth: '100vw',
      backgroundColor: '#121215',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 90,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-12px 0 36px rgba(0,0,0,0.85)',
      animation: 'slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>Comments</span>
          <span style={{ fontSize: '13px', color: '#71717A' }}>({uniqueComments.length})</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#A1A1AA',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Comments List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {uniqueComments.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#71717A',
            gap: '8px'
          }}>
            <MessageCircle size={36} strokeWidth={1.5} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>No comments yet</span>
            <span style={{ fontSize: '12px' }}>Be the first to comment!</span>
          </div>
        ) : (
          uniqueComments.map((c, i) => (
            <div key={c.id || i} style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#27272A',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {c.author?.avatarData ? (
                  <img src={c.author.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#E4E4E7', fontSize: '13px', fontWeight: 700 }}>
                    {c.author?.name?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                  {c.author?.name || c.author?.username || 'User'}
                </span>
                <p style={{ fontSize: '13px', color: '#D4D4D8', lineHeight: '1.4', margin: 0, wordBreak: 'break-word' }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#16161A',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <input
          type="text"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="Add a comment..."
          style={{
            flex: 1,
            backgroundColor: '#1F1F24',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            padding: '10px 16px',
            fontSize: '13px',
            color: '#FFFFFF',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!commentInput.trim() || isSubmitting}
          style={{
            backgroundColor: commentInput.trim() ? '#0284C7' : '#27272A',
            color: commentInput.trim() ? '#FFFFFF' : '#71717A',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: commentInput.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
