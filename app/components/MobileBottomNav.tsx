'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfilePicture from './ProfilePicture';

export default function MobileBottomNav({ currentUser }: { currentUser?: any }) {
  const pathname = usePathname();
  const [isCommunityPage, setIsCommunityPage] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (pathname?.startsWith('/communities/')) {
      setIsCommunityPage(true);
    } else {
      setIsCommunityPage(false);
    }
    // Always show nav when route changes
    setIsVisible(true);
  }, [pathname]);

  // Smooth Auto-hide on scroll down, Auto-reveal on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // If scrolled near top (< 35px), always keep visible
          if (currentScrollY < 35) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY.current + 10) {
            // Scrolling down by more than 10px -> smoothly slide down
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY.current - 8) {
            // Scrolling up by more than 8px -> smoothly slide up
            setIsVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (route: string) => {
    if (route === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    if (route === '/search' || route === '/competitions') {
      return pathname?.startsWith('/search') || pathname?.startsWith('/explore') || pathname?.startsWith('/competitions');
    }
    return pathname?.startsWith(route);
  };

  const isIndividualChat = pathname?.startsWith('/messages/') && pathname !== '/messages';
  if (isIndividualChat || isCommunityPage || pathname?.includes('/apply') || pathname?.startsWith('/dev-board')) return null;

  if (pathname?.startsWith('/messages/') && pathname !== '/messages/') {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Navigation Dock matching Figma dock (media_1790141405614.png) */}
      <nav
        className="floating-dock-nav"
        aria-label="Bottom Navigation"
        style={{
          transform: isVisible ? 'translateX(-50%)' : 'translate(-50%, calc(100% + 40px))',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease'
        }}
      >
        {/* Dark Frosted Pill Dock with Top Specular Reflection */}
        <div
          className="floating-dock-pill"
          style={{
            backgroundColor: 'rgba(18, 19, 24, 0.88)',
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
                width: isActive('/home') ? '38px' : '36px',
                height: isActive('/home') ? '34px' : '36px',
                borderRadius: isActive('/home') ? '11px' : '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/home') ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                border: isActive('/home') ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid transparent',
                color: isActive('/home') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                width: isActive('/feed') ? '38px' : '36px',
                height: isActive('/feed') ? '34px' : '36px',
                borderRadius: isActive('/feed') ? '11px' : '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/feed') ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                border: isActive('/feed') ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid transparent',
                color: isActive('/feed') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <polygon points="10 8 16 12 10 16 10 8" fill={isActive('/feed') ? '#FFFFFF' : 'currentColor'} />
              </svg>
            </div>
          </Link>

          {/* 3. Search / Explore icon */}
          <Link
            href="/search"
            title="Explore"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: isActive('/search') ? '38px' : '36px',
                height: isActive('/search') ? '34px' : '36px',
                borderRadius: isActive('/search') ? '11px' : '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/search') ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                border: isActive('/search') ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid transparent',
                color: isActive('/search') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </Link>

          {/* 4. Normal Plus icon */}
          <Link
            href="/create"
            title="Create Post"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: isActive('/create') ? '38px' : '36px',
                height: isActive('/create') ? '34px' : '36px',
                borderRadius: isActive('/create') ? '11px' : '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/create') ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                border: isActive('/create') ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid transparent',
                color: isActive('/create') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </Link>

          {/* 5. Messages icon */}
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
                width: isActive('/messages') ? '38px' : '36px',
                height: isActive('/messages') ? '34px' : '36px',
                borderRadius: isActive('/messages') ? '11px' : '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive('/messages') ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                border: isActive('/messages') ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid transparent',
                color: isActive('/messages') ? '#FFFFFF' : '#8E8E93',
                transition: 'all 0.18s ease'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* 6. User Circular Avatar (Clean, no yellow ring, no glow) */}
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
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
              border: isActive(`/user/${currentUser?.id}`) ? '2px solid rgba(255, 255, 255, 0.6)' : '1.5px solid rgba(255, 255, 255, 0.16)',
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

      {/* Floating Reveal Trigger Button (Visible only when nav dock is hidden) */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          title="Show Navigation"
          style={{
            position: 'fixed',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
            backgroundColor: 'rgba(20, 21, 28, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '999px',
            padding: '6px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span>Nav</span>
        </button>
      )}
    </>
  );
}
