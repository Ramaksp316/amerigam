const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding Follow Relationships...');

  // 1. Fetch all Personal accounts
  const personalUsers = await prisma.user.findMany({
    where: { accountType: 'PERSONAL' }
  });

  // 2. Fetch Organization accounts
  const organizations = await prisma.user.findMany({
    where: { accountType: 'ORGANIZATION' }
  });

  if (organizations.length === 0) {
    console.log('No Competition Organizations found. Run previous seeds first.');
    return;
  }

  // Create a quick lookup map by name
  const orgMap = {};
  for (const o of organizations) {
    orgMap[o.name] = o.id;
  }

  const mapping = [
    { identity: 'Developer', orgs: ['CodeRush India', 'Buildathon India', 'DesignSprint League'] },
    { identity: 'Founder', orgs: ['PitchArena', 'IgniteX Campus League', 'Buildathon India'] },
    { identity: 'Photographer', orgs: ['LensQuest', 'ArtSphere Collective'] },
    { identity: 'Musician', orgs: ['Rhythm Clash'] },
    { identity: 'Athlete', orgs: ['FitBattle India', 'NextGen Sports League'] },
    { identity: 'Filmmaker', orgs: ['FrameFest India', 'Creator Clash India'] },
    { identity: 'Gamer', orgs: ['GameGrid Esports'] },
    { identity: 'Public Speaker', orgs: ['SpeakUp Championship'] }
  ];

  for (const user of personalUsers) {
    let targetOrgs = [];
    
    // Find matching identity mapping
    const match = mapping.find(m => user.identity && user.identity.toLowerCase().includes(m.identity.toLowerCase()));
    
    if (match) {
      targetOrgs = match.orgs;
    } else {
      // Fallback: pick a few random orgs for testing
      targetOrgs = ['IgniteX Campus League', 'CodeRush India'];
    }

    for (const orgName of targetOrgs) {
      const orgId = orgMap[orgName];
      if (!orgId) continue;

      // Check if follow exists
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: user.id, followingId: orgId } }
      });

      if (!existing) {
        await prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: orgId
          }
        });
        console.log(`User ${user.name} now follows ${orgName}`);
      }
    }
  }

  console.log('Follow seeding complete.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
