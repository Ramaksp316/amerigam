'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfilePicture from './ProfilePicture';

export default function MobileBottomNav({ currentUser }: { currentUser?: any }) {
  const pathname = usePathname();
  const [isCommunityPage, setIsCommunityPage] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/communities/')) {
      setIsCommunityPage(true);
    } else {
      setIsCommunityPage(false);
    }
  }, [pathname]);

  const isActive = (route: string) => {
    if (route === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname?.startsWith(route);
  };

  const isIndividualChat = pathname?.startsWith('/messages/') && pathname !== '/messages';
  if (isIndividualChat || isCommunityPage || pathname?.includes('/apply')) return null;

  if (pathname?.startsWith('/messages/') && pathname !== '/messages/') {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Navigation Dock matching Figma dock (media_1790141405614.png) */}
      <nav className="floating-dock-nav" aria-label="Bottom Navigation">
        {/* Dark Frosted Pill Dock with Top Specular Reflection */}
        <div
          className="floating-dock-pill"
          style={{
            backgroundColor: 'rgba(18, 19, 24, 0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
            borderRight: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '999px',
            height: '52px',
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
          }}
        >
          {/* 1. Home icon */}
          <Link
            href="/home"
            title="Home"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/home') ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                boxShadow: isActive('/home') ? '0 0 16px rgba(255, 255, 255, 0.25)' : 'none',
                color: isActive('/home') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10.5L12 3.5l9 7V20a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
          </Link>

          {/* 2. Play / Video icon (Reels) */}
          <Link
            href="/feed"
            title="Reels"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/feed') ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                boxShadow: isActive('/feed') ? '0 0 16px rgba(255, 255, 255, 0.25)' : 'none',
                color: isActive('/feed') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="4.5" />
                <polygon points="10 8.5 16 12 10 15.5" fill="currentColor" />
              </svg>
            </div>
          </Link>

          {/* 3. 4-circles icon (Competitions/Explore matching media_1790141405614.png) */}
          <Link
            href="/competitions"
            title="Competitions"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/competitions') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                boxShadow: isActive('/competitions') ? '0 0 18px rgba(255, 255, 255, 0.3)' : 'none',
                color: isActive('/competitions') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="7" cy="7" r="2.8" fill={isActive('/competitions') ? '#FFFFFF' : 'none'} />
                <circle cx="17" cy="7" r="2.8" fill={isActive('/competitions') ? '#FFFFFF' : 'none'} />
                <circle cx="7" cy="17" r="2.8" fill={isActive('/competitions') ? '#FFFFFF' : 'none'} />
                <circle cx="17" cy="17" r="2.8" fill={isActive('/competitions') ? '#FFFFFF' : 'none'} />
              </svg>
            </div>
          </Link>

          {/* 4. Create Plus Button (Figma squircle button) */}
          <Link
            href="/create"
            title="Create"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '34px',
                borderRadius: '11px',
                backgroundColor: isActive('/create') ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'all 0.18s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </Link>

          {/* 5. Messages speech bubble */}
          <Link
            href="/messages"
            title="Messages"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/messages') ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                boxShadow: isActive('/messages') ? '0 0 16px rgba(255, 255, 255, 0.25)' : 'none',
                color: isActive('/messages') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* 6. User Circular Avatar with Gold Ring matching media_1790141405614.png */}
        <Link
          href={currentUser ? `/user/${currentUser.id}` : '/login'}
          title="Profile"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            className="floating-dock-profile"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#0F0F12',
              padding: '2px',
              boxShadow: '0 10px 28px rgba(0, 0, 0, 0.8), 0 0 12px rgba(234, 179, 8, 0.35)',
              border: '2px solid #EAB308',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.18s ease',
              flexShrink: 0
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#1E1E22',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {currentUser?.avatarData ? (
                <img
                  src={currentUser.avatarData}
                  alt={currentUser.name || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : currentUser ? (
                <ProfilePicture user={currentUser} size={42} showStatus={false} />
              ) : (
                <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700 }}>U</span>
              )}
            </div>
          </div>
        </Link>
      </nav>
    </>
  );
}
