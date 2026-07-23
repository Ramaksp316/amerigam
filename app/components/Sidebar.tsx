'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { Home, Search, Compass, Users, MessageCircle, User, PlusSquare, Trophy, Bell, Sparkles } from 'lucide-react';

export default function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const [displayUnread, setDisplayUnread] = useState(unreadCount);

  useEffect(() => {
    if (pathname === '/notifications') {
      setDisplayUnread(0);
    } else {
      setDisplayUnread(unreadCount);
    }
  }, [pathname, unreadCount]);

  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="sidebar">
      <Link href="/feed" style={{ 
        textDecoration: 'none', 
        padding: 'var(--space-2) var(--space-4)', 
        marginBottom: 'var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          background: 'var(--gradient-primary)',
          borderRadius: '10px',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(100, 108, 255, 0.4)'
        }}>
          <Sparkles size={22} color="white" />
        </div>
        <span style={{
          fontSize: '24px',
          fontWeight: 800,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
          fontFamily: "'Poppins', sans-serif"
        }}>
          Amerigam
        </span>
      </Link>
      
      <div className="nav-links">
        <Link href="/feed" className={pathname === '/feed' ? 'active' : ''}>
          <span className="icon"><Home size={22} strokeWidth={pathname === '/feed' ? 2.5 : 1.8} /></span> 
          <span className="text">Home</span>
        </Link>
        <Link href="/search" className={pathname === '/search' ? 'active' : ''}>
          <span className="icon"><Search size={22} strokeWidth={pathname === '/search' ? 2.5 : 1.8} /></span> 
          <span className="text">Search</span>
        </Link>
        <Link href="/network" className={pathname === '/network' ? 'active' : ''}>
          <span className="icon"><Compass size={22} strokeWidth={pathname === '/network' ? 2.5 : 1.8} /></span> 
          <span className="text">Explore</span>
        </Link>
        <Link href="/competitions" className={pathname?.startsWith('/competitions') ? 'active' : ''}>
          <span className="icon"><Trophy size={22} strokeWidth={pathname?.startsWith('/competitions') ? 2.5 : 1.8} /></span> 
          <span className="text">Competitions</span>
        </Link>
        <Link href="/communities" className={pathname?.startsWith('/communities') ? 'active' : ''}>
          <span className="icon"><Users size={22} strokeWidth={pathname?.startsWith('/communities') ? 2.5 : 1.8} /></span> 
          <span className="text">Communities</span>
        </Link>
        <Link href="/messages" className={pathname === '/messages' ? 'active' : ''}>
          <span className="icon"><MessageCircle size={22} strokeWidth={pathname === '/messages' ? 2.5 : 1.8} /></span> 
          <span className="text">Messages</span>
        </Link>
        <Link href="/notifications" className={pathname === '/notifications' ? 'active' : ''}>
          <span className="icon" style={{ position: 'relative' }}>
            <Bell size={22} strokeWidth={pathname === '/notifications' ? 2.5 : 1.8} />
            {displayUnread > 0 && (
              <span className="notification-badge">
                {displayUnread > 99 ? '99+' : displayUnread}
              </span>
            )}
          </span> 
          <span className="text">Notifications</span>
        </Link>
        <Link href="/create" className={pathname === '/create' ? 'active' : ''}>
          <span className="icon"><PlusSquare size={22} strokeWidth={pathname === '/create' ? 2.5 : 1.8} /></span> 
          <span className="text">Create</span>
        </Link>
        <Link href="/profile" className={pathname === '/profile' ? 'active' : ''}>
          <span className="icon"><User size={22} strokeWidth={pathname === '/profile' ? 2.5 : 1.8} /></span> 
          <span className="text">Profile</span>
        </Link>
      </div>

      <div className="theme-toggle-container" style={{ 
        marginTop: 'auto', 
        paddingTop: 'var(--space-5)', 
        borderTop: '1px solid var(--border-color)' 
      }}>
        <ThemeToggle />
      </div>
    </nav>
  );
}
