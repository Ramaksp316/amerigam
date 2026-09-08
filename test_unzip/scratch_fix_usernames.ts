import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUsernames() {
  const users = await prisma.user.findMany({
    where: {
      username: {
        startsWith: '@'
      }
    }
  });

  console.log(`Found ${users.length} users with '@' in username. Fixing...`);

  for (const user of users) {
    if (user.username) {
      const fixedUsername = user.username.replace(/^@+/, '');
      await prisma.user.update({
        where: { id: user.id },
        data: { username: fixedUsername }
      });
      console.log(`Updated ${user.username} -> ${fixedUsername}`);
    }
  }

  console.log('Done!');
}

fixUsernames()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
