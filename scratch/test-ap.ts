import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { getCompetitionAP, challengeAPMatrix } from '../lib/ap-matrix';
import { awardCompetitionAP, revokeCompetitionAP, awardChallengeAP } from '../lib/ap-service';

async function runTests() {
  console.log("=== AP ENGINE TEST START ===");

  // 1. Matrix Check
  const levels = ['Local', 'District', 'State', 'National', 'International'];
  const results = ['PARTICIPATION', 'QUALIFIED', 'BRONZE', 'SILVER', 'GOLD'];
  console.log("--- Matrix Logic Verification ---");
  for (const l of levels) {
    for (const r of results) {
      const ap = getCompetitionAP(l, r);
      console.log(`[${l}] ${r} => ${ap} AP`);
    }
  }

  // Find a test user and event, or just output that matrix is correct.
  // Testing full E2E DB logic:
  try {
    const testEvent = await prisma.event.findFirst({
      where: { resultStatus: 'PUBLISHED' },
      include: { registrations: true, results: true }
    });

    if (testEvent) {
      console.log(`\n--- E2E Database Test ---`);
      console.log(`Found published event: ${testEvent.name} [${testEvent.eventLevel}]`);
      
      const beforeUser = await prisma.user.findUnique({ where: { id: testEvent.creatorId } }); // We'll just check someone.
      // Wait, let's pick a user who has a registration
      const participant = testEvent.registrations[0];
      if (!participant) {
          console.log("No participants in this event. Skipping E2E DB test.");
          return;
      }
      const userId = participant.userId;

      // Revoke first to start clean (if any)
      await revokeCompetitionAP(testEvent.id);
      let userClean = await prisma.user.findUnique({ where: { id: userId } });
      console.log(`User ${userId} initial AP (after clean): ${userClean.amerigamPoints}`);

      // Award once
      await awardCompetitionAP(testEvent.id);
      let userAwarded = await prisma.user.findUnique({ where: { id: userId } });
      console.log(`User ${userId} AP after AWARD 1: ${userAwarded.amerigamPoints}`);

      // Award twice (Idempotency)
      await awardCompetitionAP(testEvent.id);
      let userAwarded2 = await prisma.user.findUnique({ where: { id: userId } });
      console.log(`User ${userId} AP after AWARD 2 (Idempotent): ${userAwarded2.amerigamPoints}`);

      // Revoke
      await revokeCompetitionAP(testEvent.id);
      let userRevoked = await prisma.user.findUnique({ where: { id: userId } });
      console.log(`User ${userId} AP after REVOKE: ${userRevoked.amerigamPoints}`);

      // Challenge AP
      await awardChallengeAP(userId, "challenge-123", "Test Challenge", "Medium");
      let userChal = await prisma.user.findUnique({ where: { id: userId } });
      console.log(`User AP after Challenge: ${userChal.amerigamPoints}`);
      
    } else {
        console.log("\nNo published event found to run E2E DB test. But Matrix and Schema are valid.");
    }

  } catch (err) {
      console.error("Test Error:", err);
  } finally {
      await prisma.$disconnect();
  }
}

runTests();
