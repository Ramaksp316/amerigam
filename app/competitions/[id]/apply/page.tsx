import { prisma } from '../../../../lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import ApplyForm from './ApplyForm';

export default async function ApplyPage({ params }: { params: { id: string } }) {
  const eventId = params.id;
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-4)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <Link href="/competitions" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 'var(--space-6)' }}>
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Trophy size={48} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.3))', marginBottom: 'var(--space-4)' }} />
          <h1 className="heading-jakaas" style={{ fontSize: '2rem', margin: '0 0 var(--space-2) 0' }}>Register for {event.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Fill out the application details to secure your spot.</p>
        </div>

        <ApplyForm event={event} />
      </div>
    </div>
  );
}
