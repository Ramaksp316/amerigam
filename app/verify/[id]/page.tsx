import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import { ShieldCheck, Award, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export default async function VerifyCertificatePage({ params }: { params: { id: string } }) {
  const certificateId = params.id;

  const certificate = await prisma.eventCertificate.findUnique({
    where: { certificateId },
    include: {
      registration: {
        include: {
          user: { select: { name: true, amerigamId: true } },
          event: { select: { name: true, category: true, startDate: true } }
        }
      }
    }
  });

  if (!certificate) {
    notFound();
  }

  const { registration } = certificate;
  const { user, event } = registration;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', background: 'var(--background)' }}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: 'var(--space-8)', border: '2px solid var(--accent-amber)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Verification Banner */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--success)', color: '#fff', padding: 'var(--space-2)', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ShieldCheck size={20} /> OFFICIALLY VERIFIED
        </div>

        <div style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <Award size={80} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))' }} />
        </div>

        <h1 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 'var(--space-2)' }}>
          Certificate of {certificate.type.toLowerCase()}
        </h1>
        
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 var(--space-6) 0' }}>
          {user.name}
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: 'var(--space-6)' }}>
          is hereby awarded this certificate in recognition of their participation and efforts in
        </p>

        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)', margin: '0 0 var(--space-8) 0' }}>
          {event.name}
        </h3>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', textAlign: 'left', padding: 'var(--space-4)', background: 'var(--surface-1)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Participant ID</p>
            <p style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14}/> {user.amerigamId}</p>
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date of Issue</p>
            <p style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14}/> {new Date(certificate.issueDate).toLocaleDateString()}</p>
          </div>
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Certificate ID</p>
            <p style={{ margin: 0, fontFamily: 'monospace', fontWeight: 'bold' }}>{certificate.certificateId}</p>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-8)' }}>
          <Link href="/" className="btn btn-outline" style={{ display: 'inline-block' }}>
            Go to Amerigam
          </Link>
        </div>
      </div>
    </div>
  );
}
