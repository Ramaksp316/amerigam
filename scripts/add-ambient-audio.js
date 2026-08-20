const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    where: { mediaType: 'video' }
  });
  
  const AMBIENT_SOUNDS = [
    'https://actions.google.com/sounds/v1/office/keyboard_typing.ogg',
    'https://actions.google.com/sounds/v1/crowds/battle_crowd_cheer.ogg',
    'https://actions.google.com/sounds/v1/ambiences/barn_swallows.ogg',
    'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg'
  ];

  for (const post of posts) {
    // Check if it's currently using the backup test video, if so, we can leave it or give it ambient
    const audioUrl = AMBIENT_SOUNDS[Math.floor(Math.random() * AMBIENT_SOUNDS.length)];
    await prisma.post.update({
      where: { id: post.id },
      data: { audioUrl }
    });
    console.log(`Updated video post ${post.id} with ambient audioUrl`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
