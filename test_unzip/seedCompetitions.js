const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const organizations = [
  { name: 'IgniteX Campus League', category: 'Hackathon', niche: 'College students / innovation / campus challenges' },
  { name: 'CodeRush India', category: 'Hackathon', niche: 'Developers / coding / AI / hackathons' },
  { name: 'ArtSphere Collective', category: 'Design Sprint', niche: 'Drawing / illustration / creative art' },
  { name: 'PitchArena', category: 'Hackathon', niche: 'Startups / entrepreneurship' },
  { name: 'NextGen Sports League', category: 'Esports', niche: 'Sports / athletics' },
  { name: 'FrameFest India', category: 'Other', niche: 'Filmmaking / video / editing' },
  { name: 'SpeakUp Championship', category: 'Other', niche: 'Speaking / debate / communication' },
  { name: 'GameGrid Esports', category: 'Esports', niche: 'Gaming / esports' },
  { name: 'LensQuest', category: 'Other', niche: 'Photography' },
  { name: 'Buildathon India', category: 'Hackathon', niche: 'Product / prototypes / innovation' },
  { name: 'Rhythm Clash', category: 'Other', niche: 'Music' },
  { name: 'DesignSprint League', category: 'Design Sprint', niche: 'UI/UX / graphic design' },
  { name: 'FitBattle India', category: 'Esports', niche: 'Fitness / running / endurance' },
  { name: 'Young Minds Olympiad', category: 'Other', niche: 'Students / knowledge / logic / science' },
  { name: 'Creator Clash India', category: 'Other', niche: 'Creators / content / video' }
];

const mockCoverImages = [
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop"
];

const scopes = ['INTERNATIONAL', 'NATIONAL', 'STATE', 'CITY', 'DISTRICT', 'CAMPUS'];

const competitionIdeas = {
  'IgniteX Campus League': [
    { title: 'Campus Innovation Challenge', scope: 'CAMPUS', type: 'TEAM' },
    { title: 'Student Startup Sprint', scope: 'STATE', type: 'TEAM' },
    { title: 'Inter-College Idea League', scope: 'CITY', type: 'TEAM' }
  ],
  'CodeRush India': [
    { title: 'AI Build Hackathon', scope: 'INTERNATIONAL', type: 'TEAM' },
    { title: 'Full Stack Sprint', scope: 'NATIONAL', type: 'SOLO' },
    { title: 'CodeRush 48H Hackathon', scope: 'NATIONAL', type: 'TEAM' }
  ],
  'ArtSphere Collective': [
    { title: 'Digital Art Championship', scope: 'NATIONAL', type: 'SOLO' },
    { title: 'Character Design Challenge', scope: 'INTERNATIONAL', type: 'SOLO' },
    { title: 'Poster Design Battle', scope: 'STATE', type: 'SOLO' }
  ],
  'PitchArena': [
    { title: 'Startup Pitch Competition', scope: 'NATIONAL', type: 'TEAM' },
    { title: 'Young Founder League', scope: 'STATE', type: 'SOLO' },
    { title: 'Business Model Battle', scope: 'CITY', type: 'TEAM' }
  ],
  'NextGen Sports League': [
    { title: 'Inter-City Football Cup', scope: 'CITY', type: 'TEAM' },
    { title: 'Athletics Sprint Championship', scope: 'STATE', type: 'SOLO' },
    { title: 'Basketball League', scope: 'NATIONAL', type: 'TEAM' }
  ],
  'FrameFest India': [
    { title: '60 Second Film Challenge', scope: 'NATIONAL', type: 'TEAM' },
    { title: 'Cinematography Challenge', scope: 'INTERNATIONAL', type: 'SOLO' }
  ],
  'SpeakUp Championship': [
    { title: 'National Debate League', scope: 'NATIONAL', type: 'TEAM' },
    { title: 'Storytelling Battle', scope: 'STATE', type: 'SOLO' }
  ],
  'GameGrid Esports': [
    { title: 'Esports Team Cup', scope: 'INTERNATIONAL', type: 'TEAM' },
    { title: 'Solo Gaming Championship', scope: 'NATIONAL', type: 'SOLO' }
  ],
  'LensQuest': [
    { title: 'Street Photography Challenge', scope: 'NATIONAL', type: 'SOLO' },
    { title: 'Nature Photography Open', scope: 'INTERNATIONAL', type: 'SOLO' }
  ],
  'Buildathon India': [
    { title: 'Build Better Hackathon', scope: 'NATIONAL', type: 'TEAM' },
    { title: 'Prototype Sprint', scope: 'STATE', type: 'TEAM' }
  ],
  'Rhythm Clash': [
    { title: 'Singing Championship', scope: 'NATIONAL', type: 'SOLO' },
    { title: 'Band Battle', scope: 'STATE', type: 'TEAM' }
  ],
  'DesignSprint League': [
    { title: 'UI/UX Design Sprint', scope: 'INTERNATIONAL', type: 'SOLO' },
    { title: 'Logo Design Challenge', scope: 'NATIONAL', type: 'SOLO' }
  ],
  'FitBattle India': [
    { title: '10K Running Challenge', scope: 'CITY', type: 'SOLO' },
    { title: 'Endurance Championship', scope: 'STATE', type: 'SOLO' }
  ],
  'Young Minds Olympiad': [
    { title: 'Logic Olympiad', scope: 'NATIONAL', type: 'SOLO' },
    { title: 'Science Problem Solving', scope: 'STATE', type: 'TEAM' }
  ],
  'Creator Clash India': [
    { title: 'Short Video Challenge', scope: 'NATIONAL', type: 'SOLO' },
    { title: 'Creator Storytelling Battle', scope: 'INTERNATIONAL', type: 'SOLO' }
  ]
};

function getRandomDate(baseDate, offsetDays) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

async function seed() {
  console.log('Seeding Competitions (Events)...');
  
  for (const orgDef of organizations) {
    const orgUser = await prisma.user.findFirst({
      where: { name: orgDef.name }
    });

    if (!orgUser) {
      console.warn(`Organization missing: ${orgDef.name}. Skipping.`);
      continue;
    }

    const ideas = competitionIdeas[orgDef.name] || [];
    
    let offsetDaysOptions = [
      { start: -30, end: -20, status: 'COMPLETED' },
      { start: 2, end: 12, status: 'LIVE' },
      { start: 15, end: 30, status: 'UPCOMING' }
    ];

    for (let i = 0; i < ideas.length; i++) {
      const idea = ideas[i];
      const timing = offsetDaysOptions[i % offsetDaysOptions.length];
      const startDate = getRandomDate(new Date(), timing.start);
      const endDate = getRandomDate(new Date(), timing.end);
      
      const eventExists = await prisma.event.findFirst({
        where: { name: idea.title, creatorId: orgUser.id }
      });

      if (eventExists) {
        console.log(`Event ${idea.title} already exists. Skipping.`);
        continue;
      }

      await prisma.event.create({
        data: {
          name: idea.title,
          description: `A premier competition focused on ${orgDef.niche.toLowerCase()}.`,
          coverImage: mockCoverImages[Math.floor(Math.random() * mockCoverImages.length)],
          prizePool: i % 2 === 0 ? "₹50,000" : "Mentorship + Goodies",
          creatorId: orgUser.id,
          category: orgDef.category,
          eventLevel: idea.scope, // 'INTERNATIONAL', 'NATIONAL', 'STATE', 'CITY', 'DISTRICT', 'CAMPUS'
          locationType: 'ONLINE',
          venue: 'Virtual',
          startDate: startDate,
          endDate: endDate,
          registrationEnd: getRandomDate(startDate, -1),
          participantLimit: Math.floor(Math.random() * 500) + 100,
          allowTeams: idea.type === 'TEAM',
        }
      });
      console.log(`Created Event: ${idea.title} for ${orgDef.name}`);
    }
  }

  console.log('Seeding complete.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
