import { PrismaClient } from '@prisma/client';
import { getPersonalRank } from './lib/ranking-service';

const prisma = new PrismaClient();

async function run() {
  console.log('--- E2E TEST: RANKING UPDATES ---');

  // 1. Find two personal users
  const users = await prisma.user.findMany({
    where: { accountType: 'PERSONAL' },
    take: 2
  });

  if (users.length < 2) {
    console.log('Need at least 2 Personal users for the test.');
    return;
  }

  const userA = users[0];
  const userB = users[1];

  console.log(`User A: ${userA.name} (${userA.amerigamPoints} AP)`);
  console.log(`User B: ${userB.name} (${userB.amerigamPoints} AP)`);

  const initialRankA = await getPersonalRank(userA.id, 'INTERNATIONAL');
  const initialRankB = await getPersonalRank(userB.id, 'INTERNATIONAL');

  console.log(`Initial International Rank - User A: ${initialRankA}, User B: ${initialRankB}`);

  // 2. Award User A a lot of AP (make sure they pass User B if B was ahead, or just get more)
  console.log('Awarding 100000 AP to User A directly via DB...');
  
  await prisma.user.update({
    where: { id: userA.id },
    data: { amerigamPoints: { increment: 100000 } }
  });

  // 3. Re-check Rank
  const updatedRankA = await getPersonalRank(userA.id, 'INTERNATIONAL');
  const updatedRankB = await getPersonalRank(userB.id, 'INTERNATIONAL');
  console.log(`Updated International Rank - User A: ${updatedRankA}, User B: ${updatedRankB}`);

  // 4. Revoke the AP
  console.log('Revoking AP from User A...');
  
  await prisma.user.update({
    where: { id: userA.id },
    data: { amerigamPoints: { decrement: 100000 } }
  });

  // 5. Check Rank again (should be back to initial)
  const finalRankA = await getPersonalRank(userA.id, 'INTERNATIONAL');
  console.log(`Final International Rank - User A: ${finalRankA}`);

  console.log('--- TEST COMPLETE ---');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
