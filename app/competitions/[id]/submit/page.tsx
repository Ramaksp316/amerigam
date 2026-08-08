import { prisma } from '../../../../lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import SubmitForm from './SubmitForm';

export default async function SubmitProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event || !event.requireSubmissions) {
    notFound();
  }

  // Check if user is registered
  const registration = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } },
    include: { submissions: true }
  });

  if (!registration) {
    redirect(`/competitions/${eventId}/apply`);
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'var(--space-4)', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <Link href="/my-tickets" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 'var(--space-6)' }}>
        <ArrowLeft size={16} /> Back to My Passes
      </Link>

      <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <UploadCloud size={48} color="var(--accent-teal)" style={{ filter: 'drop-shadow(0 0 10px rgba(45, 212, 191, 0.3))', marginBottom: 'var(--space-4)' }} />
          <h1 className="heading-jakaas" style={{ fontSize: '2rem', margin: '0 0 var(--space-2) 0' }}>Submit Your Project</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{event.name}</p>
        </div>

        {registration.submissions.length > 0 ? (
          <div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: '0 0 var(--space-2) 0' }}>{registration.submissions[0].projectTitle}</h2>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    {registration.submissions[0].status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(registration.submissions[0].createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                {registration.submissions[0].description}
              </p>
              
              {registration.submissions[0].contentUrl && (
                <a href={registration.submissions[0].contentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-small btn-outline" style={{ display: 'inline-flex', width: 'auto' }}>
                  View Project Link
                </a>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>You have already submitted a project for this event.</p>
          </div>
        ) : (
          <SubmitForm eventId={eventId} />
        )}
      </div>
    </div>
  );
}
