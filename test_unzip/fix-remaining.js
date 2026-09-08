const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fallbackImages = [
  'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800'
];

async function main() {
  const events = await prisma.event.findMany({ select: { id: true, category: true, coverImage: true } });
  let count = 0;
  for (const event of events) {
    // Test if the current image is a 404
    try {
      const r = await fetch(event.coverImage);
      if (r.status !== 200) {
        console.log('Fixing', event.id, 'currently', event.coverImage);
        const image = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        await prisma.event.update({
          where: { id: event.id },
          data: { coverImage: image }
        });
        count++;
      }
    } catch(e) {
      console.error('Error fetching image', event.coverImage, e);
    }
  }
  console.log('Fixed', count, 'events with new valid images.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
