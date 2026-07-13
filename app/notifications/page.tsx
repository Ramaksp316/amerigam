import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  // Mark all as read when visited
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });

  const notifications = await prisma.notification.findMany({
    where: { userId },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
      <h1 className="heading-jakaas" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Notifications</h1>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            You have no notifications yet.
          </div>
        ) : (
          notifications.map(notif => {
            const actorName = notif.actor ? (notif.actor.username || notif.actor.name || 'Someone') : 'Someone';
            const actorInitial = actorName.charAt(0).toUpperCase();

            return (
              <Link 
                href={notif.link || '#'} 
                key={notif.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px', 
                  padding: '15px 20px', 
                  borderBottom: '1px solid var(--border-color)', 
                  textDecoration: 'none',
                  color: 'inherit',
                  backgroundColor: notif.isRead ? 'transparent' : 'rgba(var(--text-primary-rgb), 0.05)'
                }}
              >
                <div className="post-avatar" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                  <div className="post-avatar-inner">{actorInitial}</div>
                </div>
                <div>
                  <div style={{ fontSize: '1rem' }}>
                    <strong>{actorName}</strong> {notif.content}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
