import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { joinCompetition, cancelRegistration } from './actions';
import { Trophy, MapPin, Globe, Star, Clock, Users } from 'lucide-react';

export default async function CompetitionsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const count = await prisma.competition.count();
  if (count === 0) {
    await prisma.competition.createMany({
      data: [
        {
          title: 'National AI Hackathon 2026',
          description: 'Build an AI solution that solves a real-world problem in your community. Show off your skills on a national stage.',
          category: 'Tech & AI',
          level: 'National',
          reward: 'National AI Champion Badge + 1000 Pts',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2026-08-15'),
        },
        {
          title: 'Gujarat State Photography Contest',
          description: 'Capture the essence of Gujarat. Open to all amateur and professional photographers in the state.',
          category: 'Visual Arts',
          level: 'State',
          reward: 'State Top Photographer Badge + 500 Pts',
          startDate: new Date('2026-07-20'),
          endDate: new Date('2026-08-01'),
        },
        {
          title: 'Global Startup Pitch',
          description: 'Pitch your business idea to international investors. Compete with founders from over 50 countries.',
          category: 'Business & Startups',
          level: 'International',
          reward: 'Global Founder Badge + 5000 Pts',
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-09-30'),
        }
      ]
    });
  }

  const competitions = await prisma.competition.findMany({
    include: {
      participants: {
        where: { userId }
      },
      _count: {
        select: { participants: true }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn var(--duration-slow) var(--ease-smooth)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', margin: '0 0 var(--space-2) 0' }}>
          <Trophy size={40} color="var(--accent-amber)" style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }} /> COMPETITIONS
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Compete at the State, National, or International level. Build your portfolio.</p>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        {competitions.map(comp => {
          const isParticipating = comp.participants.length > 0;
          const isOngoing = new Date() >= new Date(comp.startDate) && new Date() <= new Date(comp.endDate);
          const isUpcoming = new Date() < new Date(comp.startDate);

          return (
            <div key={comp.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', margin: 0, position: 'relative', overflow: 'hidden', borderLeft: isOngoing ? '4px solid var(--success)' : isUpcoming ? '4px solid var(--accent-purple)' : '4px solid var(--border-color)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: '1.5rem', fontWeight: 800 }}>{comp.title}</h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', background: 'var(--surface-2)', color: 'var(--text-primary)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid var(--border-color)' }}>
                      {comp.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 
                      comp.level === 'State' ? 'rgba(59, 130, 246, 0.15)' : 
                      comp.level === 'National' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                      color: comp.level === 'State' ? '#60a5fa' : comp.level === 'National' ? '#34d399' : '#fbbf24', 
                      padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-full)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid currentColor' }}>
                      {comp.level === 'State' ? <MapPin size={12}/> : comp.level === 'National' ? <Star size={12}/> : <Globe size={12}/>}
                      {comp.level}
                    </span>
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
              
              <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)', lineHeight: 1.6 }}>{comp.description}</p>
              
              <div style={{ background: 'var(--gradient-primary)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ background: 'var(--surface-1)', padding: 'var(--space-3)', borderRadius: 'calc(var(--radius-md) - 2px)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Trophy size={16} color="var(--accent-amber)" />
                  <strong>Reward:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{comp.reward}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Users size={14} /> {comp._count.participants} Participants</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Clock size={14} /> Starts: {new Date(comp.startDate).toLocaleDateString()}</span>
                </span>
                
                {isParticipating ? (
                  <form action={cancelRegistration}>
                    <input type="hidden" name="competitionId" value={comp.id} />
                    <button type="submit" className="btn btn-small btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      Cancel Registration
                    </button>
                  </form>
                ) : (
                  <form action={joinCompetition}>
                    <input type="hidden" name="competitionId" value={comp.id} />
                    <button type="submit" className="btn btn-small" style={{ padding: 'var(--space-2) var(--space-5)' }}>Participate Now</button>
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
