import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MessageCircle, Search, Edit } from 'lucide-react';
import Link from 'next/link';
import ProfilePicture from '../components/ProfilePicture';

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
        isRead: msg.senderId === userId ? true : false // simplified for now
      });
    }
  });

  const partners = Array.from(partnersMap.values());

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '0', overflow: 'hidden', height: 'calc(100dvh - 80px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-1)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={24} color="var(--accent-cyan)" /> 
          Chats
        </h1>
        <Link href="/network" className="btn-text" style={{ padding: '8px', color: 'var(--text-secondary)' }} title="New Message">
          <Edit size={20} />
        </Link>
      </div>
      
      {/* Search Bar (UI only for now) */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--surface-0)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: '12px' }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
          <input type="text" placeholder="Search chats..." style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: 'var(--text-sm)' }} />
        </div>
      </div>

      {/* Chat List */}
      <div style={{ flexGrow: 1, overflowY: 'auto', background: 'var(--surface-0)' }}>
        {partners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
              <MessageCircle size={32} color="var(--text-muted)" />
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-md)', fontWeight: 600 }}>No messages yet</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Connect with friends to start chatting.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {partners.map(p => (
              <Link key={p.id} href={`/messages/${p.id}`} style={{ textDecoration: 'none' }}>
                <div className="hoverable-card" style={{ 
                  display: 'flex', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', 
                  gap: 'var(--space-3)', borderBottom: '1px solid var(--border-color)',
                  background: 'transparent', borderRadius: 0, margin: 0, boxShadow: 'none'
                }}>
                  <ProfilePicture user={p.user} size={54} />
                  
                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                      <strong style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.user.name || p.user.username}
                      </strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', flexShrink: 0 }}>
                        {new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ 
                        margin: 0, fontSize: 'var(--text-sm)', 
                        color: p.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', 
                        fontWeight: p.isRead ? 400 : 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: '85%'
                      }}>
                        {p.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
