import { prisma } from '../../../../lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Users, Settings } from 'lucide-react';
import DashboardClient from './DashboardClient';

export default async function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          user: { select: { id: true, name: true, amerigamId: true, username: true } },
          team: true
        },
        orderBy: { joinedAt: 'desc' }
      }
    }
  });

  if (!event) {
    notFound();
  }

  // Ensure only creator can access
  if (event.creatorId !== userId) {
    redirect('/competitions');
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--space-4)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <Link href="/competitions" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 'var(--space-2)' }}>
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <h1 className="heading-jakaas" style={{ fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Settings size={32} color="var(--accent-purple)" /> Manage: {event.name}
          </h1>
        </div>
        <div className="glass-card" style={{ padding: 'var(--space-3)', display: 'flex', gap: 'var(--space-6)' }}>
          <div style={{ textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{event.registrations.length}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Applied</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: 'var(--accent-amber)' }}>
              {event.registrations.filter(r => r.status === 'PENDING').length}
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: 'var(--success)' }}>
              {event.registrations.filter(r => r.status === 'APPROVED').length}
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Approved</span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 var(--space-4) 0', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Users size={20} /> Applications
        </h2>
        <DashboardClient registrations={event.registrations} eventId={event.id} requireApproval={event.requireApproval} />
      </div>
    </div>
  );
}
