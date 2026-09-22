'use client';

import { useState } from 'react';
import { MessageCircle, Bookmark, Repeat2, Send } from 'lucide-react';
import LikeButton from './LikeButton';
import Link from 'next/link';

export default function PostActionButtons({ 
  postId, 
  hasLiked, 
  likesCount, 
  commentsCount 
}: { 
  postId: string; 
  hasLiked: boolean; 
  likesCount: number; 
  commentsCount: number;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isReposted, setIsReposted] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Amerigam Post',
          url: `${window.location.origin}/post/${postId}`
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsReposted(!isReposted);
  };

  return (
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
        onClick={(e) => {
          handleRepost(e);
          e.currentTarget.style.transform = 'scale(1.2)';
          setTimeout(() => { if(e.currentTarget) e.currentTarget.style.transform = 'scale(1)'; }, 150);
        }}
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
        onClick={(e) => {
          handleShare(e);
          e.currentTarget.style.transform = 'scale(1.2)';
          setTimeout(() => { if(e.currentTarget) e.currentTarget.style.transform = 'scale(1)'; }, 150);
        }}
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
        onClick={(e) => {
          handleBookmark(e);
          e.currentTarget.style.transform = 'scale(1.2)';
          setTimeout(() => { if(e.currentTarget) e.currentTarget.style.transform = 'scale(1)'; }, 150);
        }}
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
  );
}
