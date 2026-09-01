const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categoryImages = {
  'Sports': [
    'https://images.unsplash.com/photo-1461896836934-ffe145bf8c9c?w=800&q=80',
    'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Film & Media': [
    'https://images.pexels.com/photos/2510428/pexels-photo-2510428.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80'
  ],
  'Public Speaking': [
    'https://images.pexels.com/photos/1708912/pexels-photo-1708912.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80'
  ],
  'Gaming': [
    'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80'
  ],
  'Photography': [
    'https://images.pexels.com/photos/212372/pexels-photo-212372.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'
  ],
  'Technology': [
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
  ],
  'Music': [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Art & Design': [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  'Academic': [
    'https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'
  ]
};

async function main() {
  const events = await prisma.event.findMany({ select: { id: true, category: true } });
  let count = 0;
  for (const event of events) {
    const images = categoryImages[event.category] || categoryImages['Technology'];
    // pick one pseudo-randomly
    const image = images[Math.floor(Math.random() * images.length)];
    
    // Test the image URL before saving
    try {
      const r = await fetch(image);
      if (r.status === 200) {
        await prisma.event.update({
          where: { id: event.id },
          data: { coverImage: image }
        });
        count++;
      } else {
        console.error('Failed to load image for', event.id, image, r.status);
      }
    } catch(e) {
      console.error('Error fetching image', image, e);
    }
  }
  console.log('Updated', count, 'events with new valid images.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
