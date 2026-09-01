import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, QrCode, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export default async function CompetitionManagePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) redirect('/login');

  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const registration = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } },
    include: {
      event: true,
      payment: true
    }
  });

  if (!registration) {
    redirect(`/competitions/${eventId}/apply`);
  }

  // If pending payment
  if (registration.status === 'PENDING' && registration.payment && registration.payment.status === 'PENDING') {
    redirect(`/competitions/payment/${registration.id}`);
  }

  const { event } = registration;
  
  const compStart = new Date(event.startDate);
  const compEnd = new Date(event.endDate);

  let statusTitle = "You're Registered!";
  let statusColor = "#10B981";
  let statusIcon = <CheckCircle2 size={32} />;
  let showTicket = true;

  if (registration.status === 'PENDING') {
    statusTitle = "Application Pending";
    statusColor = "#F59E0B";
    showTicket = false;
  } else if (registration.status === 'REJECTED') {
    statusTitle = "Application Not Accepted";
    statusColor = "#EF4444";
    showTicket = false;
  } else if (registration.qualificationStatus === 'QUALIFIED') {
    statusTitle = "You Qualified!";
    statusColor = "#3B82F6";
  } else if (registration.qualificationStatus === 'NON_QUALIFIED') {
    statusTitle = "Not Qualified";
    statusColor = "#6B7280";
  }

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#000000', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1F1F22' }}>
        <Link href={`/competitions/${eventId}`} style={{ color: '#FFF', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} />
        </Link>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 700, margin: 0, paddingRight: '32px' }}>Registration Status</h1>
      </div>

      <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ backgroundColor: statusColor, color: '#FFF', width: '64px', height: '64px', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          {statusIcon}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>{statusTitle}</h2>
        <div style={{ color: '#A1A1AA', fontSize: '14px', marginBottom: '32px' }}>Registration ID: {registration.registrationId}</div>

        {registration.rejectionReason && registration.status === 'REJECTED' && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '16px', borderRadius: '12px', marginBottom: '32px', width: '100%' }}>
            <strong>Reason:</strong> {registration.rejectionReason}
          </div>
        )}

        {!showTicket && registration.status === 'PENDING' && (
          <div style={{ textAlign: 'center', color: '#A1A1AA' }}>
            Your application is currently being reviewed by the organizer. You will be notified once a decision is made.
          </div>
        )}

        {showTicket && (
          <div style={{ width: '100%', backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '24px', overflow: 'hidden', marginBottom: '32px' }}>
            {/* Ticket Header */}
            <div style={{ position: 'relative', height: '120px', width: '100%' }}>
              {event.coverImage ? (
                <Image src={event.coverImage} alt="Cover" fill style={{ objectFit: 'cover', opacity: 0.7 }} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#1F1F22' }} />
              )}
              <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{event.name}</div>
              </div>
            </div>
            
            <div style={{ padding: '24px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{compStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#71717A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> Location</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{event.locationType === 'ONLINE' ? 'Online' : 'Venue'}</div>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#1F1F22', marginBottom: '24px' }} />

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                 <div style={{ padding: '16px', backgroundColor: '#FFF', borderRadius: '16px' }}>
                   <QrCode size={160} color="#000" />
                 </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#A1A1AA' }}>
                Scan this QR code at the event check-in
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
