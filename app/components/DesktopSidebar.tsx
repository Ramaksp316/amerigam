'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  PlaySquare,
  LayoutGrid,
  PlusSquare,
  MessageCircle,
  Bell,
  Globe,
  Share2,
  Settings
} from 'lucide-react';

export default function DesktopSidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  const isHomeActive = pathname === '/home' || pathname === '/';

  const primaryItems = [
    { href: '/home', label: 'Home', icon: Home, active: isHomeActive },
    { href: '/feed', label: 'Feed', icon: PlaySquare, active: pathname?.startsWith('/feed') },
    { href: '/search', label: 'Explore', icon: LayoutGrid, active: pathname?.startsWith('/search') },
    { href: '/create', label: 'Create', icon: PlusSquare, active: pathname?.startsWith('/create') },
    { href: '/messages', label: 'Messages', icon: MessageCircle, active: pathname?.startsWith('/messages') },
    { href: '/notifications', label: 'Notification', icon: Bell, active: pathname?.startsWith('/notifications'), badge: unreadCount },
  ];

  const secondaryItems = [
    { href: '/communities', label: 'Communities', icon: Globe, active: pathname?.startsWith('/communities') },
    { href: '/network', label: 'Network', icon: Share2, active: pathname?.startsWith('/network') },
  ];

  return (
    <aside
      className="desktop-only"
      style={{
        width: '240px',
        height: 'calc(100vh - 60px)',
        position: 'sticky',
        top: '60px',
        backgroundColor: '#000000',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px 14px 20px 18px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxSizing: 'border-box',
        zIndex: 40
      }}
    >
      {/* Primary Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {primaryItems.map(({ href, label, icon: Icon, active, badge }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '11px 14px',
              borderRadius: '12px',
              textDecoration: 'none',
              backgroundColor: active ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              border: active ? '1px solid rgba(2, 132, 199, 0.28)' : '1px solid transparent',
              color: active ? '#FFFFFF' : '#A1A1AA',
              fontWeight: active ? 600 : 500,
              fontSize: '15px',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#A1A1AA';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} color={active ? '#0284C7' : '#A1A1AA'} />
              {badge != null && badge > 0 && (
                <span
                  style={{
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
                  }}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </span>
            <span>{label}</span>
          </Link>
        ))}

        {/* Divider Line */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            margin: '12px 6px'
          }}
        />

        {/* Secondary Navigation: Communities & Network */}
        {secondaryItems.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '11px 14px',
              borderRadius: '12px',
              textDecoration: 'none',
              backgroundColor: active ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              border: active ? '1px solid rgba(2, 132, 199, 0.28)' : '1px solid transparent',
              color: active ? '#FFFFFF' : '#A1A1AA',
              fontWeight: active ? 600 : 500,
              fontSize: '15px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#A1A1AA';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} color={active ? '#0284C7' : '#A1A1AA'} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section: Setting */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '11px 14px',
            borderRadius: '12px',
            textDecoration: 'none',
            color: pathname?.startsWith('/settings') ? '#FFFFFF' : '#A1A1AA',
            fontWeight: pathname?.startsWith('/settings') ? 600 : 500,
            fontSize: '15px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = pathname?.startsWith('/settings') ? '#FFFFFF' : '#A1A1AA';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Settings size={20} strokeWidth={1.8} />
          <span>Setting</span>
        </Link>
      </div>
    </aside>
  );
}
