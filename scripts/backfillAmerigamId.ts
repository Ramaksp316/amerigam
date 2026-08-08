import { PrismaClient } from '@prisma/client';
import { generateAmerigamUserId } from '../lib/idGenerator';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Amerigam ID backfill...');
  
  const users = await prisma.user.findMany({
    where: { amerigamId: null }
  });

  console.log(`Found ${users.length} users without an Amerigam ID.`);

  for (const user of users) {
    let assignedId = false;
    while (!assignedId) {
      try {
        const newId = generateAmerigamUserId();
        await prisma.user.update({
          where: { id: user.id },
          data: { amerigamId: newId }
        });
        console.log(`Updated user ${user.email} -> ${newId}`);
        assignedId = true;
      } catch (error: any) {
        // If unique constraint fails, it will retry (very rare collision)
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }
  }

  console.log('Backfill completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
