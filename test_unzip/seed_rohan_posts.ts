import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script for Rohan...');

  // 1. Copy images
  const sourceImages = {
    post1: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786788640739.jpg',
    post3: 'C:/Users/Admin/.gemini/antigravity/brain/f23c8efe-e9bd-4ec3-aaf5-9aa0b35abe8e/.user_uploaded/media_1786788646751.jpg',
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

  const post1Img = copyImage(sourceImages.post1, 'rohan_post1.jpg');
  const post3Img = copyImage(sourceImages.post3, 'rohan_post3.jpg');

  console.log('Images copied:', { post1Img, post3Img });

  // 2. Find Rohan
  const rohan = await prisma.user.findFirst({
    where: { username: 'rohan.cuts' }
  });

  if (!rohan) {
    throw new Error('Rohan Verma (@rohan.cuts) not found in the database!');
  }

  console.log('Found Rohan:', rohan.id);

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
      content: "Spent half the day trimming 6 seconds from an edit.\n\nThat’s the weird beauty of editing — small changes can completely change the feeling of a video.",
      mediaUrl: post1Img,
      mediaType: post1Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(12),
      targetLikes: 64,
    },
    {
      content: "Good editing isn’t just about transitions.\n\nIt’s about rhythm, tension, silence, pacing and knowing exactly what the viewer should feel next.",
      mediaUrl: null,
      mediaType: null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(7),
      targetLikes: 41,
    },
    {
      content: "A little color work can change the whole story.\n\nStill practicing how to make footage feel more intentional instead of just “clean”.",
      mediaUrl: post3Img,
      mediaType: post3Img ? 'image' : null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(3),
      targetLikes: 103,
    },
    {
      content: "Editing rule I keep relearning:\n\nJust because a shot looks good doesn’t mean it deserves to stay.\n\nIf it doesn’t help the story, cut it.",
      mediaUrl: null,
      mediaType: null,
      aspectRatio: 'original',
      createdAt: getOffsetDate(0, 5), // 5 hours ago
      targetLikes: 52,
    }
  ];

  // Ensure enough dummy users exist for max likes (103)
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  const maxLikes = Math.max(...postsData.map(p => p.targetLikes));
  
  if (allUsers.length < maxLikes + 10) {
    const needed = maxLikes - allUsers.length + 10;
    console.log(`Need ${needed} more dummy users for likes... creating them.`);
    const dummyUsers = Array.from({ length: needed }).map((_, i) => ({
      email: `dummy_liker_rohan_${Date.now()}_${i}@example.com`,
      password: 'password123',
      name: `Demo User ${i}`,
      username: `demouser_rohan_${Date.now()}_${i}`,
      onboarded: false,
    }));
    await prisma.user.createMany({ data: dummyUsers });
    console.log(`Created ${needed} dummy users.`);
  }

  // Refresh user list
  const likers = await prisma.user.findMany({ 
    where: { id: { not: rohan.id } },
    select: { id: true } 
  });

  // 4. Create Posts and Likes idempotently
  for (const pData of postsData) {
    const { targetLikes, ...postPayload } = pData;
    
    // Check if post already exists (idempotency)
    const existingPost = await prisma.post.findFirst({
      where: {
        authorId: rohan.id,
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
        authorId: rohan.id,
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

  console.log('Successfully seeded 4 posts for Rohan Verma!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
