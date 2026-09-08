const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const userId = '646e39aa-5c2b-48ad-a234-6441093d69ee';
  
  console.log("Fetching user...");
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { following: true }
  });

  const followingIds = currentUser?.following.map(f => f.followingId) || [];
  
  console.log("Fetching following...");
  const followingEvents = await prisma.event.findMany({
    where: { creatorId: { in: followingIds } },
    include: {
      creator: { select: { id: true, name: true, avatarData: true } },
      _count: { select: { registrations: true } }
    },
    orderBy: { startDate: 'asc' },
    take: 10
  });

  const suggestedMapping = {
    'Developer': ['CodeRush India', 'Buildathon India', 'DesignSprint League'],
    'Founder': ['PitchArena', 'IgniteX Campus League', 'Buildathon India'],
    'Photographer': ['LensQuest', 'ArtSphere Collective'],
    'Musician': ['Rhythm Clash'],
    'Athlete': ['FitBattle India', 'NextGen Sports League'],
    'Filmmaker': ['FrameFest India', 'Creator Clash India'],
    'Gamer': ['GameGrid Esports'],
    'Public Speaker': ['SpeakUp Championship']
  };

  const userIdentity = currentUser?.identity || '';
  let relevantOrgNames = suggestedMapping[userIdentity] || [];

  console.log("Fetching suggested...");
  const suggestedEvents = await prisma.event.findMany({
    where: {
      NOT: { creatorId: { in: followingIds } },
      ...(relevantOrgNames.length > 0 && {
        creator: { name: { in: relevantOrgNames } }
      })
    },
    include: {
      creator: { select: { id: true, name: true, avatarData: true } },
      _count: { select: { registrations: true } }
    },
    orderBy: { startDate: 'desc' },
    take: 10
  });

  console.log("Fetching registrations...");
  const userRegistrations = await prisma.eventRegistration.findMany({
    where: { userId }
  });

  console.log("Fetching topEvents...");
  const topEvents = await prisma.event.findMany({
    include: {
      creator: { select: { id: true, name: true, avatarData: true } },
      _count: { select: { registrations: true } }
    },
    orderBy: { participantLimit: 'desc' },
    take: 15
  });

  console.log("Fetching topPeople...");
  const topPeople = await prisma.user.findMany({
    where: { accountType: 'PERSONAL' },
    take: 10,
    select: { id: true, name: true, avatarData: true, identity: true }
  });

  console.log("All OK");
}

test().catch(console.error).finally(() => prisma.$disconnect());
