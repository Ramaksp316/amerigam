import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script for Meera...');

  // 1. Copy images
  const sourceImages = {
    post1: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786788869302.jpg',
    post2: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786788930971.jpg', // Product shoot
    post4: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786788901623.jpg', // Street
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

  const post1Img = copyImage(sourceImages.post1, 'meera_post1.jpg');
  const post2Img = copyImage(sourceImages.post2, 'meera_post2.jpg');
  const post4Img = copyImage(sourceImages.post4, 'meera_post4.jpg');

  console.log('Images copied:', { post1Img, post2Img, post4Img });

  // 2. Find Meera
  const meera = await prisma.user.findFirst({
    where: { username: 'meeraframes' }
  });

  if (!meera) {
    throw new Error('Meera Joshi (@meeraframes) not found in the database!');
  }

  console.log('Found Meera:', meera.id);

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
      content: "What I love about street photography is that the frame lasts a second, but the feeling stays much longer.",
      mediaUrl: post1Img,
      mediaType: post1Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(11),
      targetLikes: 94,
    },
    {
      content: "Small product shoot today.\n\nStill practicing how to make ordinary objects feel intentional through light, angles and space.",
      mediaUrl: post2Img,
      mediaType: post2Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(6),
      targetLikes: 78,
    },
    {
      content: "Photography taught me to notice details I would’ve ignored before.\n\nLight on a wall.\nA pause in someone’s expression.\nThe way color changes the mood of a place.",
      mediaUrl: null,
      mediaType: null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(3),
      targetLikes: 43,
    },
    {
      content: "Sometimes I go out without a plan and just let the city decide the pictures for me.\n\nThose are usually my favorite walks.",
      mediaUrl: post4Img,
      mediaType: post4Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(0, 3), // 3 hours ago
      targetLikes: 121,
    }
  ];

  // Ensure enough dummy users exist for max likes (121)
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  const maxLikes = Math.max(...postsData.map(p => p.targetLikes));
  
  if (allUsers.length < maxLikes + 10) {
    const needed = maxLikes - allUsers.length + 10;
    console.log(`Need ${needed} more dummy users for likes... creating them.`);
    const dummyUsers = Array.from({ length: needed }).map((_, i) => ({
      email: `dummy_liker_meera_${Date.now()}_${i}@example.com`,
      password: 'password123',
      name: `Demo User ${i}`,
      username: `demouser_meera_${Date.now()}_${i}`,
      onboarded: false,
    }));
    await prisma.user.createMany({ data: dummyUsers });
    console.log(`Created ${needed} dummy users.`);
  }

  // Refresh user list
  const likers = await prisma.user.findMany({ 
    where: { id: { not: meera.id } },
    select: { id: true } 
  });

  // 4. Create Posts and Likes idempotently
  for (const pData of postsData) {
    const { targetLikes, ...postPayload } = pData;
    
    // Check if post already exists (idempotency)
    const existingPost = await prisma.post.findFirst({
      where: {
        authorId: meera.id,
        content: postPayload.content
      }
    });

    if (existingPost) {
      console.log(`Post already exists, skipping: ${existingPost.id.slice(0,8)}...`);
      continue;
    }

    const post = await prisma.post.create({
      data: {
        ...postPayload,
        authorId: meera.id,
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

  console.log('Successfully seeded 4 posts for Meera Joshi!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
