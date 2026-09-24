'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function DesktopLeftNav({
  unreadCount = 0
}: {
  unreadCount?: number;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/home') return pathname === '/home' || pathname === '/';
    if (path === '/search') return pathname?.startsWith('/search') || pathname?.startsWith('/explore');
    return pathname?.startsWith(path);
  };

  const primaryItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/feed', label: 'Feed', icon: PlaySquare },
    { href: '/search', label: 'Explore', icon: LayoutGrid },
    { href: '/create', label: 'Create', icon: PlusSquare },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/notifications', label: 'Notification', icon: Bell, badge: unreadCount },
  ];

  const secondaryItems = [
    { href: '/communities', label: 'Communities', icon: Globe },
    { href: '/network', label: 'Network', icon: Share2 },
  ];

  return (
    <aside
      className="desktop-only"
      style={{
        width: '245px',
        flexShrink: 0,
        height: 'calc(100vh - 58px)',
        position: 'sticky',
        top: '58px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px 20px 16px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#000000',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Primary Navigation Items */}
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '11px 14px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: active ? '#FFFFFF' : '#A1A1AA',
                backgroundColor: active ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                fontWeight: active ? 700 : 500,
                fontSize: '15px',
                position: 'relative',
                transition: 'all 0.18s ease',
                borderLeft: active ? '3px solid #0284C7' : '3px solid transparent'
              }}
              className="desktop-left-nav-item"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ color: active ? '#0284C7' : 'inherit' }}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-7px',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '1px 4px',
                      borderRadius: '999px',
                      border: '1.5px solid #000000',
                      lineHeight: 1
                    }}
                  >
                    {(item.badge ?? 0) > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span style={{ letterSpacing: '0.1px' }}>{item.label}</span>
            </Link>
          );
        })}

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            margin: '14px 4px'
          }}
        />

        {/* Secondary Navigation Items */}
        {secondaryItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '11px 14px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: active ? '#FFFFFF' : '#A1A1AA',
                backgroundColor: active ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                fontWeight: active ? 700 : 500,
                fontSize: '15px',
                position: 'relative',
                transition: 'all 0.18s ease',
                borderLeft: active ? '3px solid #0284C7' : '3px solid transparent'
              }}
              className="desktop-left-nav-item"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                style={{ color: active ? '#0284C7' : 'inherit' }}
              />
              <span style={{ letterSpacing: '0.1px' }}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Settings Button */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '11px 14px',
            borderRadius: '12px',
            textDecoration: 'none',
            color: isActive('/settings') ? '#FFFFFF' : '#A1A1AA',
            backgroundColor: isActive('/settings') ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
            fontWeight: isActive('/settings') ? 700 : 500,
            fontSize: '15px',
            transition: 'all 0.18s ease',
            borderLeft: isActive('/settings') ? '3px solid #0284C7' : '3px solid transparent'
          }}
          className="desktop-left-nav-item"
        >
          <Settings
            size={20}
            strokeWidth={isActive('/settings') ? 2.2 : 1.8}
            style={{ color: isActive('/settings') ? '#0284C7' : 'inherit' }}
          />
          <span style={{ letterSpacing: '0.1px' }}>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
