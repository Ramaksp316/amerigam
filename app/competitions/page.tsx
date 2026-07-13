import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { joinCompetition } from './actions';
import { Trophy, MapPin, Globe, Star } from 'lucide-react';

export default async function CompetitionsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  // --- DEV SEEDING START (Create dummy competitions if empty) ---
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
  // --- DEV SEEDING END ---

  const competitions = await prisma.competition.findMany({
    include: {
      participants: {
        where: { userId } // Check if current user is participating
      },
      _count: {
        select: { participants: true }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="heading-jakaas" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <Trophy size={40} color="#f09433" /> COMPETITIONS
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Compete at the State, National, or International level. Build your portfolio.</p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {competitions.map(comp => {
          const isParticipating = comp.participants.length > 0;
          const isOngoing = new Date() >= new Date(comp.startDate) && new Date() <= new Date(comp.endDate);
          const isUpcoming = new Date() < new Date(comp.startDate);

          return (
            <div key={comp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>{comp.title}</h3>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {comp.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', backgroundColor: 
                      comp.level === 'State' ? '#e0f2fe' : 
                      comp.level === 'National' ? '#dcfce7' : '#fef08a', 
                      color: '#1f2937', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {comp.level === 'State' ? <MapPin size={12}/> : comp.level === 'National' ? <Star size={12}/> : <Globe size={12}/>}
                      {comp.level}
                    </span>
                  </div>
                </div>
                
                {isOngoing ? (
                  <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>● LIVE NOW</span>
                ) : isUpcoming ? (
                  <span style={{ color: 'var(--btn-primary-bg)', fontWeight: 'bold', fontSize: '0.9rem' }}>UPCOMING</span>
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>ENDED</span>
                )}
              </div>
              
              <p style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{comp.description}</p>
              
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>
                <strong>🏆 Reward:</strong> {comp.reward}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  👥 {comp._count.participants} Participants • Starts: {new Date(comp.startDate).toLocaleDateString()}
                </span>
                
                {isParticipating ? (
                  <button disabled className="btn btn-small" style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', color: 'white', cursor: 'default' }}>
                    ✓ Registered
                  </button>
                ) : (
                  <form action={joinCompetition}>
                    <input type="hidden" name="competitionId" value={comp.id} />
                    <button type="submit" className="btn btn-outline btn-small" style={{ fontWeight: 600 }}>Participate Now</button>
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
