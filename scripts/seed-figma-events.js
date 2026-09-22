const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Find or create jubelmorac
  let organizer = await prisma.user.findFirst({
    where: { username: 'jubelmorac' }
  });

  if (!organizer) {
    organizer = await prisma.user.create({
      data: {
        username: 'jubelmorac',
        name: 'jubelmorac',
        email: 'jubelmorac@amerigam.com',
        password: 'password123',
        amerigamPoints: 5003,
        location: 'Surat, Gujarat',
        city: 'Surat',
        state: 'Gujarat',
        country: 'India',
        bio: 'Experienced in planning and coordinating events from concept to completion. Skilled in managing event schedules, coordinating with clients and vendors, handling registrations, and ensuring smooth event operations. Strong communication, organizational, and problem-solving and memorable events.'
      }
    });
    console.log('Created organizer jubelmorac:', organizer.id);
  } else {
    console.log('Found organizer jubelmorac:', organizer.id);
  }

  // 2. Define the 4 Figma competitions
  const figmaEvents = [
    {
      name: 'Behind You - Running RR',
      category: 'Running',
      tags: 'Running, New Friends, Your Potential, Sports',
      description: 'Behind You is a high-intensity running race challenge testing endurance, speed, and strategic pacing. Set across professional track facilities, runners battle through timed heats to claim the podium.',
      eventLevel: 'State',
      locationType: 'OFFLINE',
      venue: 'SURAT - Opp VR Mall, Dumas Rd, Magdalla, Surat, Gujarat 395007',
      city: 'SURAT',
      state: 'Gujarat',
      country: 'India',
      startDate: new Date('2026-09-08T07:00:00Z'),
      endDate: new Date('2026-09-08T14:00:00Z'),
      coverImage: '/images/competitions/poster_comp_1.png',
      prizePool: 'AP 150-$50',
      entryFee: 50,
      currency: 'INR',
      status: 'PUBLISHED',
      creatorId: organizer.id
    },
    {
      name: 'Tried-Jump',
      category: 'Athletics',
      tags: 'High Jump, Track & Field, Fitness, Sports',
      description: 'Tried-Jump is an elite high jump and athletics tournament uniting track and field talent. Push personal records in height, vertical technique, and athletic precision in front of seasoned judges.',
      eventLevel: 'National',
      locationType: 'OFFLINE',
      venue: 'AHMEDABAD - Sports Complex, Navrangpura, Ahmedabad, Gujarat 380009',
      city: 'AHMEDABAD',
      state: 'Gujarat',
      country: 'India',
      startDate: new Date('2026-10-11T09:00:00Z'),
      endDate: new Date('2026-10-11T18:00:00Z'),
      coverImage: '/images/competitions/poster_comp_2.png',
      prizePool: 'AP 100-$20',
      entryFee: 20,
      currency: 'INR',
      status: 'PUBLISHED',
      creatorId: organizer.id
    },
    {
      name: 'WAR-E-Man',
      category: 'Martial Arts',
      tags: 'Running, New Friends, Your Potential, Sports',
      description: 'WAR-E-Man is a competitive martial-arts championship designed around discipline, athletic ability, technique, reflexes, stamina, and sportsmanship. The main idea of the competition is to bring trained fighters together in a controlled sporting environment where they can demonstrate their skills against opponents of a similar age, experience, and weight category. Despite the aggressive-sounding name, the competition is based on regulated combat sports, with safety rules, protective equipment, referees, and medical supervision rather than uncontrolled fighting.\n\nThe competition can begin with a registration and verification stage, where participants provide their basic details and information about their previous training. Before competing, fighters are placed into appropriate categories based on factors such as age, weight, experience level, and discipline. This helps make the matches more balanced and reduces unnecessary risk.',
      eventLevel: 'International',
      locationType: 'OFFLINE',
      venue: 'SURAT - Opp VR Mall, Dumas Rd, Magdalla, Surat, Gujarat 395007',
      city: 'SURAT',
      state: 'Gujarat',
      country: 'India',
      startDate: new Date('2026-09-08T08:00:00Z'),
      endDate: new Date('2026-09-08T20:00:00Z'),
      coverImage: '/images/competitions/poster_comp_3.png',
      prizePool: '$500',
      entryFee: 60,
      currency: 'USD',
      status: 'PUBLISHED',
      creatorId: organizer.id
    },
    {
      name: 'Trocfy',
      category: 'Championship',
      tags: 'Trophy, Championship, League, Sports',
      description: 'Trocfy is an exclusive multisport tournament league where champions across disciplines compete for ultimate glory and national rankings. Featuring state-of-the-art arena setups and live scoring.',
      eventLevel: 'State',
      locationType: 'OFFLINE',
      venue: 'SURAT - Indoor Stadium, Athwa Lines, Surat, Gujarat 395001',
      city: 'SURAT',
      state: 'Gujarat',
      country: 'India',
      startDate: new Date('2026-09-08T07:00:00Z'),
      endDate: new Date('2026-09-08T17:00:00Z'),
      coverImage: '/images/competitions/poster_comp_4.png',
      prizePool: 'AP 150-$50',
      entryFee: 50,
      currency: 'INR',
      status: 'PUBLISHED',
      creatorId: organizer.id
    }
  ];

  for (const item of figmaEvents) {
    const existing = await prisma.event.findFirst({
      where: { name: item.name }
    });
    if (!existing) {
      const created = await prisma.event.create({ data: item });
      console.log(`Created event: ${item.name} (${created.id})`);
    } else {
      const updated = await prisma.event.update({
        where: { id: existing.id },
        data: item
      });
      console.log(`Updated event: ${item.name} (${updated.id})`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
