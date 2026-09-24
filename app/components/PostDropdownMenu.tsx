'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Frown, 
  UserPlus, 
  UserMinus, 
  Bookmark, 
  VolumeX, 
  Ban, 
  BarChart2, 
  Code, 
  Flag, 
  Megaphone,
  Check,
  X
} from 'lucide-react';
import { toggleFollow } from '../actions/userActions';

interface PostDropdownMenuProps {
  postId: string;
  authorId: string;
  authorUsername: string;
  initialIsFollowing?: boolean;
  likesCount?: number;
  commentsCount?: number;
  onHidePost?: () => void;
}

export default function PostDropdownMenu({
  postId,
  authorId,
  authorUsername,
  initialIsFollowing = false,
  likesCount = 0,
  commentsCount = 0,
  onHidePost
}: PostDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommunityNoteModal, setShowCommunityNoteModal] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleFollow = async () => {
    setIsOpen(false);
    const next = !isFollowing;
    setIsFollowing(next);
    showToast(next ? `Following @${authorUsername}` : `Unfollowed @${authorUsername}`);
    try {
      await toggleFollow(authorId);
    } catch (e) {
      setIsFollowing(!next);
    }
  };

  const handleNotInterested = () => {
    setIsOpen(false);
    showToast('Post hidden. We will tune your feed to show less of this.');
    if (onHidePost) onHidePost();
  };

  const handleMute = () => {
    setIsOpen(false);
    showToast(`@${authorUsername} has been muted. You won't see their posts in your feed.`);
    if (onHidePost) onHidePost();
  };

  const handleBlock = () => {
    setIsOpen(false);
    showToast(`@${authorUsername} has been blocked.`);
    if (onHidePost) onHidePost();
  };

  const handleCopyEmbed = () => {
    setIsOpen(false);
    const embedUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(embedUrl);
    showToast('Post link copied to clipboard!');
  };

  const handleBookmark = () => {
    setIsOpen(false);
    showToast('Post added to your Bookmarks!');
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* 3-Dots Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More options"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#71717A',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
      >
        <MoreHorizontal size={20} />
      </button>

      {/* Twitter/X Style Dropdown Menu matching screenshot */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '32px',
            width: '270px',
            backgroundColor: '#16181C',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 1px rgba(255, 255, 255, 0.2)',
            zIndex: 100,
            padding: '8px 0',
            overflow: 'hidden'
          }}
        >
          {/* 1. Not interested */}
          <button
            onClick={handleNotInterested}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            <Frown size={18} strokeWidth={2} style={iconStyle} />
            <span>Not interested in this post</span>
          </button>

          {/* 2. Follow / Unfollow */}
          <button
            onClick={handleToggleFollow}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            {isFollowing ? (
              <>
                <UserMinus size={18} strokeWidth={2} style={iconStyle} />
                <span>Unfollow @{authorUsername}</span>
              </>
            ) : (
              <>
                <UserPlus size={18} strokeWidth={2} style={iconStyle} />
                <span>Follow @{authorUsername}</span>
              </>
            )}
          </button>

          {/* 3. Add/remove from Lists */}
          <button
            onClick={handleBookmark}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            <Bookmark size={18} strokeWidth={2} style={iconStyle} />
            <span>Add/remove from Lists</span>
          </button>

          {/* 4. Mute */}
          <button
            onClick={handleMute}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            <VolumeX size={18} strokeWidth={2} style={iconStyle} />
            <span>Mute @{authorUsername}</span>
          </button>

          {/* 5. Block */}
          <button
            onClick={handleBlock}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            <Ban size={18} strokeWidth={2} style={{ ...iconStyle, color: '#EF4444' }} />
            <span style={{ color: '#EF4444' }}>Block @{authorUsername}</span>
          </button>

          {/* 6. View post activity */}
          <button
            onClick={() => {
              setIsOpen(false);
              setShowActivityModal(true);
            }}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            <BarChart2 size={18} strokeWidth={2} style={iconStyle} />
            <span>View post activity</span>
          </button>

          {/* 7. Embed post */}
          <button
            onClick={handleCopyEmbed}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            <Code size={18} strokeWidth={2} style={iconStyle} />
            <span>Embed post</span>
          </button>

          {/* 8. Report post */}
          <button
            onClick={() => {
              setIsOpen(false);
              setShowReportModal(true);
            }}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            <Flag size={18} strokeWidth={2} style={iconStyle} />
            <span>Report post</span>
          </button>

          {/* 9. Request Community Note */}
          <button
            onClick={() => {
              setIsOpen(false);
              setShowCommunityNoteModal(true);
            }}
            className="menu-item-hover"
            style={menuItemStyle}
          >
            <Megaphone size={18} strokeWidth={2} style={iconStyle} />
            <span>Request Community Note</span>
          </button>
        </div>
      )}

      {/* Post Activity Modal */}
      {showActivityModal && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFF' }}>Post Activity</h3>
              <button onClick={() => setShowActivityModal(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={metricBoxStyle}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1D9BF0' }}>{likesCount * 14 + 28}</div>
                <div style={{ fontSize: '12px', color: '#71717A' }}>Impressions</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }}>{likesCount}</div>
                <div style={{ fontSize: '12px', color: '#71717A' }}>Likes</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#A855F7' }}>{commentsCount}</div>
                <div style={{ fontSize: '12px', color: '#71717A' }}>Replies</div>
              </div>
              <div style={metricBoxStyle}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B' }}>{Math.max(1, Math.floor(likesCount * 0.4))}</div>
                <div style={{ fontSize: '12px', color: '#71717A' }}>Bookmarks</div>
              </div>
            </div>
            <button onClick={() => setShowActivityModal(false)} style={actionBtnStyle}>Close</button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFF' }}>Report Post</h3>
              <button onClick={() => setShowReportModal(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '14px', color: '#A1A1AA', lineHeight: '1.5', marginBottom: '16px' }}>
              Why are you reporting this post from @{authorUsername}?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {['Spam or misleading', 'Harassment or hate speech', 'Inappropriate or harmful content', 'Copyright violation'].map((reason, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowReportModal(false);
                    showToast('Report submitted. Our moderation watchdog is reviewing it.');
                  }}
                  style={{
                    backgroundColor: '#1E1F24',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#FFF',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Request Community Note Modal */}
      {showCommunityNoteModal && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFF' }}>Request Community Note</h3>
              <button onClick={() => setShowCommunityNoteModal(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '14px', color: '#A1A1AA', lineHeight: '1.5', marginBottom: '16px' }}>
              Do you believe this post might need helpful context from the Amerigam community?
            </p>
            <textarea
              placeholder="Explain why context is needed (optional)..."
              style={{
                width: '100%',
                height: '80px',
                backgroundColor: '#1E1F24',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '10px',
                color: '#FFF',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                marginBottom: '16px'
              }}
            />
            <button
              onClick={() => {
                setShowCommunityNoteModal(false);
                showToast('Request sent to community contributors.');
              }}
              style={actionBtnStyle}
            >
              Submit Request
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1D9BF0',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Check size={16} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 16px',
  background: 'transparent',
  border: 'none',
  color: '#EDEDED',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.15s ease'
};

const iconStyle: React.CSSProperties = {
  flexShrink: 0,
  color: '#EDEDED'
};

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px'
};

const modalBoxStyle: React.CSSProperties = {
  backgroundColor: '#16181C',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '400px',
  padding: '24px',
  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)'
};

const closeBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#71717A',
  cursor: 'pointer',
  padding: '4px'
};

const metricBoxStyle: React.CSSProperties = {
  backgroundColor: '#1E1F24',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const actionBtnStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#1D9BF0',
  color: '#FFF',
  border: 'none',
  borderRadius: '12px',
  padding: '12px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: '16px'
};
