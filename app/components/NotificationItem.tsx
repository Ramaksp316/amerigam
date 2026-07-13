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
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        padding: '15px 20px', 
        borderBottom: '1px solid var(--border-color)', 
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: notif.isRead ? 'transparent' : 'rgba(var(--text-primary-rgb), 0.05)'
      }}
    >
      <div className="post-avatar" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
        <div className="post-avatar-inner">{actorInitial}</div>
      </div>
      <div>
        <div style={{ fontSize: '1rem' }}>
          <strong>{actorName}</strong> {notif.content}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          <LocalTime date={notif.createdAt} format="full" />
        </div>
      </div>
    </Link>
  );
}
