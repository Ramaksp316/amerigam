const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: { 
      mediaType: 'video', 
      NOT: { aspectRatio: '9:16' }
    },
    take: 2
  });

  const audioVideoUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

  for (const post of posts) {
    await prisma.post.update({
      where: { id: post.id },
      data: { mediaUrl: audioVideoUrl }
    });
    console.log(`Updated normal video post ${post.id} to have audio-enabled mediaUrl`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
