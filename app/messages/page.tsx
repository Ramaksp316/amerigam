import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MessageCircle, Search, Compass } from 'lucide-react';
import Link from 'next/link';
import ProfilePicture from '../components/ProfilePicture';
import PageRefresher from '../components/PageRefresher';

export default async function InboxPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const partnersMap = new Map();
  messages.forEach(msg => {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const partner = msg.senderId === userId ? msg.receiver : msg.sender;
    if (!partnersMap.has(partnerId)) {
      partnersMap.set(partnerId, {
        id: partnerId,
        user: partner,
        lastMessage: msg.content,
        timestamp: msg.createdAt,
      });
    }
  });

  const partners = Array.from(partnersMap.values());

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '0 var(--space-4)' }}>
      <PageRefresher intervalMs={15000} />
      {/* Inbox Glassmorphic Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: 'var(--space-4)', 
        marginBottom: 'var(--space-6)',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
          }}>
            <MessageCircle size={24} color="white" />
          </div>
          <div>
            <h1 className="heading-jakaas" style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '0.5px' }}>CHATS</h1>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Messages and discussions</p>
          </div>
        </div>
      </div>
      
      {partners.length === 0 ? (
        <div className="glass-card" style={{ 
          textAlign: 'center', 
          padding: 'var(--space-10)',
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)', margin: '0 0 var(--space-4) 0' }}>
            You have no messages yet.
          </p>
          <Link href="/network" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Compass size={18} /> Discover Users
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {partners.map(p => {
            return (
              <Link key={p.id} href={`/messages/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4)', 
                  margin: 0,
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                className="hoverable-card-glass"
                >
                  {/* Reusable Profile Picture */}
                  <ProfilePicture user={p.user} size={48} />

                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {p.user.name || p.user.username || p.user.email}
                      </strong>
                      <small style={{ color: 'var(--accent-cyan)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.5px' }}>
                        {new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </small>
                    </div>
                    <p style={{ 
                      margin: 0, 
                      color: 'var(--text-secondary)', 
                      fontSize: 'var(--text-sm)', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      opacity: 0.85
                    }}>
                      {p.lastMessage}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
