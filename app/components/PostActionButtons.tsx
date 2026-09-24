'use client';

import { useState } from 'react';
import { MessageCircle, Bookmark, Repeat2, Send, CornerDownLeft, ExternalLink } from 'lucide-react';
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

  const [commentsNum, setCommentsNum] = useState(commentsCount);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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
      setIsBookmarked(!nextState);
    }
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReposted(!isReposted);
    showToast(!isReposted ? 'Post reposted! 🔁' : 'Repost removed');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    const text = commentText.trim();
    setIsSubmittingComment(true);
    try {
      const { addComment } = await import('../actions/postActions');
      const res = await addComment(postId, text);
      if (res?.success) {
        setCommentsNum((prev) => prev + 1);
        setCommentText('');
        showToast('Comment posted! 💬');
        setShowCommentBox(false);
      } else {
        showToast(res?.error || 'Failed to post comment');
      }
    } catch (err) {
      showToast('Error posting comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Action Buttons Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '16px', 
        color: '#71717A',
        paddingRight: '8px'
      }}>
        {/* Like */}
        <LikeButton postId={postId} initialHasLiked={hasLiked} initialLikesCount={likesCount} />

        {/* Comment */}
        <button 
          onClick={() => setShowCommentBox(!showCommentBox)}
          title="Comment"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: showCommentBox ? '#1D9BF0' : 'inherit', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            cursor: 'pointer', 
            fontSize: '13px', 
            outline: 'none', 
            padding: '4px',
            transition: 'transform 0.1s ease, color 0.15s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={18} strokeWidth={2} /> 
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{commentsNum > 0 ? commentsNum : ''}</span>
        </button>
        
        {/* Repost */}
        <button 
          onClick={handleRepost}
          title="Repost"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: isReposted ? '#10B981' : 'inherit', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            cursor: 'pointer', 
            fontSize: '13px', 
            outline: 'none', 
            padding: '4px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Repeat2 size={18} strokeWidth={2} />
        </button>

        {/* Share */}
        <button 
          onClick={handleShare}
          title="Share Post"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: isShared ? '#1D9BF0' : 'inherit', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            cursor: 'pointer', 
            fontSize: '13px', 
            outline: 'none', 
            padding: '4px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Send size={18} strokeWidth={2} />
        </button>

        {/* Bookmark */}
        <button 
          onClick={handleBookmark}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: isBookmarked ? '#1D9BF0' : 'inherit', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            cursor: 'pointer', 
            fontSize: '13px', 
            outline: 'none', 
            padding: '4px',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <Bookmark size={18} strokeWidth={2} fill={isBookmarked ? '#1D9BF0' : 'none'} />
        </button>
      </div>

      {/* Inline Quick-Comment Tray */}
      {showCommentBox && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <form
            onSubmit={handleCommentSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1E1E22',
              borderRadius: '999px',
              padding: '4px 6px 4px 14px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmittingComment}
              style={{
                backgroundColor: commentText.trim() ? '#1D9BF0' : 'transparent',
                color: commentText.trim() ? '#FFFFFF' : '#71717A',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: commentText.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s ease'
              }}
              title="Post comment"
            >
              <CornerDownLeft size={14} strokeWidth={2.2} />
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <Link
              href={`/post/${postId}`}
              style={{
                fontSize: '12px',
                color: '#1D9BF0',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View all comments & thread</span>
              <ExternalLink size={11} />
            </Link>
            <button
              onClick={() => setShowCommentBox(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#71717A',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
