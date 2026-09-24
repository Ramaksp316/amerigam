'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

export default function MobileHeader({
  currentUser,
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
        padding: '0 14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Amerigam Logo */}
      <Link
        href="/home"
        style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          minHeight: '44px',
          minWidth: '44px',
          padding: '4px 0'
        }}
      >
        <Image
          src="/amerigam-logo-transparent.png"
          alt="Amerigam"
          width={104}
          height={24}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Right Controls: Search, Notification, Profile Avatar (all >= 44px touch targets) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Link
          href="/search"
          aria-label="Search"
          style={{
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D4D4D8',
            textDecoration: 'none'
          }}
        >
          <Search size={21} strokeWidth={2} />
        </Link>

        <Link
          href="/notifications"
          aria-label="Notifications"
          style={{
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D4D4D8',
            position: 'relative',
            textDecoration: 'none'
          }}
        >
          <Bell size={21} strokeWidth={2} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                border: '1.5px solid #000000'
              }}
            />
          )}
        </Link>

        {currentUser && (
          <Link
            href={`/user/${currentUser.id}`}
            aria-label="My Profile"
            style={{
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                backgroundColor: '#1E1E22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {currentUser.avatarData ? (
                <img
                  src={currentUser.avatarData}
                  alt={currentUser.name || currentUser.username || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ProfilePicture user={currentUser} size={32} showStatus={false} />
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
