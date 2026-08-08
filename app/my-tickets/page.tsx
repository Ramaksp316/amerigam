import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { QrCode, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TicketCard from './TicketCard';

export default async function MyTicketsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const registrations = await prisma.eventRegistration.findMany({
    where: { 
      userId, 
      status: { in: ['APPROVED', 'WINNER'] } 
    },
    include: { 
      event: true,
      certificates: true
    },
    orderBy: { joinedAt: 'desc' }
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Link href="/competitions" className="btn btn-small btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} /> Back to Events
        </Link>
        <h1 className="heading-jakaas" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: '0 0 var(--space-2) 0' }}>
          <QrCode size={32} color="var(--accent-teal)" style={{ filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.5))' }} /> MY EVENT PASSES
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Manage your participation, QR passes, and certificates.</p>
      </div>

      {registrations.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>You don't have any active event passes yet.</p>
          <Link href="/competitions" className="btn btn-primary">Find Events</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {registrations.map(reg => (
            <TicketCard key={reg.id} reg={reg} />
          ))}
        </div>
      )}
    </div>
  );
}
