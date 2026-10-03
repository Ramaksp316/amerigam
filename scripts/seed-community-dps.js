const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const communityDpMap = {
  'Welcome Gamers': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
  'Racers': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=300&q=80',
  'Athletes': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=300&q=80',
  'Chill Word': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  'Chill World': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  'Creative Arts': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80',
  'Entrepreneurs': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80',
  'Tech & AI': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  'Music & Beats': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
  'Photography Lovers': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
  'Street Photography': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
  'Digital Art': 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80',
  'Illustration Club': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
  'Football Community': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
  'Runners Club': 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=300&q=80',
  'Fitness & Training': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80',
  'Gamers Hub': 'https://images.unsplash.com/photo-1612287232230-00d9b4c0e665?auto=format&fit=crop&w=300&q=80',
  'Indie Gaming': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80',
  'Music Lovers': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
  'Guitar & Instruments': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=300&q=80',
  'Songwriters Circle': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=300&q=80',
  'Writers Circle': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=300&q=80',
  'Storytelling Club': 'https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?auto=format&fit=crop&w=300&q=80',
  'Cinema Lovers': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
  'Short Film Community': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80',
  'Anime Community': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
  'Readers Club': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=300&q=80',
  'Creative Minds': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80',
  'Travel & Exploration': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80',
  'Public Speaking Club': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=300&q=80',
  'Student Innovators': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80',
  'UI Inspiration': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=300&q=80',
  'Design Lovers': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80',
  'Tech Enthusiasts': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
  'Bla bla bla': 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=300&q=80',
  'Parmar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'Amerigam': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  'Nature Explorers': 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=300&q=80',
  'Indie Developers': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=80',
  'Book Enthusiasts': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=300&q=80',
  'Film & Media': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=300&q=80'
};

const defaultCategoryDp = {
  'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
  'Motorsports': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=300&q=80',
  'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=300&q=80',
  'Lifestyle': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  'Art & Design': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80',
  'Art': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
  'Design': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=300&q=80',
  'Business': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80',
  'Business & Startups': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=300&q=80',
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
  'Music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
  'Photography': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
  'Film': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
  'Literature': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=300&q=80',
  'Entertainment': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80',
  'Travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80',
  'Education': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80',
  'Professional': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=300&q=80'
};

async function main() {
  console.log('Seeding Community DPs...');
  const communities = await prisma.community.findMany();

  for (const c of communities) {
    let dp = communityDpMap[c.name];
    if (!dp && c.category && defaultCategoryDp[c.category]) {
      dp = defaultCategoryDp[c.category];
    }
    if (!dp) {
      dp = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80';
    }

    await prisma.community.update({
      where: { id: c.id },
      data: { avatarData: dp }
    });
    console.log(`Updated ${c.name} -> ${dp.slice(0, 50)}...`);
  }

  // Also make sure the 4 suggested communities exist in DB if not already present
  const requiredCommunities = [
    { name: 'Nature Explorers', category: 'Travel', description: 'Outdoor adventures and wildlife photography' },
    { name: 'Indie Developers', category: 'Technology', description: 'Building solo startups and open source tools' },
    { name: 'Book Enthusiasts', category: 'Literature', description: 'Deep book discussions and literary reviews' },
    { name: 'Film & Media', category: 'Film', description: 'Directing, cinematography and filmmaking' }
  ];

  // Get admin or first user as creator
  const firstUser = await prisma.user.findFirst();
  if (firstUser) {
    for (const reqComm of requiredCommunities) {
      const exists = await prisma.community.findFirst({ where: { name: reqComm.name } });
      if (!exists) {
        const dp = communityDpMap[reqComm.name] || 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=300&q=80';
        await prisma.community.create({
          data: {
            name: reqComm.name,
            category: reqComm.category,
            description: reqComm.description,
            avatarData: dp,
            creatorId: firstUser.id
          }
        });
        console.log(`Created missing community: ${reqComm.name}`);
      }
    }
  }

  console.log('Finished updating community DPs successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
