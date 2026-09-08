import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      personalProfile: true,
      businessProfile: true,
      creatorProfile: true,
      influencerProfile: true,
      orgProfile: true
    }
  });
  
  const grouped = users.reduce((acc, user) => {
    acc[user.accountType] = (acc[user.accountType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Total Users:', users.length);
  console.log('Grouped:', grouped);
  
  for (const u of users) {
    let identity = u.personalProfile?.mainIdentity || u.businessProfile?.industry || u.creatorProfile?.creatorType || u.influencerProfile?.influencerType || u.orgProfile?.orgType || 'Unknown';
    console.log(`- ${u.name} (${u.accountType}): ${identity}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
