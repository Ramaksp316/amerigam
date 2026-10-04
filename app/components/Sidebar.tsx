'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  PlaySquare,
  LayoutGrid,
  PlusSquare,
  MessageCircle,
  Bell,
  Globe,
  Share2,
  Settings,
  Menu,
  Bookmark,
  Activity,
  Moon,
  AlertCircle,
  LogOut,
  Trophy
} from 'lucide-react';

export default function Sidebar({
  unreadCount = 0,
  currentUser = null
}: {
  unreadCount?: number;
  currentUser?: any;
  joinedCommunities?: any[];
  networkUsers?: any[];
}) {
  const pathname = usePathname();
  const [displayUnread, setDisplayUnread] = useState(unreadCount);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname === '/notifications') {
      setDisplayUnread(0);
    } else {
      setDisplayUnread(unreadCount);
    }
  }, [pathname, unreadCount]);

  // Close more menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // Hide sidebar on full-screen /feed, /notifications, /ranking, /dev-board, auth pages, /messages, or /home (uses blueprint layout)
  if (pathname === '/home' || pathname === '/' || pathname?.startsWith('/login') || pathname?.startsWith('/create') || pathname?.startsWith('/feed') || pathname?.startsWith('/notifications') || pathname?.startsWith('/ranking') || pathname?.startsWith('/dev-board') || pathname?.startsWith('/messages')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/home') return pathname === '/home' || pathname === '/';
    if (path === '/search') return pathname?.startsWith('/search') || pathname?.startsWith('/explore');
    if (path === '/saved') return pathname?.startsWith('/saved');
    return pathname?.startsWith(path);
  };

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/feed', label: 'Feed', icon: PlaySquare },
    { href: '/search', label: 'Explore', icon: LayoutGrid },
    { href: '/create', label: 'Create', icon: PlusSquare },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/notifications', label: 'Notification', icon: Bell, badge: displayUnread },
  ];

  const secondaryItems = [
    { href: '/communities', label: 'Communites', icon: Globe },
    { href: '/network', label: 'Network', icon: Share2 },
  ];

  return (
    <aside style={{
      width: '230px',
      height: '100vh',
      backgroundColor: '#000000',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '24px 16px 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      flexShrink: 0,
      boxSizing: 'border-box'
    }}>
      {/* Top Logo */}
      <div style={{ marginBottom: '28px', paddingLeft: '4px' }}>
        <Link href="/home" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/amerigam-logo-transparent.png"
            alt="Amerigam"
            width={112}
            height={26}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
      </div>

      {/* Main Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '10px 12px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: active ? '#FFFFFF' : '#A1A1AA',
                fontWeight: active ? 700 : 500,
                fontSize: '15px',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = '#A1A1AA';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <Icon size={20} strokeWidth={active ? 2.3 : 1.8} color={active ? '#FFFFFF' : '#A1A1AA'} />
                {badge != null && badge > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '999px',
                    border: '1.5px solid #000000'
                  }}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Divider Line */}
        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          margin: '12px 4px'
        }} />

        {/* Secondary Items: Communities & Network */}
        {secondaryItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '10px 12px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: active ? '#FFFFFF' : '#A1A1AA',
                fontWeight: active ? 700 : 500,
                fontSize: '15px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = '#A1A1AA';
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.8} color={active ? '#FFFFFF' : '#A1A1AA'} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Setting matching Figma */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '10px 12px',
            borderRadius: '12px',
            textDecoration: 'none',
            color: pathname === '/settings' ? '#FFFFFF' : '#A1A1AA',
            fontWeight: pathname === '/settings' ? 700 : 400,
            fontSize: '15px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/settings') e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/settings') e.currentTarget.style.color = '#A1A1AA';
          }}
        >
          <Settings size={20} strokeWidth={pathname === '/settings' ? 2.3 : 1.8} color={pathname === '/settings' ? '#FFFFFF' : '#A1A1AA'} />
          <span>Setting</span>
        </Link>
      </div>
    </aside>
  );
}