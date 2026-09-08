import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const vivaan = await prisma.user.findFirst({
    where: { name: 'Vivaan Gupta' },
    include: {
      personalProfile: true,
      businessProfile: true,
      outgoingConnections: { include: { target: true } },
      achievements: true,
      eventRegistrations: true
    }
  });

  console.log("Vivaan Gupta Record:");
  console.log(JSON.stringify(vivaan, null, 2));

  // Also check if usernames have '@'
  const randomUser = await prisma.user.findFirst();
  console.log("Random username:", randomUser?.username);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
