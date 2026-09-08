const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reels = await prisma.post.findMany({
    where: { mediaType: 'video', aspectRatio: '9:16' },
    take: 3
  });

  // A Google sample video that definitely has audio
  const audioVideoUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

  for (const reel of reels) {
    await prisma.post.update({
      where: { id: reel.id },
      data: { mediaUrl: audioVideoUrl }
    });
    console.log(`Updated reel ${reel.id} to have audio-enabled mediaUrl`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
