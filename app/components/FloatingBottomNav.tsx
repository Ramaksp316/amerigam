'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingBottomNav({
  userAvatar,
  userName
}: {
  userAvatar?: string | null;
  userName?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div style={{
      position: 'fixed',
      bottom: '22px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      pointerEvents: 'auto'
    }}>
      {/* ========================================================
          MAIN GLASS DOCK (Exact match to Figma dimensions & effects)
          width: 406px, height: 39px, borderRadius: 22px
         ======================================================== */}
      <div style={{
        width: '406px',
        maxWidth: 'calc(100vw - 80px)',
        height: '39px',
        borderRadius: '22px',
        background: 'rgba(20.40, 20.40, 20.40, 0.40)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), inset 0.3px 0.3px 1px rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxSizing: 'border-box'
      }}>
        {/* 1. Home */}
        <Link
          href="/home"
          style={{
            color: pathname === '/home' ? '#FFFFFF' : '#CDCDCD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            opacity: pathname === '/home' ? 1 : 0.8
          }}
          title="Home"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </Link>

        {/* 2. Feed */}
        <Link
          href="/feed"
          style={{
            color: pathname === '/feed' ? '#FFFFFF' : '#CDCDCD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            opacity: pathname === '/feed' ? 1 : 0.8
          }}
          title="Feed"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="4"/>
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
          </svg>
        </Link>

        {/* 3. Explore (4 Circles matching Figma) */}
        <Link
          href="/explore"
          style={{
            color: pathname === '/explore' ? '#FFFFFF' : '#CDCDCD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            opacity: pathname === '/explore' ? 1 : 0.8
          }}
          title="Explore"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="3.2" stroke="currentColor"/>
            <circle cx="17" cy="7" r="3.2" stroke="currentColor"/>
            <circle cx="7" cy="17" r="3.2" stroke="currentColor"/>
            <circle cx="17" cy="17" r="3.2" stroke="currentColor"/>
          </svg>
        </Link>

        {/* 4. Create (With Figma Glow Box & Grid Plus) */}
        <Link
          href="/create"
          style={{
            width: '44px',
            height: '33px',
            background: 'rgba(205, 205, 205, 0.19)',
            boxShadow: '0.2px 0.2px 0.2px rgba(255, 255, 255, 0.2)',
            filter: 'blur(0.1px)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            textDecoration: 'none',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            transition: 'transform 0.15s ease'
          }}
          title="Create"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="4"/>
            <line x1="12" x2="12" y1="8" y2="16"/>
            <line x1="8" x2="16" y1="12" y2="12"/>
          </svg>
        </Link>

        {/* 5. Messages */}
        <Link
          href="/messages"
          style={{
            color: pathname === '/messages' ? '#FFFFFF' : '#CDCDCD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s',
            opacity: pathname === '/messages' ? 1 : 0.8
          }}
          title="Messages"
        >
          <svg width="21.6" height="19" viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </Link>
      </div>

      {/* ========================================================
          USER PROFILE AVATAR PILL (Matching Figma right end)
          width: 42px, height: 38px, background: #141414
         ======================================================== */}
      <Link
        href="/profile"
        style={{
          width: '42px',
          height: '38px',
          background: '#141414',
          borderRadius: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          textDecoration: 'none',
          flexShrink: 0,
          transition: 'transform 0.15s ease'
        }}
        title="Your Profile"
      >
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '9999px',
          overflow: 'hidden',
          backgroundColor: '#27272A',
          boxShadow: '0.08px 0.1px 0.6px white inset, 0.5px 0.1px 2px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
              {userName?.[0] || 'U'}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
