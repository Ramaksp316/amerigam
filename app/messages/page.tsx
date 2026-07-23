import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

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
        name: partner.name || partner.email || partner.username,
        lastMessage: msg.content,
        timestamp: msg.createdAt,
      });
    }
  });

  const partners = Array.from(partnersMap.values());

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
        <MessageCircle size={28} color="var(--accent-cyan)" />
        <h1 className="heading-jakaas" style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>INBOX</h1>
      </div>
      
      {partners.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            You have no messages yet. Go to a user's profile to send them a message!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {partners.map(p => (
            <Link key={p.id} href={`/messages/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="card hoverable-card" style={{ padding: 'var(--space-4)', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                  <strong style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>{p.name}</strong>
                  <small style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                    {new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </small>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.lastMessage}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
