import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script for Arjun...');

  // 1. Copy images
  const sourceImages = {
    post1: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/uploaded_media_1786789319683.jpg',
    post3: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786789274105.jpg',
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

  const post1Img = copyImage(sourceImages.post1, 'arjun_post1.jpg');
  const post3Img = copyImage(sourceImages.post3, 'arjun_post3.jpg');

  console.log('Images copied:', { post1Img, post3Img });

  // 2. Find Arjun
  const arjun = await prisma.user.findFirst({
    where: { username: 'arjunstrings' }
  });

  if (!arjun) {
    throw new Error('Arjun Nair (@arjunstrings) not found in the database!');
  }

  console.log('Found Arjun:', arjun.id);

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
      content: "Spent the evening with the guitar again.\n\nNo performance, no audience — just trying to make the notes feel more honest than yesterday.",
      mediaUrl: post1Img,
      mediaType: post1Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(13),
      targetLikes: 88,
    },
    {
      content: "Songwriting is strange.\n\nSometimes one line arrives fully formed.\nSometimes one line takes three days and still feels unfinished.",
      mediaUrl: null,
      mediaType: null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(7),
      targetLikes: 53,
    },
    {
      content: "Been collecting lyric ideas from random moments lately.\n\nA lot of songs start as one sentence that refuses to leave you alone.",
      mediaUrl: post3Img,
      mediaType: post3Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(3),
      targetLikes: 116,
    },
    {
      content: "I think the best music says something even when the words don’t explain everything.\n\nThat’s what I want to get better at.",
      mediaUrl: null,
      mediaType: null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(0, 4), // 4 hours ago
      targetLikes: 61,
    }
  ];

  // Ensure enough dummy users exist for max likes (116)
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  const maxLikes = Math.max(...postsData.map(p => p.targetLikes));
  
  if (allUsers.length < maxLikes + 10) {
    const needed = maxLikes - allUsers.length + 10;
    console.log(`Need ${needed} more dummy users for likes... creating them.`);
    const dummyUsers = Array.from({ length: needed }).map((_, i) => ({
      email: `dummy_liker_arjun_${Date.now()}_${i}@example.com`,
      password: 'password123',
      name: `Demo User ${i}`,
      username: `demouser_arjun_${Date.now()}_${i}`,
      onboarded: false,
    }));
    await prisma.user.createMany({ data: dummyUsers });
    console.log(`Created ${needed} dummy users.`);
  }

  // Refresh user list
  const likers = await prisma.user.findMany({ 
    where: { id: { not: arjun.id } },
    select: { id: true } 
  });

  // 4. Create Posts and Likes idempotently
  for (const pData of postsData) {
    const { targetLikes, ...postPayload } = pData;
    
    // Check if post already exists (idempotency)
    const existingPost = await prisma.post.findFirst({
      where: {
        authorId: arjun.id,
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
        authorId: arjun.id,
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

  console.log('Successfully seeded 4 posts for Arjun Nair!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
