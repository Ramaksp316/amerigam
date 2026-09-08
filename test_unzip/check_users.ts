import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ishaan = await prisma.user.findFirst({
    where: { name: { contains: 'Ishaan Patel', mode: 'insensitive' } },
  });
  
  const kabir = await prisma.user.findFirst({
    where: { name: { contains: 'Kabir Singh', mode: 'insensitive' } },
  });

  console.log('Ishaan:', ishaan);
  console.log('Kabir:', kabir);
}

main().catch(console.error).finally(() => prisma.$disconnect());
