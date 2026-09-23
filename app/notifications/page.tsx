import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Globe, Bell, Settings, Radio } from 'lucide-react';
import NotificationCardClient from './NotificationCardClient';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  // Mark unread notifications as read so badges clear, but keep notifications for history
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });

  // Fetch recent notifications with actor details and follower counts
  const rawNotifications = await prisma.notification.findMany({
    where: { userId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarData: true,
          _count: { select: { followers: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 30
  });

  // Format notifications for the client component
  const formattedNotifications = rawNotifications.map((n) => ({
    id: n.id,
    actorId: n.actor?.id || null,
    actorName: n.actor?.name || 'User',
    actorUsername: n.actor?.username || n.actor?.name || 'Username',
    actorAvatar: n.actor?.avatarData || null,
    actorFollowersCount: n.actor?._count?.followers || 0,
    type: n.type,
    content: n.content,
    link: n.link,
    createdAt: n.createdAt.toISOString(),
    isRead: n.isRead,
    thumbnailUrl: null
  }));

  return (
    <div className="notif-page-wrapper">
      {/* ========================================================
          TOP HEADER BAR (Exact match to Figma media_1790144218899.png)
         ======================================================== */}
      <header className="notif-top-bar">
        {/* Left: Amerigam Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/amerigam-logo-transparent.png"
              alt="Amerigam"
              width={105}
              height={24}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>

        {/* Center: Frosted Illuminated Search Bar */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
          <Link
            href="/search"
            style={{
              width: '420px',
              maxWidth: '100%',
              height: '38px',
              borderRadius: '999px',
              backgroundColor: 'rgba(26, 27, 32, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '13px', color: '#71717A' }}>
              Search...
            </span>
            <Search size={16} color="#A1A1AA" />
          </Link>
        </div>

        {/* Right: 4 Utility Icons (Radar, Globe, Bell [active], Settings) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* 1. Radar / Network icon */}
          <Link
            href="/network"
            title="Network"
            style={{ color: '#A1A1AA', display: 'flex', transition: 'color 0.15s' }}
          >
            <Radio size={20} strokeWidth={2} />
          </Link>

          {/* 2. Globe / Communities icon */}
          <Link
            href="/communities"
            title="Communities"
            style={{ color: '#A1A1AA', display: 'flex', transition: 'color 0.15s' }}
          >
            <Globe size={20} strokeWidth={2} />
          </Link>

          {/* 3. Bell / Notification icon (Active highlight) */}
          <Link
            href="/notifications"
            title="Notification"
            style={{
              color: '#FFFFFF',
              display: 'flex',
              position: 'relative',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))'
            }}
          >
            <Bell size={20} strokeWidth={2.3} />
          </Link>

          {/* 4. Settings Gear icon */}
          <Link
            href="/settings"
            title="Settings"
            style={{ color: '#A1A1AA', display: 'flex', transition: 'color 0.15s' }}
          >
            <Settings size={20} strokeWidth={2} />
          </Link>
        </div>
      </header>

      {/* ========================================================
          FLOATING NOTIFICATION CARD (media_1790144218899.png)
         ======================================================== */}
      <main className="notif-floating-container">
        <NotificationCardClient notifications={formattedNotifications} />
      </main>
    </div>
  );
}
