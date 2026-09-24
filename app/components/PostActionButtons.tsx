'use client';

import { useState } from 'react';
import { MessageCircle, Bookmark, Repeat2, Send } from 'lucide-react';
import LikeButton from './LikeButton';
import Link from 'next/link';
import { toggleBookmark } from '../actions/postActions';

export default function PostActionButtons({ 
  postId, 
  hasLiked, 
  likesCount, 
  commentsCount,
  initialIsBookmarked = false
}: { 
  postId: string; 
  hasLiked: boolean; 
  likesCount: number; 
  commentsCount: number;
  initialIsBookmarked?: boolean;
}) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isShared, setIsShared] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${postId}` : '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Amerigam Post',
          url: shareUrl
        });
      } catch (err) {}
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsShared(true);
      showToast('Link copied to clipboard! 📋');
      setTimeout(() => setIsShared(false), 2000);
    } catch (err) {
      showToast('Link copied! 📋');
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    showToast(nextState ? 'Post saved to bookmarks! 🔖' : 'Removed from bookmarks');
    try {
      await toggleBookmark(postId);
    } catch (err) {
      setIsBookmarked(!nextState); // Rollback on failure
    }
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReposted(!isReposted);
    showToast(!isReposted ? 'Post reposted! 🔁' : 'Repost removed');
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '16px', 
        color: '#71717A',
        paddingRight: '8px'
      }}>
        <LikeButton postId={postId} initialHasLiked={hasLiked} initialLikesCount={likesCount} />

        <Link href={`/post/${postId}`} style={{ textDecoration: 'none', color: 'inherit', WebkitTapHighlightColor: 'transparent' }}>
          <button style={{ 
            background: 'transparent', border: 'none', color: 'inherit', 
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', 
            fontSize: '13px', outline: 'none', padding: '4px',
            transition: 'transform 0.1s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MessageCircle size={18} strokeWidth={2} /> 
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{commentsCount > 0 ? commentsCount : ''}</span>
          </button>
        </Link>
        
        <button 
          onClick={handleRepost}
          title="Repost"
          style={{ 
            background: 'transparent', border: 'none', 
            color: isReposted ? '#10B981' : 'inherit', 
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', 
            fontSize: '13px', outline: 'none', padding: '4px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Repeat2 size={18} strokeWidth={2} />
        </button>

        <button 
          onClick={handleShare}
          title="Share Post"
          style={{ 
            background: 'transparent', border: 'none', 
            color: isShared ? '#1D9BF0' : 'inherit', 
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', 
            fontSize: '13px', outline: 'none', padding: '4px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Send size={18} strokeWidth={2} />
        </button>

        <button 
          onClick={handleBookmark}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          style={{ 
            background: 'transparent', border: 'none', 
            color: isBookmarked ? '#1D9BF0' : 'inherit', 
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', 
            fontSize: '13px', outline: 'none', padding: '4px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Bookmark size={18} strokeWidth={2} fill={isBookmarked ? '#1D9BF0' : 'none'} />
        </button>
      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1E1E22',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          padding: '8px 18px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
          pointerEvents: 'none',
          animation: 'fadeInUp 0.2s ease'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
