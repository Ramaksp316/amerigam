'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Users,
  Globe,
  Bell,
  Settings,
  Home,
  PlaySquare,
  LayoutGrid,
  PlusSquare,
  MessageCircle,
  Bookmark,
  LogOut,
  Share2
} from 'lucide-react';

export default function MessagesHeader({
  currentUser,
  unreadNotifications = 0
}: {
  currentUser?: any;
  unreadNotifications?: number;
}) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/feed', label: 'Feed', icon: PlaySquare },
    { href: '/search', label: 'Explore', icon: LayoutGrid },
    { href: '/create', label: 'Create', icon: PlusSquare },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/network', label: 'Network', icon: Share2 },
    { href: '/saved', label: 'Saved', icon: Bookmark },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Header matching Normal messagar.png & Normal message 2.png */}
      <header
        style={{
          width: '100%',
          height: '60px',
          backgroundColor: '#000000',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box',
          flexShrink: 0,
          zIndex: 50,
          position: 'relative'
        }}
      >
        {/* Left: Menu Trigger & Amerigam Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setIsDrawerOpen(true)}
            title="Open Navigation Menu"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Menu size={22} />
          </button>

          <Link href="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image
              src="/amerigam-logo-transparent.png"
              alt="Amerigam"
              width={116}
              height={26}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </div>

        {/* Center: Search Bar matching Blueprint (Rounded pill with search icon on right) */}
        <div
          style={{
            flex: 1,
            maxWidth: '460px',
            margin: '0 20px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            style={{
              width: '100%',
              height: '38px',
              backgroundColor: '#1E2026',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              padding: '0 40px 0 18px',
              color: '#FFFFFF',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.25)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <Search
            size={17}
            style={{
              position: 'absolute',
              right: '16px',
              color: '#8E8E93',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Right: 4 Quick Navigation Action Icons matching Blueprint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* 1. Communities */}
          <Link
            href="/communities"
            title="Communities"
            style={{
              color: '#A1A1AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A1A1AA';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Users size={20} />
          </Link>

          {/* 2. Explore / Globe */}
          <Link
            href="/search"
            title="Explore"
            style={{
              color: '#A1A1AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A1A1AA';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Globe size={20} />
          </Link>

          {/* 3. Notifications */}
          <Link
            href="/notifications"
            title="Notifications"
            style={{
              color: '#A1A1AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              textDecoration: 'none',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A1A1AA';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444'
                }}
              />
            )}
          </Link>

          {/* 4. Settings */}
          <Link
            href="/settings"
            title="Settings"
            style={{
              color: '#A1A1AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#A1A1AA';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* Slide-in Sidebar Drawer (Appears only when user requests it: "uski jab jarurat ho tab hi aana chahiye") */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9998,
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          backgroundColor: '#0F1015',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isDrawerOpen ? '10px 0 40px rgba(0, 0, 0, 0.8)' : 'none',
          zIndex: 9999,
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
          boxSizing: 'border-box'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Link href="/home" onClick={() => setIsDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/amerigam-logo-transparent.png"
              alt="Amerigam"
              width={112}
              height={26}
              style={{ objectFit: 'contain' }}
            />
          </Link>
          <button
            onClick={() => setIsDrawerOpen(false)}
            title="Close"
            style={{
              background: 'none',
              border: 'none',
              color: '#8E8E93',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || (href !== '/home' && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: active ? '#FFFFFF' : '#A1A1AA',
                  backgroundColor: active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  fontWeight: active ? 700 : 500,
                  fontSize: '15px',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={19} color={active ? '#FFFFFF' : '#A1A1AA'} />
                <span>{label}</span>
                {badge && badge > 0 ? (
                  <span
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '999px',
                      padding: '2px 7px'
                    }}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        {currentUser && (
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Link
              href={`/user/${currentUser.id}`}
              onClick={() => setIsDrawerOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                minWidth: 0
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#27272A',
                  flexShrink: 0
                }}
              >
                {currentUser.avatarData ? (
                  <img
                    src={currentUser.avatarData}
                    alt={currentUser.name || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}
                  >
                    {(currentUser.name || currentUser.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currentUser.name || currentUser.username}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#71717A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  @{currentUser.username}
                </span>
              </div>
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717A',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        )}
      </aside>
    </>
  );
}
