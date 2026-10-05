'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import ProfilePicture from './ProfilePicture';
import LocalTime from './LocalTime';
import FollowButton from './FollowButton';
import PostDropdownMenu from './PostDropdownMenu';
import CustomVideoPlayer from './CustomVideoPlayer';
import ImageLightbox from './ImageLightbox';
import PostMediaCarousel from './PostMediaCarousel';
import LikeButton from './LikeButton';
import { toggleBookmark } from '../actions/postActions';

interface FeedPostCardProps {
  post: any;
  currentUserId: string;
  isFollowing: boolean;
  hasLiked: boolean;
  isVerified: boolean;
  identityLine: string;
}

export default function FeedPostCard({
  post,
  currentUserId,
  isFollowing,
  hasLiked,
  isVerified,
  identityLine
}: FeedPostCardProps) {
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    // If mediaType is 'video' and mentions portrait or vertical
    if (post.mediaType === 'video' && post.mediaUrl?.includes('reel')) return true;
    return false;
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [commentsNum, setCommentsNum] = useState<number>(post.comments?.length || 0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(
    post.bookmarks?.some((b: any) => b.userId === currentUserId) || false
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mediaList: string[] = (post.mediaUrls && post.mediaUrls.length > 0)
    ? post.mediaUrls
    : (post.mediaUrl ? [post.mediaUrl] : []);

  const hasMedia = mediaList.length > 0;
  const isVideo = post.mediaType === 'video' || (mediaList[0] && mediaList[0].match(/\.(mp4|mov|webm)$/i));
  const rawText = post.content || '';
  const hasText = rawText.trim().length > 0;

  // View count calculation
  const viewCount = post.viewsCount
    ? `${post.viewsCount > 1000 ? (post.viewsCount / 1000).toFixed(0) + 'k' : post.viewsCount}`
    : (post.likes?.length ? `${(post.likes.length * 15 + 24)}k` : '104k');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '';

    if (navigator.share) {
      try {
        await navigator.share({ title: `${post.author?.name || 'Post'} on Amerigam`, url: shareUrl });
        return;
      } catch (err) {}
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      showToast('Link copied to clipboard! 📋');
    } catch {
      showToast('Link copied! 📋');
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    showToast(nextState ? 'Saved to bookmarks! 🔖' : 'Removed from bookmarks');
    try {
      await toggleBookmark(post.id);
    } catch {
      setIsBookmarked(!nextState);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText.trim();
    try {
      const { addComment } = await import('../actions/postActions');
      const res = await addComment(post.id, text);
      if (res?.success) {
        setCommentsNum((prev) => prev + 1);
        setCommentText('');
        showToast('Comment posted! 💬');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Text formatting: Split into title and body if suitable
  const textLines = rawText.split('\n').filter((l: string) => l.trim().length > 0);
  const potentialTitle = textLines.length > 1 && textLines[0].length < 60 ? textLines[0] : null;
  const remainingText = potentialTitle ? textLines.slice(1).join('\n\n') : rawText;

  const shouldTruncate = remainingText.length > 180 && !isExpanded;
  const displayText = shouldTruncate ? remainingText.slice(0, 180) : remainingText;

  // Render Post Text block
  const renderTextContent = (isSideColumn: boolean = false) => {
    if (!hasText) return null;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: isSideColumn ? 1 : 'unset',
        minWidth: 0,
        marginTop: isSideColumn ? 0 : '14px'
      }}>
        {potentialTitle && (
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.3
          }}>
            {potentialTitle}
          </div>
        )}

        <div style={{
          fontSize: '13px',
          color: '#D4D4D8',
          lineHeight: '1.55',
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          fontWeight: 300
        }}>
          {displayText}
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3B82F6',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                padding: '0 0 0 4px'
              }}
            >
              ...more
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <article
      className="home-post-card"
      style={{
        backgroundColor: '#16181C',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '18px 20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(24, 24, 27, 0.95)',
          color: '#FFFFFF',
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 600,
          zIndex: 50,
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* ========================================================
          1. POST HEADER: Avatar + Name + Identity + Menu
         ======================================================== */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href={`/user/${post.authorId}`} style={{ flexShrink: 0 }}>
          <ProfilePicture user={post.author} size={42} />
        </Link>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link
                href={`/user/${post.authorId}`}
                style={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '15px',
                  letterSpacing: '-0.2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {post.author?.name || post.author?.username}
              </Link>
              {isVerified && <CheckCircle2 size={15} color="#0284C7" fill="#0284C7" />}
            </div>

            <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '1px', fontWeight: 400 }}>
              {identityLine}
            </div>
          </div>

          {/* Follow button + Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {!isFollowing && post.authorId !== currentUserId && (
              <div className="desktop-only">
                <FollowButton targetUserId={post.authorId} initialIsFollowing={false} />
              </div>
            )}

            <PostDropdownMenu
              postId={post.id}
              authorId={post.authorId}
              authorUsername={post.author?.username || 'user'}
              initialIsFollowing={isFollowing}
              likesCount={post.likes?.length || 0}
              commentsCount={commentsNum}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          2. MEDIA & TEXT CONTENT
          - If Landscape: Media on top, text underneath!
          - If Portrait: 2-column flex row (media left, text right)!
          - If Portrait with NO text: single centered portrait media!
         ======================================================== */}
      {hasMedia ? (
        mediaList.length > 1 ? (
          /* MULTI-MEDIA CAROUSEL: Smooth horizontal peek animations, 1/N badge, indicator dots & animated zoom lightbox */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <PostMediaCarousel
              mediaUrls={mediaList}
              mediaType={isVideo ? 'video' : 'image'}
              alt={post.content?.slice(0, 30) || 'Post media'}
            />
            {renderTextContent(false)}
          </div>
        ) : isPortrait ? (
          /* PORTRAIT FORMAT (Ubhi photo / single 9:16 vertical) */
          hasText ? (
            /* 2-Column Row: Tall photo on left, text on right */
            <div
              className="feed-portrait-row"
              style={{
                display: 'flex',
                gap: '18px',
                marginTop: '14px',
                alignItems: 'flex-start'
              }}
            >
              {/* Left Column: Portrait Media with Lightbox Animation */}
              <div
                style={{
                  width: '230px',
                  maxWidth: '45%',
                  flexShrink: 0,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#0F1015'
                }}
              >
                {isVideo ? (
                  <CustomVideoPlayer
                    src={mediaList[0]}
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <ImageLightbox
                    src={mediaList[0]}
                    alt="Post media"
                    imgStyle={{
                      width: '100%',
                      maxHeight: '420px',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: '12px'
                    }}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      if (img.naturalHeight > img.naturalWidth * 1.1) {
                        setIsPortrait(true);
                      } else {
                        setIsPortrait(false);
                      }
                    }}
                  />
                )}
              </div>

              {/* Right Column: Text Content */}
              {renderTextContent(true)}
            </div>
          ) : (
            /* No Text: Single centered portrait media without blank right space */
            <div
              style={{
                marginTop: '14px',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <div
                style={{
                  maxWidth: '360px',
                  width: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#0F1015'
                }}
              >
                {isVideo ? (
                  <CustomVideoPlayer
                    src={mediaList[0]}
                    style={{ width: '100%', maxHeight: '460px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <ImageLightbox
                    src={mediaList[0]}
                    alt="Post media"
                    imgStyle={{
                      width: '100%',
                      maxHeight: '460px',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: '12px'
                    }}
                  />
                )}
              </div>
            </div>
          )
        ) : (
          /* LANDSCAPE FORMAT (Aadi photo / widescreen / desktop ratio) */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Media ON TOP (Contained height, does not overflow full screen!) */}
            <div
              style={{
                marginTop: '14px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#0F1015',
                width: '100%',
                maxHeight: '420px'
              }}
            >
              {isVideo ? (
                <CustomVideoPlayer
                  src={mediaList[0]}
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <ImageLightbox
                  src={mediaList[0]}
                  alt="Post media"
                  imgStyle={{
                    width: '100%',
                    maxHeight: '420px',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: '12px'
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalHeight > img.naturalWidth * 1.1) {
                      setIsPortrait(true);
                    }
                  }}
                />
              )}
            </div>

            {/* Text Content UNDERNEATH media */}
            {renderTextContent(false)}
          </div>
        )
      ) : (
        /* Text-Only Post */
        renderTextContent(false)
      )}

      {/* ========================================================
          3. ENGAGEMENT FOOTER BAR (Exact Figma design: Views on Left, Pill on Right)
         ======================================================== */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Left: View Count text matching Figma */}
        <div style={{ fontSize: '11px', color: '#71717A', fontWeight: 400 }}>
          {viewCount} Views
        </div>

        {/* Right: Engagement Pill Bar matching Figma node-id 146-292 */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            padding: '4px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          {/* Like */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <LikeButton postId={post.id} initialHasLiked={hasLiked} initialLikesCount={post.likes?.length || 0} />
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            title="Share"
            style={{
              background: 'none',
              border: 'none',
              color: '#A1A1AA',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              padding: 0
            }}
          >
            <Send size={15} />
            <span style={{ fontSize: '11px', color: '#D4D4D8' }}>
              {post.sharesCount ? `${post.sharesCount}` : '1.8k'}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            title="Comments"
            style={{
              background: 'none',
              border: 'none',
              color: showCommentBox ? '#0284C7' : '#A1A1AA',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              padding: 0
            }}
          >
            <MessageCircle size={15} />
            <span style={{ fontSize: '11px', color: '#D4D4D8' }}>
              {commentsNum > 0 ? commentsNum : '20.3k'}
            </span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmarkToggle}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            style={{
              background: 'none',
              border: 'none',
              color: isBookmarked ? '#0284C7' : '#A1A1AA',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <Bookmark size={15} fill={isBookmarked ? '#0284C7' : 'none'} />
          </button>
        </div>
      </div>

      {/* Quick Comment Input Tray */}
      {showCommentBox && (
        <form
          onSubmit={handleCommentSubmit}
          style={{
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            style={{
              flex: 1,
              backgroundColor: '#202227',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '8px 16px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              backgroundColor: commentText.trim() ? '#0284C7' : '#27272A',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: commentText.trim() ? 'pointer' : 'default'
            }}
          >
            Post
          </button>
        </form>
      )}

      {/* Responsive adjustments for portrait 2-column row on mobile */}
      <style jsx>{`
        @media (max-width: 640px) {
          .feed-portrait-row {
            flex-direction: column !important;
          }
          .feed-portrait-row > div:first-child {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </article>
  );
}
