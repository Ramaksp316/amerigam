'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

export default function MobileHomeHeader({
  currentUser = null,
  unreadCount = 0
}: {
  currentUser?: any;
  unreadCount?: number;
}) {
  return (
    <header
      className="mobile-only"
      style={{
        height: '54px',
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Amerigam Logo */}
      <Link href="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Image
          src="/amerigam-logo-transparent.png"
          alt="Amerigam"
          width={112}
          height={26}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Right: Notification Bell + User Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link
          href="/notifications"
          style={{
            color: '#FFFFFF',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            textDecoration: 'none'
          }}
          aria-label="Notifications"
        >
          <Bell size={22} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 800,
                padding: '1px 4px',
                borderRadius: '999px',
                border: '1.5px solid #000000',
                lineHeight: 1
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {currentUser && (
          <Link
            href={`/user/${currentUser.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              textDecoration: 'none'
            }}
          >
            {currentUser.avatarData ? (
              <img
                src={currentUser.avatarData}
                alt={currentUser.name || currentUser.username || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ProfilePicture user={currentUser} size={34} showStatus={false} />
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
