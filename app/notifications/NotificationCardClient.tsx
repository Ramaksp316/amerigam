'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface NotificationItemData {
  id: string;
  actorId?: string | null;
  actorName: string;
  actorUsername: string;
  actorAvatar?: string | null;
  actorFollowersCount?: number;
  type: string;
  content: string;
  link?: string | null;
  createdAt: string;
  isRead: boolean;
  thumbnailUrl?: string | null;
}

interface NotificationCardClientProps {
  notifications: NotificationItemData[];
}

export default function NotificationCardClient({ notifications }: NotificationCardClientProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  const formatFollowers = (count?: number) => {
    if (count === undefined || count === null) return '40.5k followers';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M followers`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k followers`;
    return `${count} followers`;
  };

  const getActionText = (type: string, content: string) => {
    const lower = content.toLowerCase();
    if (type === 'like' || lower.includes('like')) {
      if (lower.includes('reel') || lower.includes('video')) return 'Liked your reel';
      return 'Liked your reel';
    }
    if (type === 'follow' || lower.includes('follow')) {
      return 'Started following you';
    }
    if (type === 'comment' || lower.includes('comment')) {
      return 'Commented on your reel';
    }
    if (type === 'message' || lower.includes('message')) {
      return 'Sent you a message';
    }
    if (type === 'challenge' || lower.includes('challenge')) {
      return 'Challenged you';
    }
    return content;
  };

  const hasNotifications = notifications && notifications.length > 0;

  return (
    <div className="notif-card-shell">
      {/* Header: Back arrow + "Notification" title matching Figma media_1790144218899.png */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        paddingBottom: '2px'
      }}>
        <button
          onClick={handleBack}
          className="notif-back-btn"
          aria-label="Back"
          type="button"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <h1 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#FFFFFF',
          margin: 0,
          letterSpacing: '-0.2px'
        }}>
          Notification
        </h1>
      </div>

      {/* List of Notification Pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {hasNotifications ? (
          notifications.map((notif) => {
            const actionText = getActionText(notif.type, notif.content);
            const isLikeOrComment = notif.type === 'like' || notif.type === 'comment';

            return (
              <Link
                key={notif.id}
                href={notif.link || (notif.actorId ? `/user/${notif.actorId}` : '#')}
                className="notif-item-pill"
              >
                {/* Left Side: Circular Avatar + User Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)'
                  }}>
                    {notif.actorAvatar ? (
                      <img
                        src={notif.actorAvatar}
                        alt={notif.actorName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
                        {(notif.actorName || notif.actorUsername || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {notif.actorUsername || notif.actorName || 'User'}
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      color: '#A1A1AA',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {formatFollowers(notif.actorFollowersCount)}
                    </span>
                  </div>
                </div>

                {/* Right Side: Action Text + Optional Thumbnail */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#D4D4D8',
                    fontWeight: 400
                  }}>
                    {actionText}
                  </span>

                  {isLikeOrComment && (
                    <div style={{
                      width: '24px',
                      height: '34px',
                      borderRadius: '6px',
                      backgroundColor: '#52525B',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {notif.thumbnailUrl ? (
                        <img
                          src={notif.thumbnailUrl}
                          alt="post"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          /* Resilient Fallback: Exact Figma media_1790144218899.png items */
          <>
            {/* Fallback Item 1: Liked your reel */}
            <div className="notif-item-pill">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)',
                  flexShrink: 0
                }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF' }}>
                    Username
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#A1A1AA' }}>
                    40.5k followers
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#D4D4D8', fontWeight: 400 }}>
                  Liked your reel
                </span>
                <div style={{
                  width: '24px',
                  height: '34px',
                  borderRadius: '6px',
                  backgroundColor: '#52525B',
                  flexShrink: 0
                }} />
              </div>
            </div>

            {/* Fallback Item 2: Started following you */}
            <div className="notif-item-pill">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)',
                  flexShrink: 0
                }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#FFFFFF' }}>
                    Username
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#A1A1AA' }}>
                    40.5k followers
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#D4D4D8', fontWeight: 400 }}>
                  Started following you
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
