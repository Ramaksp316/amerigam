import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const events = await prisma.event.findMany({ select: { id: true, coverImage: true, name: true, eventLevel: true, category: true, entryFee: true, registrationStart: true, registrationEnd: true, startDate: true, status: true, creator: { select: { name: true } } } });
  
  console.log(`Total Events: ${events.length}`);
  
  const orgCounts: any = {};
  const statusCounts: any = {};
  let free = 0;
  let paid = 0;
  const levelCounts: any = {};

  for (const e of events) {
    orgCounts[e.creator.name] = (orgCounts[e.creator.name] || 0) + 1;
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    if (e.entryFee && e.entryFee > 0) paid++; else free++;
    levelCounts[e.eventLevel] = (levelCounts[e.eventLevel] || 0) + 1;
  }

  console.log('Org Counts:', orgCounts);
  console.log('Status Counts:', statusCounts);
  console.log('Free:', free, 'Paid:', paid);
  console.log('Level Counts:', levelCounts);

  // Check URLs
  console.log('\nSample URLs:');
  console.log(events.slice(0, 5).map(e => e.coverImage));

  // Let's make sure we have at least 2 open paid competitions
  const now = new Date();
  
  const openPaidEvents = events.filter(e => e.entryFee && e.entryFee > 0 && e.registrationStart && e.registrationEnd && new Date(e.registrationStart) <= now && new Date(e.registrationEnd) >= now);
  console.log('Total Open Paid Events:', openPaidEvents.length);
  
  // Fix broken images
  // Unsplash source URLs usually need specific sizing or keywords, but random keywords from source.unsplash.com are deprecated.
  // We can update them to reliable images if they use source.unsplash.com.
  let fixedCount = 0;
  for (const e of events) {
    if (e.coverImage && (e.coverImage.includes('source.unsplash.com') || e.coverImage.includes('unsplash.it'))) {
      const fixedUrl = `https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop`; // Generic high quality image
      await prisma.event.update({ where: { id: e.id }, data: { coverImage: fixedUrl } });
      fixedCount++;
    }
  }
  console.log(`Fixed ${fixedCount} broken image URLs.`);

  await prisma.$disconnect();
}
run();
