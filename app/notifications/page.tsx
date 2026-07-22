import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PushNotificationManager from '../components/PushNotificationManager';
import NotificationItem from '../components/NotificationItem';

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
    <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '2rem', margin: 0 }}>Notifications</h1>
        <PushNotificationManager />
      </div>
      
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            You have no notifications yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map(notif => {
              const actorName = notif.actor ? (notif.actor.username || notif.actor.name || 'Someone') : 'Someone';
              const actorInitial = actorName.charAt(0).toUpperCase();

              return (
                <NotificationItem 
                  key={notif.id} 
                  notif={notif} 
                  actorName={actorName} 
                  actorInitial={actorInitial} 
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
