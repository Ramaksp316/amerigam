import { prisma } from '../../../../lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import TeamForm from './TeamForm';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event || !event.allowTeams) {
    notFound();
  }

  // Check if user is registered and if they are already in a team
  const registration = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } },
    include: { team: { include: { members: { include: { user: true } } } } }
  });

  if (!registration) {
    redirect(`/competitions/${eventId}/apply`);
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-4)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <Link href="/my-tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 'var(--space-6)' }}>
        <ArrowLeft size={16} /> Back to My Passes
      </Link>

      <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Users size={48} color="var(--accent-pink)" style={{ filter: 'drop-shadow(0 0 10px rgba(236, 72, 153, 0.3))', marginBottom: 'var(--space-4)' }} />
          <h1 className="heading-jakaas" style={{ fontSize: '2rem', margin: '0 0 var(--space-2) 0' }}>Team Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{event.name}</p>
        </div>

        {registration.team ? (
          <div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 var(--space-2) 0' }}>{registration.team.name}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 var(--space-4) 0' }}>
                Team Code: <strong style={{ color: 'var(--text-primary)', userSelect: 'all', background: 'var(--surface-1)', padding: '2px 6px', borderRadius: '4px' }}>{registration.team.teamCode}</strong>
              </p>
              
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Members:</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {registration.team.members.map(member => (
                  <li key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: member.userId === registration.team?.captainId ? 'var(--accent-amber)' : 'var(--text-muted)' }}></div>
                    <span style={{ fontWeight: 600 }}>{member.user.name}</span>
                    {member.userId === registration.team?.captainId && <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', border: '1px solid currentColor', padding: '1px 4px', borderRadius: '4px' }}>Captain</span>}
                  </li>
                ))}
              </ul>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>You are already in a team for this event.</p>
          </div>
        ) : (
          <TeamForm eventId={eventId} />
        )}
      </div>
    </div>
  );
}
