'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Users, MessageCircle, Trophy, Bell, User, Plus, BarChart2 } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

export default function Sidebar({ unreadCount = 0, currentUser = null }: { unreadCount?: number, currentUser?: any }) {
  const pathname = usePathname();
  const [displayUnread, setDisplayUnread] = useState(unreadCount);

  useEffect(() => {
    if (pathname === '/notifications') {
      setDisplayUnread(0);
    } else {
      setDisplayUnread(unreadCount);
    }
  }, [pathname, unreadCount]);

  if (pathname?.startsWith('/login')) {
    return null;
  }

  const getStroke = (path: string) => pathname?.startsWith(path) ? 2.5 : 2;

  return (
    <nav className="sidebar">
      <Link href="/feed" className="logo-container">
        <Image 
          src="/amerigam-logo-transparent.png" 
          alt="Amerigam" 
          width={40} 
          height={18} 
          style={{ objectFit: 'contain' }}
        />
      </Link>
      
      <div className="nav-links">
        <Link href="/feed" className={pathname === '/feed' ? 'active' : ''}>
          <span className="icon"><Home size={26} strokeWidth={pathname === '/feed' ? 2.5 : 2} /></span> 
          <span className="text">Home</span>
        </Link>
        
        <Link href="/search" className={pathname === '/search' ? 'active' : ''}>
          <span className="icon"><Search size={26} strokeWidth={pathname === '/search' ? 2.5 : 2} /></span> 
          <span className="text">Search / Explore</span>
        </Link>

        <Link href="/network" className={pathname === '/network' ? 'active' : ''}>
          <span className="icon"><Users size={26} strokeWidth={pathname === '/network' ? 2.5 : 2} /></span> 
          <span className="text">Communities / Network</span>
        </Link>

        <Link href="/messages" className={pathname?.startsWith('/messages') ? 'active' : ''}>
          <span className="icon"><MessageCircle size={26} strokeWidth={getStroke('/messages')} /></span> 
          <span className="text">Messages</span>
        </Link>

        <Link href="/competitions" className={pathname?.startsWith('/competitions') ? 'active' : ''}>
          <span className="icon"><Trophy size={26} strokeWidth={getStroke('/competitions')} /></span> 
          <span className="text">Competitions</span>
        </Link>

        <Link href="/notifications" className={pathname === '/notifications' ? 'active' : ''}>
          <span className="icon" style={{ position: 'relative' }}>
            <Bell size={26} strokeWidth={pathname === '/notifications' ? 2.5 : 2} />
            {displayUnread > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--accent-pink)', color: 'white', fontSize: '10px',
                fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px',
                border: '2px solid var(--surface-0)'
              }}>
                {displayUnread > 99 ? '99+' : displayUnread}
              </span>
            )}
          </span> 
          <span className="text">Notifications</span>
        </Link>

        <Link href="/ranking" className={pathname?.startsWith('/ranking') ? 'active' : ''}>
          <span className="icon"><BarChart2 size={26} strokeWidth={getStroke('/ranking')} /></span> 
          <span className="text">Your Ranking</span>
        </Link>

        <Link href="/profile" className={pathname?.startsWith('/profile') ? 'active' : ''}>
          <span className="icon">
            {currentUser ? (
              <ProfilePicture user={currentUser} size={26} showStatus={false} />
            ) : (
              <User size={26} strokeWidth={getStroke('/profile')} />
            )}
          </span> 
          <span className="text">Profile</span>
        </Link>

        <Link href="/create" style={{
          marginTop: 'var(--space-4)',
          background: '#ffffff',
          color: '#000000',
          fontWeight: 600,
          borderRadius: 'var(--radius-full)',
          padding: '14px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          transition: 'opacity 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          <span className="text">Create</span>
          <span className="icon" style={{ display: 'none' }}><Plus size={24} strokeWidth={2.5} /></span>
        </Link>
      </div>

      <div className="theme-toggle-container" style={{ 
        marginTop: 'auto', 
        paddingTop: 'var(--space-5)', 
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {currentUser && (
          <Link href="/login/test-accounts" style={{
            fontSize: '11px',
            color: '#A1A1AA',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 10px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: 500,
            transition: 'background 0.2s ease'
          }} className="hoverable-card-glass">
            <Users size={14} /> Switch test account
          </Link>
        )}
        <ThemeToggle />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar .text { display: none !important; }
          .sidebar .icon { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
