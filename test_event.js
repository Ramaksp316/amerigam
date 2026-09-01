const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const payload = {
      name: 'Test Event',
      description: 'Test description',
      shortDescription: '',
      category: 'Technology',
      tags: '',
      eventLevel: 'State',
      locationType: 'ONLINE',
      venue: '',
      country: '',
      state: '',
      city: '',
      district: '',
      startDate: new Date('2026-10-10T10:00'),
      endDate: new Date('2026-10-11T10:00'),
      registrationStart: null,
      registrationEnd: null,
      entryFee: 0,
      currency: 'INR',
      allowTeams: false,
      minTeamSize: null,
      maxTeamSize: null,
      onlineLink: '',
      rules: '',
      eligibility: '',
      qualificationEnabled: false,
      qualificationInfo: '',
      prizePool: '',
      coverImage: '',
      participantLimit: null,
      status: 'PUBLISHED',
      // Get an organization user ID
      creatorId: (await prisma.user.findFirst({ where: { accountType: 'ORGANIZATION' } })).id,
      requireApproval: false,
      evaluationMethod: 'NONE',
    };

    console.log('Attempting to create event...');
    const event = await prisma.event.create({ data: payload });
    console.log('Success:', event.id);
  } catch (error) {
    console.error('Prisma Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
