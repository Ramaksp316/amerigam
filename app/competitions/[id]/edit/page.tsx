import { prisma } from '../../../../lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Edit3 } from 'lucide-react';
import EditEventForm from './EditEventForm';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    notFound();
  }

  if (event.creatorId !== userId) {
    redirect('/competitions');
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-4)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <Link href="/competitions" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 'var(--space-6)' }}>
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Edit3 size={48} color="var(--accent-purple)" style={{ filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))', marginBottom: 'var(--space-4)' }} />
          <h1 className="heading-jakaas" style={{ fontSize: '2rem', margin: '0 0 var(--space-2) 0' }}>Edit Event</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Update the details for {event.name}.</p>
        </div>

        <EditEventForm event={event} />
      </div>
    </div>
  );
}
