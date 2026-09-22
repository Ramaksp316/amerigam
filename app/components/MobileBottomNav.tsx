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

  if ((pathname?.startsWith('/messages/') && pathname !== '/messages/')) {
    return null;
  }

  return (
    <>

      {/* Floating Bottom Navigation Dock matching Figma dock (figma_dock_crop.png) */}
      <nav className="floating-dock-nav" aria-label="Bottom Navigation">
        {/* Dark Pill Dock */}
        <div className="floating-dock-pill">
          {/* 1. Home icon: rounded roof outline */}
          <Link href="/home" title="Home" style={{
            color: isActive('/home') ? '#FFFFFF' : '#8E8E93',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            filter: isActive('/home') ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))' : 'none'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5L12 3.5l9 7V20a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2z" />
            </svg>
          </Link>

          {/* 2. Play / Video icon: rounded square with play triangle (Reels) */}
          <Link href="/feed" title="Reels" style={{
            color: isActive('/feed') ? '#FFFFFF' : '#8E8E93',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            filter: isActive('/feed') ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))' : 'none'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="4.5" />
              <polygon points="10 8.5 16 12 10 15.5" fill="currentColor" />
            </svg>
          </Link>

          {/* 3. 4-circles icon: Competitions */}
          <Link href="/competitions" title="Competitions" style={{
            color: isActive('/competitions') ? '#FFFFFF' : '#8E8E93',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            filter: isActive('/competitions') ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))' : 'none'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="7" cy="7" r="2.8" fill={isActive('/competitions') ? '#FFFFFF' : 'none'} />
              <circle cx="17" cy="7" r="2.8" fill={isActive('/competitions') ? '#FFFFFF' : 'none'} />
              <circle cx="7" cy="17" r="2.8" fill={isActive('/competitions') ? '#FFFFFF' : 'none'} />
              <circle cx="17" cy="17" r="2.8" fill={isActive('/competitions') ? '#FFFFFF' : 'none'} />
            </svg>
          </Link>

          {/* 4. Create Plus Button (Exact Figma squircle button) */}
          <Link href="/create" title="Create" style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '42px',
              height: '34px',
              borderRadius: '12px',
              backgroundColor: isActive('/create') ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              transition: 'all 0.18s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </Link>

          {/* 5. Chat / Message speech bubble */}
          <Link href="/messages" title="Messages" style={{
            color: isActive('/messages') ? '#FFFFFF' : '#8E8E93',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            filter: isActive('/messages') ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))' : 'none'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </Link>
        </div>

        {/* 6. User Circular Avatar with dark rim (matching Figma) */}
        <Link href={currentUser ? `/user/${currentUser.id}` : '/login'} title="Profile" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="floating-dock-profile" style={{
            padding: '3px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
            border: pathname?.startsWith('/user') ? '2px solid #FFFFFF' : '1.5px solid rgba(255, 255, 255, 0.15)',
            transition: 'all 0.15s ease'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#1E1E22',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentUser?.avatarData ? (
                <img src={currentUser.avatarData} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : currentUser ? (
                <ProfilePicture user={currentUser} size={40} showStatus={false} />
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
