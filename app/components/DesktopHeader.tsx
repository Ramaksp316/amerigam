'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Activity, Globe, Bell, Settings } from 'lucide-react';

export default function DesktopHeader({ unreadCount = 0 }: { unreadCount?: number }) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
        height: '60px',
        padding: '0 28px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#000000',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Amerigam Logo */}
      <Link href="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Image
          src="/amerigam-logo-transparent.png"
          alt="Amerigam"
          width={116}
          height={28}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Center: Search pill bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          width: '420px',
          maxWidth: '38vw',
          height: '38px',
          borderRadius: '999px',
          backgroundColor: '#18181B',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '10px'
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search creators, posts, communities..."
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
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#71717A'
          }}
        >
          <Search size={16} />
        </button>
      </form>

      {/* Right: 4 Global Icons matching reference */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
        <Link
          href="/ranking"
          style={{ color: '#D4D4D8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
          title="Activity / Rankings"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#D4D4D8')}
        >
          <Activity size={20} strokeWidth={1.8} />
        </Link>

        <Link
          href="/search"
          style={{ color: '#D4D4D8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
          title="Explore"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#D4D4D8')}
        >
          <Globe size={20} strokeWidth={1.8} />
        </Link>

        <Link
          href="/notifications"
          style={{ color: '#D4D4D8', display: 'flex', alignItems: 'center', position: 'relative', transition: 'color 0.15s' }}
          title="Notifications"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#D4D4D8')}
        >
          <Bell size={20} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                border: '1.5px solid #000000'
              }}
            />
          )}
        </Link>

        <Link
          href="/settings"
          style={{ color: '#D4D4D8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
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
