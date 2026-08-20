const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: { 
      mediaUrl: {
        contains: 'http://commondatastorage.googleapis.com'
      }
    }
  });

  for (const post of posts) {
    const newUrl = post.mediaUrl.replace('http://commondatastorage.googleapis.com', 'https://storage.googleapis.com');
    await prisma.post.update({
      where: { id: post.id },
      data: { mediaUrl: newUrl }
    });
    console.log(`Updated video post ${post.id} to use HTTPS`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
