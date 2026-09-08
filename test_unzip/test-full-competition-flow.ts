import { PrismaClient } from '@prisma/client';
import { awardCompetitionAP } from './lib/ap-service';
import { getPersonalRank } from './lib/ranking-service';

const prisma = new PrismaClient();

async function run() {
  console.log('--- E2E TEST: FULL COMPETITION LIFECYCLE ---');

  // 1. Setup Organizer (ensure ORGANIZATION account type)
  let org = await prisma.user.findFirst({
    where: { accountType: 'ORGANIZATION' }
  });

  if (!org) {
    org = await prisma.user.create({
      data: {
        name: 'Test Org',
        email: `org_${Date.now()}@test.com`,
        passwordHash: 'dummy',
        accountType: 'ORGANIZATION'
      }
    });
    console.log('Created temporary Organization account.');
  }

  // 2. Setup Personal User
  let user = await prisma.user.findFirst({
    where: { accountType: 'PERSONAL' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Participant',
        email: `participant_${Date.now()}@test.com`,
        passwordHash: 'dummy',
        accountType: 'PERSONAL',
        amerigamPoints: 0
      }
    });
  }

  // Record initial state
  const initialAP = user.amerigamPoints || 0;
  const initialRank = await getPersonalRank(user.id, 'INTERNATIONAL');
  console.log(`Initial State: User ${user.name} - AP: ${initialAP}, Rank: ${initialRank}`);

  // 3. Organizer creates competition
  console.log('\n[Flow] Organizer creates competition...');
  const event = await prisma.event.create({
    data: {
      name: 'E2E Test Championship',
      description: 'Testing the full flow',
      category: 'Test',
      locationType: 'Online',
      eventLevel: 'International', // Highest level for max AP impact
      startDate: new Date(),
      endDate: new Date(),
      registrationStart: new Date(),
      registrationEnd: new Date(),
      creatorId: org.id
    }
  });
  console.log(`Competition created: ${event.id}`);

  // 4. Personal user registers
  console.log('\n[Flow] Personal user registers...');
  const registration = await prisma.eventRegistration.create({
    data: {
      userId: user.id,
      eventId: event.id,
      status: 'PENDING',
      registrationId: `AMG-R-${Date.now()}`
    }
  });
  console.log(`User registered: ${registration.id}`);

  // 5. Organizer accepts & qualifies
  console.log('\n[Flow] Organizer accepts and qualifies the participant...');
  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: {
      status: 'APPROVED',
      qualificationStatus: 'QUALIFIED'
    }
  });

  // 6. Organizer publishes result (User wins GOLD)
  console.log('\n[Flow] Organizer publishes result (User gets WINNER / Gold)...');
  await prisma.$transaction(async (tx) => {
    await tx.eventResult.create({
      data: {
        eventId: event.id,
        userId: user.id!,
        registrationId: registration.id,
        type: 'WINNER',
        rank: 1,
        status: 'PUBLISHED'
      }
    });
    
    await tx.event.update({
      where: { id: event.id },
      data: { resultStatus: 'PUBLISHED' }
    });
  });

  // 7. AP Awarded
  console.log('\n[Flow] Awarding AP via ap-service...');
  await awardCompetitionAP(event.id);

  // 8. Verify Updates
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  const updatedAP = updatedUser?.amerigamPoints;
  const updatedRank = await getPersonalRank(user.id, 'INTERNATIONAL');
  
  console.log(`\nUpdated State: User ${user.name} - AP: ${updatedAP} (Expected: ${initialAP + 5000}), Rank: ${updatedRank}`);
  if (updatedAP === initialAP + 5000) {
    console.log('✅ AP accurately awarded (International Gold = 5000 AP)');
  } else {
    console.log('❌ AP mismatch');
  }

  // 9. Revoke / Change Result
  console.log('\n[Flow] Organizer revokes/changes result (downgrading to PARTICIPATION)...');
  await prisma.$transaction(async (tx) => {
    await tx.eventResult.deleteMany({
      where: { eventId: event.id, userId: user.id }
    });
    // Let's also mark them non-qualified to drop them to base participation
    await tx.eventRegistration.update({
      where: { id: registration.id },
      data: { qualificationStatus: 'NON_QUALIFIED' }
    });
  });

  // Re-run award engine (idempotent recalculation)
  console.log('\n[Flow] Re-running AP engine for recalculation...');
  await awardCompetitionAP(event.id);

  // 10. Verify Recalculation
  const finalUser = await prisma.user.findUnique({ where: { id: user.id } });
  const finalAP = finalUser?.amerigamPoints;
  const finalRank = await getPersonalRank(user.id, 'INTERNATIONAL');
  
  console.log(`\nFinal State: User ${user.name} - AP: ${finalAP} (Expected: ${initialAP + 250}), Rank: ${finalRank}`);
  if (finalAP === initialAP + 250) {
    console.log('✅ AP accurately recalculated (International Participation = 250 AP)');
  } else {
    console.log('❌ AP mismatch');
  }

  // 11. Cleanup test data
  console.log('\n[Flow] Cleaning up test data...');
  await prisma.event.delete({ where: { id: event.id } });

  console.log('\n--- TEST COMPLETE ---');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
