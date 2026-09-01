import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Share, MapPin, Calendar, Users, Trophy, IndianRupee, Clock, Building2, UserCircle2, ChevronRight } from 'lucide-react';
import BackButton from '../../components/BackButton';

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  // Await the params to avoid Next.js sync params access warning in Next 15 (if applicable) or to be safe
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      creator: {
        select: { id: true, name: true, avatarData: true, username: true }
      },
      _count: {
        select: { registrations: true }
      },
      results: {
        include: {
          user: {
            select: { id: true, name: true, avatarData: true, username: true }
          }
        },
        orderBy: { rank: 'asc' }
      }
    }
  });

  if (!event) return notFound();

  // Determine Status
  const now = new Date();
  const regStart = event.registrationStart ? new Date(event.registrationStart) : null;
  const regEnd = event.registrationEnd ? new Date(event.registrationEnd) : null;
  const compStart = new Date(event.startDate);
  const compEnd = new Date(event.endDate);

  const isRegistrationOpen = regStart && regEnd && now >= regStart && now <= regEnd;
  const isCompleted = now > compEnd;
  const isLive = now >= compStart && now <= compEnd;
  
  let statusText = 'Upcoming';
  let statusColor = '#F59E0B';
  let canParticipate = false;
  let btnText = 'Participate';

  let actionLink = '#';

  if (isCompleted) {
    statusText = 'Completed';
    statusColor = '#EF4444';
    btnText = 'Results available later';
  } else if (isLive) {
    statusText = 'Live Now';
    statusColor = '#10B981';
    btnText = 'Event is Live';
  } else if (isRegistrationOpen) {
    const hoursLeft = Math.floor((regEnd!.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (hoursLeft < 48) {
      statusText = 'Ending Soon';
      statusColor = '#EF4444';
    } else {
      statusText = 'Registration Open';
      statusColor = '#3B82F6';
    }
    canParticipate = true;
    actionLink = `/competitions/${event.id}/apply`;
  } else if (regEnd && now > regEnd && now < compStart) {
    statusText = 'Registration Closed';
    statusColor = '#6B7280';
    btnText = 'Registration Closed';
  }

  // Check if registered
  const registration = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } },
    include: { payment: true }
  });

  const isCreator = event.creatorId === userId;

  if (isCreator) {
    btnText = 'Manage Participants';
    actionLink = `/competitions/manage-participants/${event.id}`;
    canParticipate = true;
  } else if (registration) {
    canParticipate = false;
    if (registration.status === 'PENDING' && registration.payment?.status === 'PENDING') {
      btnText = 'Complete Payment';
      actionLink = `/competitions/payment/${registration.id}`;
      // Highlight button a bit more for pending
      canParticipate = true; // allow click
    } else {
      if (registration.status === 'APPROVED') {
        if (registration.qualificationStatus === 'QUALIFIED') btnText = 'Qualified';
        else if (registration.qualificationStatus === 'NON_QUALIFIED') btnText = 'Not Qualified';
        else btnText = 'Registered';
      } else if (registration.status === 'REJECTED') {
        btnText = 'Not Accepted';
      } else {
        btnText = 'Application Pending';
      }
      actionLink = `/competitions/${event.id}/manage`;
      canParticipate = true; // allow click to go to manage page
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px', backgroundColor: '#000000', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', width: '100%', height: '240px', backgroundColor: '#111' }}>
        {event.coverImage && (
          <Image src={event.coverImage} alt={event.name} fill style={{ objectFit: 'cover', opacity: 0.8 }} />
        )}
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10 }}>
          <BackButton fallback="/competitions" />
        </div>
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <button style={{ width: '36px', height: '36px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
            <Share size={18} />
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <div style={{ display: 'inline-block', backgroundColor: statusColor, color: '#FFF', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', marginBottom: '8px' }}>
            {statusText}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{event.name}</h1>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Core Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#1F1F22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 500 }}>Competition Date</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{compStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#1F1F22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={16} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 500 }}>Location</div>
              <div style={{ fontSize: '13px', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.locationType === 'ONLINE' ? 'Online' : event.venue}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#1F1F22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={16} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 500 }}>Entry Fee</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{event.entryFee ? `₹${event.entryFee}` : 'Free'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#1F1F22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#A1A1AA', fontWeight: 500 }}>Participants</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{event._count.registrations} {event.participantLimit ? `/ ${event.participantLimit}` : ''}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Result */}
        {event.resultStatus === 'PUBLISHED' && registration && !isCreator && (
          <div style={{ backgroundColor: '#1F1F22', padding: '16px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #3F3F46', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '8px', fontWeight: 600 }}>Your Result</div>
            {(() => {
              const uRes = event.results.find((r: any) => r.userId === userId);
              if (uRes) {
                let rText = `Top 10 - #${uRes.rank}`;
                let rColor = '#FFF';
                if (uRes.rank === 1) { rText = '#1 — Winner'; rColor = '#F59E0B'; }
                else if (uRes.rank === 2) { rText = '#2 — Runner-up'; rColor = '#94A3B8'; }
                else if (uRes.rank === 3) { rText = '#3 — Third Place'; rColor = '#B45309'; }
                return <div style={{ fontSize: '20px', fontWeight: 800, color: rColor }}>{rText}</div>;
              } else {
                return <div style={{ fontSize: '18px', fontWeight: 700, color: '#A1A1AA' }}>Did not place</div>;
              }
            })()}
          </div>
        )}

        {isCreator ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <Link href={`/create?type=competition&edit=${event.id}`} style={{
                display: 'block',
                width: '100%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '16px',
                textAlign: 'center',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none'
              }}>
                Edit Competition
              </Link>
              <Link href={`/competitions/manage-participants/${event.id}`} style={{
                display: 'block',
                width: '100%',
                backgroundColor: '#1F1F22',
                color: '#FFFFFF',
                padding: '16px',
                textAlign: 'center',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none'
              }}>
                Manage Participants
              </Link>
            <Link href={`/competitions/${event.id}/results/manage`} style={{
              display: 'block',
              width: '100%',
              backgroundColor: '#1F1F22',
              color: '#FFFFFF',
              border: '1px solid #3F3F46',
              textAlign: 'center',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none'
            }}>
              Manage Results
            </Link>
          </div>
        ) : (
          <Link href={actionLink} style={{
            display: 'block',
            width: '100%',
            backgroundColor: canParticipate ? '#1D9BF0' : '#1F1F22',
            color: canParticipate ? '#FFFFFF' : '#A1A1AA',
            textAlign: 'center',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '16px',
            textDecoration: 'none',
            marginBottom: '32px',
            pointerEvents: canParticipate ? 'auto' : 'none'
          }}>
            {btnText}
          </Link>
        )}

        {/* Separator */}
        <div style={{ height: '1px', backgroundColor: '#1F1F22', marginBottom: '24px' }} />

        {/* Results Section */}
        {event.resultStatus === 'PUBLISHED' && event.results && event.results.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Trophy size={20} color="#F59E0B" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#F59E0B' }}>Official Results</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {event.results.map((res: any) => {
                let badgeColor = '#3F3F46';
                let badgeText = res.type.replace('_', ' ');
                if (res.rank === 1) badgeColor = '#F59E0B'; // Gold
                else if (res.rank === 2) badgeColor = '#94A3B8'; // Silver
                else if (res.rank === 3) badgeColor = '#B45309'; // Bronze
                else badgeText = `Top 10 - #${res.rank}`;

                const isTop3 = res.rank <= 3;

                return (
                  <Link href={`/user/${res.user.id}`} key={res.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    backgroundColor: isTop3 ? 'rgba(245, 158, 11, 0.1)' : '#0A0A0A',
                    border: `1px solid ${isTop3 ? 'rgba(245, 158, 11, 0.2)' : '#1F1F22'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    textDecoration: 'none'
                  }}>
                    <div style={{
                      width: isTop3 ? '48px' : '36px',
                      height: isTop3 ? '48px' : '36px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: '#1F1F22'
                    }}>
                      {res.user.avatarData && res.user.avatarData.startsWith('http') ? (
                        <Image src={res.user.avatarData} alt={res.user.name || ''} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserCircle2 size={isTop3 ? 20 : 16} color="#FFF" />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: badgeColor, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        {badgeText}
                      </div>
                      <div style={{ fontSize: isTop3 ? '16px' : '15px', fontWeight: 700, color: '#FFF' }}>{res.user.name}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* About */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>About</h2>
          <div style={{ fontSize: '14px', color: '#D4D4D8', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {event.description}
          </div>
        </div>

        {/* Eligibility & Info */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Eligibility & Rules</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#A1A1AA' }}>Participation</span>
              <span style={{ fontWeight: 600 }}>{event.allowTeams ? 'Individual or Team' : 'Individual Only'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#A1A1AA' }}>Category</span>
              <span style={{ fontWeight: 600 }}>{event.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#A1A1AA' }}>Scope</span>
              <span style={{ fontWeight: 600 }}>{event.eventLevel}</span>
            </div>
            {event.prizePool && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', margin: '4px 0 0 0', paddingTop: '12px', borderTop: '1px solid #1F1F22' }}>
                <span style={{ color: '#A1A1AA', display: 'flex', alignItems: 'center', gap: '6px' }}><Trophy size={14} color="#F59E0B" /> Prize Pool</span>
                <span style={{ fontWeight: 700, color: '#F59E0B' }}>{event.prizePool}</span>
              </div>
            )}
          </div>
        </div>

        {/* Organization */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Organized by</h2>
          <Link href={`/user/${event.creator.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0A0A0A', border: '1px solid #1F1F22', borderRadius: '12px', padding: '16px', textDecoration: 'none' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              {event.creator.avatarData && event.creator.avatarData.startsWith('http') ? (
                <Image src={event.creator.avatarData} alt={event.creator.name || 'Org'} fill style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#1F1F22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={24} color="#71717A" />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFF' }}>{event.creator.name}</div>
              <div style={{ fontSize: '13px', color: '#A1A1AA' }}>@{event.creator.username}</div>
            </div>
            <ChevronRight size={18} color="#71717A" />
          </Link>
        </div>
        
      </div>
    </div>
  );
}
