const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        accountType: true,
        amerigamId: true,
        createdAt: true,
        onboarded: true,
        country: true,
        state: true,
        city: true,
        amerigamPoints: true,
        personalProfile: {
          select: {
            mainIdentity: true,
            skills: true
          }
        }
      }
    });

    console.log('--- LATEST USERS ---');
    console.log(JSON.stringify(users, null, 2));

    const totalUsers = await prisma.user.count();
    console.log(`\nTotal users in database: ${totalUsers}`);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
