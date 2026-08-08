import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, MapPin, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Show these QR codes at the gate for check-in.</p>
      </div>

      {registrations.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>You don't have any active event passes yet.</p>
          <Link href="/competitions" className="btn btn-primary">Find Events</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {registrations.map(reg => (
            <div key={reg.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, gap: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
              
              {/* QR Code Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', background: '#fff', borderRadius: 'var(--radius-lg)' }}>
                <QRCodeSVG value={reg.qrToken} size={180} level="H" includeMargin={true} />
                <span style={{ marginTop: 'var(--space-2)', fontFamily: 'monospace', fontSize: '0.8rem', color: '#000', fontWeight: 'bold' }}>
                  {reg.registrationId}
                </span>
              </div>

              {/* Details Section */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{reg.event.name}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <MapPin size={16} color="var(--accent-amber)" />
                    {reg.event.locationType} {reg.event.venue ? `- ${reg.event.venue}` : ''}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Calendar size={16} color="var(--accent-purple)" />
                    {new Date(reg.event.startDate).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                  {reg.event.allowTeams && (
                    <Link href={`/competitions/${reg.event.id}/team`} className="btn btn-small btn-outline" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      Manage Team
                    </Link>
                  )}
                  {reg.event.requireSubmissions && (
                    <Link href={`/competitions/${reg.event.id}/submit`} className="btn btn-small btn-outline" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                      Submit Project
                    </Link>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type: <strong style={{ color: 'var(--text-primary)' }}>{reg.participantType}</strong></span>
                  
                  {reg.status === 'WINNER' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 800 }}>WINNER</span>
                      {reg.certificates[0] && (
                        <Link href={`/verify/${reg.certificates[0].certificateId}`} className="btn btn-small" style={{ background: 'var(--accent-purple)', color: '#fff', fontSize: '0.75rem', padding: 'var(--space-1) var(--space-3)' }}>
                          View Certificate
                        </Link>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 800 }}>APPROVED</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
