import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script for Aarav...');

  // 1. Copy images
  const sourceImages = {
    post1: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786786271495.jpg',
    post3: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786786292340.jpg',
    post4: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786786308285.jpg',
  };

  const destDir = path.join(__dirname, 'public', 'seed', 'posts');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const copyImage = (sourcePath: string, filename: string) => {
    const destPath = path.join(destDir, filename);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      return `/seed/posts/${filename}`;
    }
    return null;
  };

  const post1Img = copyImage(sourceImages.post1, 'aarav_post1.jpg');
  const post3Img = copyImage(sourceImages.post3, 'aarav_post3.jpg');
  const post4Img = copyImage(sourceImages.post4, 'aarav_post4.jpg');

  console.log('Images copied:', { post1Img, post3Img, post4Img });

  // 2. Find Aarav
  const aarav = await prisma.user.findFirst({
    where: { username: 'aaravbuilds' }
  });

  if (!aarav) {
    throw new Error('Aarav Mehta (@aaravbuilds) not found in the database!');
  }

  console.log('Found Aarav:', aarav.id);

  // 3. Prepare dates
  const now = new Date();
  const getOffsetDate = (days: number, hours = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hours);
    return d;
  };

  const postsData = [
    {
      content: "Spent today trying to understand the problem before jumping into the solution.\n\nThe more I research, the more I realise that a good idea is only the starting point. What matters is whether someone actually needs it.\n\nNext step: talk to real users.\n\n#Startup #MarketResearch #BuildingInPublic",
      mediaUrl: post1Img,
      mediaType: post1Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(12),
      targetLikes: 47,
    },
    {
      content: "Talked to 6 potential users today.\n\nI went in expecting validation. Instead, two of my assumptions were completely wrong.\n\nProbably the most useful thing I learned today: don't ask people if they like your idea. Ask how they currently solve the problem.",
      mediaUrl: null,
      mediaType: null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(8),
      targetLikes: 54,
    },
    {
      content: "Current challenge: turning research into something people can actually test.\n\nI'm trying to keep the first version small:\n\nOne problem.\nOne clear use case.\nOne reason to come back.\n\nNo point building 20 features before proving the first one works.",
      mediaUrl: post3Img,
      mediaType: post3Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(5),
      targetLikes: 91,
    },
    {
      content: "Went to a startup meetup today with one goal: meet people who are building, not just talking about building.\n\nCame back with new perspectives, two useful connections and a page full of notes.\n\nSometimes the right conversation saves weeks of guessing.",
      mediaUrl: post4Img,
      mediaType: post4Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(2),
      targetLikes: 126,
    },
    {
      content: "This week's progress:\n\n8 user conversations\n2 assumptions proved wrong\n1 problem narrowed down\n3 new people met\n0 excuses to keep overthinking 😅\n\nNext week: prototype.",
      mediaUrl: null,
      mediaType: null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(0, 2), // 2 hours ago
      targetLikes: 38,
    }
  ];

  // Ensure enough dummy users exist for max likes (126)
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  const maxLikes = Math.max(...postsData.map(p => p.targetLikes));
  
  if (allUsers.length < maxLikes + 10) {
    const needed = maxLikes - allUsers.length + 10;
    console.log(`Need ${needed} more dummy users for likes... creating them.`);
    const dummyUsers = Array.from({ length: needed }).map((_, i) => ({
      email: `dummy_liker_${Date.now()}_${i}@example.com`,
      password: 'password123',
      name: `Demo User ${i}`,
      username: `demouser_${Date.now()}_${i}`,
      onboarded: false,
    }));
    await prisma.user.createMany({ data: dummyUsers });
    console.log(`Created ${needed} dummy users.`);
  }

  // Refresh user list
  const likers = await prisma.user.findMany({ 
    where: { id: { not: aarav.id } },
    select: { id: true } 
  });

  // Create Posts and Likes
  for (const pData of postsData) {
    const { targetLikes, ...postPayload } = pData;
    
    const post = await prisma.post.create({
      data: {
        ...postPayload,
        authorId: aarav.id,
      }
    });

    console.log(`Created post: ${post.id.slice(0,8)}... (${targetLikes} likes needed)`);

    // Add likes randomly
    const shuffledLikers = [...likers].sort(() => 0.5 - Math.random());
    const selectedLikers = shuffledLikers.slice(0, targetLikes);

    const likeRecords = selectedLikers.map(liker => ({
      postId: post.id,
      userId: liker.id,
      createdAt: new Date(post.createdAt.getTime() + Math.random() * (Date.now() - post.createdAt.getTime()))
    }));

    await prisma.like.createMany({ data: likeRecords });
    console.log(`  Added ${likeRecords.length} likes to post ${post.id.slice(0,8)}...`);
  }

  console.log('Successfully seeded 5 posts for Aarav Mehta!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
