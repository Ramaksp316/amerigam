const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const vids = await prisma.post.findMany({
    where: { mediaType: 'video' },
    take: 5,
    select: { mediaUrl: true }
  });
  console.log(vids);
}
main().then(() => process.exit(0));
