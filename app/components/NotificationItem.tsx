'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteNotification } from '../actions/notificationActions';
import LocalTime from './LocalTime';

export default function NotificationItem({ notif, actorName, actorInitial }: { notif: any, actorName: string, actorInitial: string }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = async () => {
    // Hide it immediately for a fast, responsive UX
    setIsVisible(false);
    // Delete it from the server
    await deleteNotification(notif.id);
  };

  if (!isVisible) return null;

  return (
    <Link 
      href={notif.link || '#'} 
      onClick={handleClick}
      className="hoverable-card"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-4)', 
        padding: 'var(--space-4)', 
        borderBottom: '1px solid var(--border-color)', 
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: notif.isRead ? 'transparent' : 'var(--accent-glow)',
        transition: 'background-color var(--duration-fast) var(--ease-smooth)',
        borderRadius: 0,
        margin: 0,
        borderLeft: notif.isRead ? '3px solid transparent' : '3px solid var(--accent-pink)'
      }}
    >
      <div className="post-avatar" style={{ width: '42px', height: '42px' }}>
        <div className="post-avatar-inner" style={{ fontSize: '1.2rem' }}>
          {actorInitial}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          <strong style={{ fontWeight: 700 }}>{actorName}</strong> {notif.content}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)', fontWeight: 500 }}>
          <LocalTime date={notif.createdAt} format="full" />
        </div>
      </div>
    </Link>
  );
}
