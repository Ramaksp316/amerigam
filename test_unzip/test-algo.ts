import { PrismaClient } from '@prisma/client';
import { getForYouPosts } from './app/lib/feedAlgorithm';

const prisma = new PrismaClient();

async function testAlgorithm() {
  const usersToTest = [
    { name: 'Ishaan Patel', query: 'ishaan' },
    { name: 'Kabir Singh', query: 'kabir' },
    { name: 'Diya Shah', query: 'diya' }
  ];

  for (const t of usersToTest) {
    const user = await prisma.user.findFirst({
      where: { name: { contains: t.name } }
    });

    if (!user) {
      console.log(`User ${t.name} not found!`);
      continue;
    }

    console.log(`\n\n=== Report for ${t.name} (ID: ${user.id}) ===`);
    const posts = await getForYouPosts(user.id);
    
    let interestCount = 0;
    let hobbyCount = 0;
    let fallbackCount = 0;
    const authorCounts = new Map();

    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      console.log(`\nPost ${i + 1}:`);
      console.log(`  Author: ${p.author.name}`);
      console.log(`  Category: ${p.category}`);
      console.log(`  Tags: ${p.tags.join(', ')}`);
      console.log(`  Match Type: ${p._matchType}`);
      console.log(`  Algo Score: ${p._algoScore.toFixed(2)}`);

      if (p._matchType === 'Interest') interestCount++;
      if (p._matchType === 'Hobby') hobbyCount++;
      if (p._matchType === 'Fallback') fallbackCount++;
      
      authorCounts.set(p.author.name, (authorCounts.get(p.author.name) || 0) + 1);
    }

    console.log(`\nSummary for ${t.name}:`);
    console.log(`  Total Posts: ${posts.length}`);
    console.log(`  Interest %: ${Math.round(interestCount / posts.length * 100)}%`);
    console.log(`  Hobby %: ${Math.round(hobbyCount / posts.length * 100)}%`);
    console.log(`  Fallback Count: ${fallbackCount}`);
    console.log(`  Author Spread:`);
    for (const [author, count] of authorCounts.entries()) {
      console.log(`    ${author}: ${count}`);
    }
  }
}

testAlgorithm().then(() => prisma.$disconnect());
