import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { joinEvent, cancelRegistration } from './actions';
import { Trophy, MapPin, Globe, Star, Clock, Users, CalendarCheck, QrCode } from 'lucide-react';
import Link from 'next/link';

export default async function EventsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const count = await prisma.event.count();
  if (count === 0) {
    await prisma.event.createMany({
      data: [
        {
          name: 'National AI Hackathon 2026',
          description: 'Build an AI solution that solves a real-world problem in your community. Show off your skills on a national stage.',
          category: 'Hackathon',
          locationType: 'HYBRID',
          venue: 'Ahmedabad IT Hub',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-08-15'),
          requireCheckIn: true,
          requireApproval: false,
          allowTeams: true,
          requireSubmissions: true,
          creatorId: userId
        },
        {
          name: 'Gujarat State Photography Contest',
          description: 'Capture the essence of Gujarat. Open to all amateur and professional photographers in the state.',
          category: 'Visual Arts',
          locationType: 'ONLINE',
          startDate: new Date('2026-07-20'),
          endDate: new Date('2026-08-01'),
          requireCheckIn: false,
          requireApproval: true,
          creatorId: userId
        },
        {
          name: 'Global Startup Pitch',
          description: 'Pitch your business idea to international investors. Compete with founders from over 50 countries.',
          category: 'Business',
          locationType: 'ONLINE',
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-09-30'),
          requireCheckIn: false,
          requireApproval: true,
          allowTeams: false,
          requireSubmissions: true,
          creatorId: userId
        }
      ]
    });
  }

  const events = await prisma.event.findMany({
    include: {
      registrations: {
        where: { userId }
      },
      _count: {
        select: { registrations: true }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', margin: '0 0 var(--space-2) 0' }}>
          <Trophy size={40} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }} /> EVENTS & COMPETITIONS
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Discover, apply, and check-in to global events.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
          <Link href="/my-tickets" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <QrCode size={18} /> My Event Tickets
          </Link>
          <Link href="/events/scanner" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <CalendarCheck size={18} /> Staff Scanner Mode
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        {events.map(event => {
          const registration = event.registrations[0];
          const isParticipating = !!registration;
          const isOngoing = new Date() >= new Date(event.startDate) && new Date() <= new Date(event.endDate);
          const isUpcoming = new Date() < new Date(event.startDate);

          return (
            <div key={event.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', margin: 0, position: 'relative', overflow: 'hidden', borderLeft: isOngoing ? '4px solid var(--success)' : isUpcoming ? '4px solid var(--accent-purple)' : '4px solid var(--border-color)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: '1.5rem', fontWeight: 800 }}>{event.name}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', background: 'var(--surface-2)', color: 'var(--text-primary)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid var(--border-color)' }}>
                      {event.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid currentColor' }}>
                      <MapPin size={12}/> {event.locationType} {event.venue ? `· ${event.venue}` : ''}
                    </span>
                    {event.allowTeams && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid currentColor', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12}/> Team Event
                      </span>
                    )}
                    {event.requireSubmissions && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid currentColor' }}>
                        Project Submission Required
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', background: isOngoing ? 'rgba(16, 185, 129, 0.1)' : isUpcoming ? 'rgba(139, 92, 246, 0.1)' : 'var(--surface-2)' }}>
                  {isOngoing ? (
                    <><span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '0.8rem' }}>● LIVE NOW</span></>
                  ) : isUpcoming ? (
                    <><Clock size={12} color="var(--accent-purple)" /><span style={{ color: 'var(--accent-purple)', fontWeight: 800, fontSize: '0.8rem' }}>UPCOMING</span></>
                  ) : (
                    <><span style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem' }}>ENDED</span></>
                  )}
                </div>
              </div>
              
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)', lineHeight: 1.6 }}>{event.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Users size={14} /> {event._count.registrations} Registrations</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Clock size={14} /> Starts: {new Date(event.startDate).toLocaleDateString()}</span>
                </span>
                
                {isParticipating ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: registration.status === 'APPROVED' ? 'var(--success)' : 'var(--accent-amber)' }}>
                      Status: {registration.status}
                    </span>
                    <form action={cancelRegistration}>
                      <input type="hidden" name="eventId" value={event.id} />
                      <button type="submit" className="btn btn-small btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        Cancel Registration
                      </button>
                    </form>
                  </div>
                ) : (
                  <form action={joinEvent}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <button type="submit" className="btn btn-small" style={{ padding: 'var(--space-2) var(--space-5)' }}>Apply / Register</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
