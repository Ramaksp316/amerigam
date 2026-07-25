'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import Link from 'next/link';
import { Home, Search, Compass, Users, MessageCircle, User, PlusSquare, Trophy, Bell, Sparkles, Activity, FileText, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

export default function Sidebar({ unreadCount = 0, currentUser = null }: { unreadCount?: number, currentUser?: any }) {
  const pathname = usePathname();
  const [displayUnread, setDisplayUnread] = useState(unreadCount);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);

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
      <Link href="/feed" className="logo">Amerigam</Link>
      
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
        <Link href="/productivity" className={pathname === '/productivity' ? 'active' : ''}>
          <span className="icon"><Activity size={22} strokeWidth={pathname === '/productivity' ? 2.5 : 1.8} /></span> 
          <span className="text">Productivity</span>
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
        <div style={{ position: 'relative' }}>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); setIsCreateExpanded(!isCreateExpanded); }} 
            className={pathname?.startsWith('/create') ? 'active' : ''}
            style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer', userSelect: 'none' }}
          >
            <span className="icon"><PlusSquare size={22} strokeWidth={pathname?.startsWith('/create') ? 2.5 : 1.8} /></span> 
            <span className="text" style={{ flexGrow: 1 }}>Create</span>
            <span style={{ display: 'flex', alignItems: 'center', paddingRight: '12px', opacity: 0.7 }}>
              {isCreateExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </a>
          
          {isCreateExpanded && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              paddingLeft: 'var(--space-4)', 
              marginTop: '4px', 
              marginBottom: '8px',
              gap: '6px',
              borderLeft: '2px solid rgba(255, 255, 255, 0.05)',
              marginLeft: '22px',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <Link href="/create?type=post" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s ease' }} className="hoverable-card-glass">
                <FileText size={15} color="var(--accent-purple)" /> <span style={{ fontWeight: 500 }}>Post</span>
              </Link>
              <Link href="/create?type=project" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s ease' }} className="hoverable-card-glass">
                <Briefcase size={15} color="var(--accent-pink)" /> <span style={{ fontWeight: 500 }}>Project</span>
              </Link>
              <Link href="/create?type=status" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s ease' }} className="hoverable-card-glass">
                <Sparkles size={15} color="var(--accent-amber)" /> <span style={{ fontWeight: 500 }}>Status</span>
              </Link>
              <Link href="/create?type=competition" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s ease' }} className="hoverable-card-glass">
                <Trophy size={15} color="var(--accent-cyan)" /> <span style={{ fontWeight: 500 }}>Competition</span>
              </Link>
              <Link href="/create?type=community" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s ease' }} className="hoverable-card-glass">
                <Users size={15} color="var(--accent-purple)" /> <span style={{ fontWeight: 500 }}>Community</span>
              </Link>
            </div>
          )}
        </div>
        <Link href="/profile" className={`${pathname === '/profile' ? 'active' : ''} profile-link-desktop-hidden`}>
          <span className="icon" style={{ borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentUser ? (
              <ProfilePicture user={currentUser} size={24} showStatus={false} />
            ) : (
              <User size={22} strokeWidth={pathname === '/profile' ? 2.5 : 1.8} />
            )}
          </span> 
          <span className="text">Profile</span>
        </Link>
      </div>

      {currentUser && (
        <Link href="/profile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          marginBottom: '16px',
          textDecoration: 'none'
        }} className="hoverable-card-glass sidebar-user-card">
          <ProfilePicture user={currentUser} size={36} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <strong style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
              @{currentUser.username || currentUser.name?.toLowerCase().replace(/\s+/g, '')}
            </strong>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.name}
            </span>
          </div>
        </Link>
      )}

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
