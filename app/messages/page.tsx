import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
        name: partner.name || partner.email,
        lastMessage: msg.content,
        timestamp: msg.createdAt,
      });
    }
  });

  const partners = Array.from(partnersMap.values());

  return (
    <div>
      <h1 className="heading-jakaas" style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '30px' }}>INBOX</h1>
      
      {partners.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You have no messages yet. Go to a user's profile to send them a message!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {partners.map(p => (
            <a key={p.id} href={`/messages/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="card hoverable-card" style={{ padding: '20px', cursor: 'pointer' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{p.name}</strong>
                  <small style={{ color: 'var(--text-secondary)' }}>{new Date(p.timestamp).toLocaleDateString()}</small>
                </div>
                <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.lastMessage}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
