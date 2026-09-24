'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Globe, Bell, Settings, Share2 } from 'lucide-react';

export default function DesktopHeader({
  unreadCount = 0
}: {
  unreadCount?: number;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className="desktop-only"
      style={{
        height: '58px',
        backgroundColor: '#000000',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        boxSizing: 'border-box'
      }}
    >
      {/* LEFT: Amerigam Logo + Text */}
      <div style={{ display: 'flex', alignItems: 'center', width: '240px' }}>
        <Link href="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/amerigam-logo-transparent.png"
            alt="Amerigam"
            width={124}
            height={28}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
      </div>

      {/* CENTER: Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          width: '420px',
          maxWidth: '35vw',
          height: '38px',
          borderRadius: '999px',
          backgroundColor: '#16181C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '10px',
          transition: 'border-color 0.15s ease'
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '13px',
            width: '100%',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            background: 'none',
            border: 'none',
            color: '#71717A',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search size={16} />
        </button>
      </form>

      {/* RIGHT: 4 Global Icons (Network, Global/Explore, Notification, Settings) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '22px', justifyContent: 'flex-end', width: '240px' }}>
        {/* 1. Network */}
        <Link
          href="/network"
          style={{
            color: '#D4D4D8',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
            textDecoration: 'none'
          }}
          title="Network"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#D4D4D8')}
        >
          <Share2 size={20} strokeWidth={1.8} />
        </Link>

        {/* 2. Global / Explore */}
        <Link
          href="/search"
          style={{
            color: '#D4D4D8',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
            textDecoration: 'none'
          }}
          title="Explore"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#D4D4D8')}
        >
          <Globe size={20} strokeWidth={1.8} />
        </Link>

        {/* 3. Notification with unread badge */}
        <Link
          href="/notifications"
          style={{
            color: '#D4D4D8',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            transition: 'color 0.15s ease',
            textDecoration: 'none'
          }}
          title="Notifications"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#D4D4D8')}
        >
          <Bell size={20} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-6px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: '999px',
                border: '1.5px solid #000000',
                lineHeight: 1
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* 4. Settings */}
        <Link
          href="/settings"
          style={{
            color: '#D4D4D8',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
            textDecoration: 'none'
          }}
          title="Settings"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#D4D4D8')}
        >
          <Settings size={20} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
