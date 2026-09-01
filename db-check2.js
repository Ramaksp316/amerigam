const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const events = await prisma.event.findMany({ include: { creator: true } });
  
  console.log(`Total Events: ${events.length}`);
  
  const orgCounts = {};
  const statusCounts = {};
  let free = 0;
  let paid = 0;
  const levelCounts = {};

  const now = new Date();

  for (const e of events) {
    orgCounts[e.creator.name] = (orgCounts[e.creator.name] || 0) + 1;
    
    // Status Logic
    const regStart = e.registrationStart ? new Date(e.registrationStart) : null;
    const regEnd = e.registrationEnd ? new Date(e.registrationEnd) : null;
    const compStart = new Date(e.startDate);
    const compEnd = new Date(e.endDate);
    const isRegistrationOpen = regStart && regEnd && now >= regStart && now <= regEnd;
    const isCompleted = now > compEnd;
    const isLive = now >= compStart && now <= compEnd;
    
    let status = 'Upcoming';
    if (isCompleted) status = 'Completed';
    else if (isLive) status = 'Live';
    else if (isRegistrationOpen) status = 'Registration Open';
    
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
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
  const openPaidEvents = events.filter(e => {
    const regStart = e.registrationStart ? new Date(e.registrationStart) : null;
    const regEnd = e.registrationEnd ? new Date(e.registrationEnd) : null;
    const isRegistrationOpen = regStart && regEnd && now >= regStart && now <= regEnd;
    return e.entryFee && e.entryFee > 0 && isRegistrationOpen;
  });
  
  console.log('Total Open Paid Events:', openPaidEvents.length);
  
  if (openPaidEvents.length < 2) {
    const closedPaidEvents = events.filter(e => e.entryFee && e.entryFee > 0);
    const needed = 2 - openPaidEvents.length;
    for (let i = 0; i < needed && i < closedPaidEvents.length; i++) {
        const e = closedPaidEvents[i];
        // make it open
        const newStart = new Date();
        newStart.setDate(now.getDate() - 2);
        const newEnd = new Date();
        newEnd.setDate(now.getDate() + 5);
        await prisma.event.update({ where: { id: e.id }, data: { registrationStart: newStart, registrationEnd: newEnd, startDate: newEnd }});
        console.log(`Updated event ${e.id} to be Open Paid`);
    }
  }
  
  // Fix broken images
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
