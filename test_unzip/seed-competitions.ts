import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORGANIZATIONS = [
  { name: 'IgniteX Campus League', username: 'ignitex', cat: 'Academic' },
  { name: 'CodeRush India', username: 'coderush', cat: 'Technology' },
  { name: 'ArtSphere Collective', username: 'artsphere', cat: 'Art & Design' },
  { name: 'PitchArena', username: 'pitcharena', cat: 'Startup & Business' },
  { name: 'NextGen Sports League', username: 'nextgensports', cat: 'Sports' },
  { name: 'FrameFest India', username: 'framefest', cat: 'Film & Media' },
  { name: 'SpeakUp Championship', username: 'speakup', cat: 'Public Speaking' },
  { name: 'GameGrid Esports', username: 'gamegrid', cat: 'Gaming' },
  { name: 'LensQuest', username: 'lensquest', cat: 'Photography' },
  { name: 'Buildathon India', username: 'buildathon', cat: 'Technology' },
  { name: 'Rhythm Clash', username: 'rhythmclash', cat: 'Music' },
  { name: 'DesignSprint League', username: 'designsprint', cat: 'Art & Design' },
  { name: 'FitBattle India', username: 'fitbattle', cat: 'Sports' },
  { name: 'Young Minds Olympiad', username: 'youngminds', cat: 'Academic' },
  { name: 'Creator Clash India', username: 'creatorclash', cat: 'Film & Media' },
];

const COMP_LEVELS = ['Local', 'District', 'State', 'National', 'International'];
const LOCATIONS = ['ONLINE', 'OFFLINE', 'HYBRID'];
const CITIES = ['Surat', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune'];
const STATES = ['Gujarat', 'Maharashtra', 'Delhi', 'Karnataka'];

async function main() {
  console.log('Starting Competition Seeding (Phase 1)...');

  let orgCount = 0;
  let compCount = 0;
  let paidCount = 0;
  let freeCount = 0;
  const statuses = { 'Registration Open': 0, 'Upcoming': 0, 'Live': 0, 'Ending Soon': 0, 'Completed': 0 };
  const scopeDist = { 'Local': 0, 'District': 0, 'State': 0, 'National': 0, 'International': 0 };

  for (const orgData of ORGANIZATIONS) {
    let user = await prisma.user.findFirst({ where: { username: orgData.username } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: orgData.username,
          name: orgData.name,
          email: `${orgData.username}@amerigam.com`,
          password: 'password123',
          accountType: 'ORGANIZATION',
          onboarded: true,
          bio: `Official account for ${orgData.name}. Hosting premium ${orgData.cat} competitions.`,
          avatarData: `https://ui-avatars.com/api/?name=${encodeURIComponent(orgData.name)}&background=random`,
          location: CITIES[Math.floor(Math.random() * CITIES.length)]
        }
      });
      await prisma.organizationProfile.create({
        data: {
          userId: user.id,
          orgType: orgData.cat,
          mainAudience: 'Students and Professionals'
        }
      });
    }
    orgCount++;

    const numComps = 3 + Math.floor(Math.random() * 2); 
    
    await prisma.event.deleteMany({ where: { creatorId: user.id } });

    for (let i = 0; i < numComps; i++) {
      const isPaid = Math.random() > 0.6; 
      const entryFee = isPaid ? [99, 199, 499, 999][Math.floor(Math.random() * 4)] : 0;
      if (isPaid) paidCount++; else freeCount++;

      const now = new Date();
      let regStart, regEnd, compStart, compEnd;
      let statusStr = '';
      
      const r = Math.random();
      if (r < 0.2) {
        regStart = new Date(now.getTime() - 60 * 86400000); regEnd = new Date(now.getTime() - 40 * 86400000);
        compStart = new Date(now.getTime() - 30 * 86400000); compEnd = new Date(now.getTime() - 28 * 86400000);
        statusStr = 'Completed';
      } else if (r < 0.4) {
        regStart = new Date(now.getTime() + 10 * 86400000); regEnd = new Date(now.getTime() + 30 * 86400000);
        compStart = new Date(now.getTime() + 40 * 86400000); compEnd = new Date(now.getTime() + 45 * 86400000);
        statusStr = 'Upcoming';
      } else if (r < 0.6) {
        regStart = new Date(now.getTime() - 5 * 86400000); regEnd = new Date(now.getTime() + 15 * 86400000);
        compStart = new Date(now.getTime() + 20 * 86400000); compEnd = new Date(now.getTime() + 25 * 86400000);
        statusStr = 'Registration Open';
      } else if (r < 0.8) {
        regStart = new Date(now.getTime() - 30 * 86400000); regEnd = new Date(now.getTime() - 10 * 86400000);
        compStart = new Date(now.getTime() - 2 * 86400000); compEnd = new Date(now.getTime() + 2 * 86400000);
        statusStr = 'Live';
      } else {
        regStart = new Date(now.getTime() - 20 * 86400000); regEnd = new Date(now.getTime() + 1 * 86400000);
        compStart = new Date(now.getTime() + 5 * 86400000); compEnd = new Date(now.getTime() + 10 * 86400000);
        statusStr = 'Ending Soon';
      }
      // @ts-ignore
      statuses[statusStr]++;

      const level = COMP_LEVELS[Math.floor(Math.random() * COMP_LEVELS.length)];
      // @ts-ignore
      scopeDist[level]++;

      const locType = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      let venue = locType === 'ONLINE' ? 'Virtual' : `${CITIES[Math.floor(Math.random() * CITIES.length)]}, ${STATES[Math.floor(Math.random() * STATES.length)]}`;

      let coverImage = 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=800&q=80';
      if (orgData.cat === 'Technology') coverImage = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80';
      else if (orgData.cat === 'Sports') coverImage = 'https://images.unsplash.com/photo-1461896836934-ffe145bf8c9c?w=800&q=80';
      else if (orgData.cat === 'Art & Design') coverImage = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80';
      else if (orgData.cat === 'Music') coverImage = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80';
      else if (orgData.cat === 'Gaming') coverImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80';
      else if (orgData.cat === 'Film & Media') coverImage = 'https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?w=800&q=80';

      const ev = await prisma.event.create({
        data: {
          name: `${orgData.name} Edition ${i + 1}`,
          description: `Welcome to the ${orgData.name} Edition ${i + 1}. This is a premier ${orgData.cat} competition open to passionate individuals and teams.\n\n### Format & Rules\n- Round 1: Qualification\n- Round 2: Main Event\n- Final Round: Championship\n\nMake sure to adhere to all guidelines and participate with full enthusiasm.`,
          category: orgData.cat,
          eventLevel: level,
          locationType: locType,
          venue: venue,
          startDate: compStart,
          endDate: compEnd,
          registrationStart: regStart,
          registrationEnd: regEnd,
          coverImage: coverImage,
          prizePool: `?${(Math.floor(Math.random() * 50) + 10) * 1000}`,
          entryFee: entryFee,
          currency: 'INR',
          creatorId: user.id,
          allowTeams: Math.random() > 0.5,
          participantLimit: Math.random() > 0.5 ? 100 + Math.floor(Math.random() * 900) : null,
        }
      });
      compCount++;
    }
  }

  console.log(`\n? Seeding Complete!`);
  console.log(`1. Organizations Used: ${orgCount}`);
  console.log(`2. Total Competitions: ${compCount}`);
  console.log(`3. Avg per org: ${(compCount/orgCount).toFixed(1)}`);
  console.log(`4. Statuses: \n${JSON.stringify(statuses, null, 2)}`);
  console.log(`5. Free vs Paid: ${freeCount} Free, ${paidCount} Paid`);
  console.log(`6. Geographic Scope: \n${JSON.stringify(scopeDist, null, 2)}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
