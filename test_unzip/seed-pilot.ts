import { PrismaClient } from '@prisma/client';
import { fetchPexelsMedia } from '../lib/pexels';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();

// Helper to get random date in the last N days
function getRandomDateInLastNDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days) - 1);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date;
}

// Generate engagement (fake likes and comments from other users)
async function generateEngagement(postId: string, allUserIds: string[]) {
  const numLikes = Math.floor(Math.random() * 130) + 20; // 20 to 150 likes
  const numComments = Math.floor(Math.random() * 15) + 2; // 2 to 16 comments

  // Shuffle and pick random users for likes
  const shuffledUsers = [...allUserIds].sort(() => 0.5 - Math.random());
  const likers = shuffledUsers.slice(0, Math.min(numLikes, shuffledUsers.length));
  
  for (const userId of likers) {
    await prisma.like.create({
      data: { postId, userId }
    });
  }

  // Shuffle for comments
  const commenters = shuffledUsers.slice(0, Math.min(numComments, shuffledUsers.length));
  const commentTexts = ['Amazing work!', 'Love this.', 'Great job 🔥', 'So inspiring!', 'Keep it up!', 'Wow 🚀'];
  
  for (const userId of commenters) {
    await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: commentTexts[Math.floor(Math.random() * commentTexts.length)]
      }
    });
  }
}

async function createPost({
  authorId, content, mediaType, aspectRatio, category, tags, pexelsQuery, orientation, allUserIds
}: any) {
  let mediaUrl = null;

  if (mediaType) {
    let retries = 3;
    while (retries > 0 && !mediaUrl) {
      try {
        mediaUrl = await fetchPexelsMedia(pexelsQuery, mediaType, orientation);
      } catch (err: any) {
        console.warn(`Pexels fetch failed for "${pexelsQuery}": ${err.message}`);
      }
      retries--;
    }
    
    if (!mediaUrl) {
      console.error(`Failed to get media for query: ${pexelsQuery}, skipping post.`);
      return;
    }
  }

  const post = await prisma.post.create({
    data: {
      authorId,
      content,
      mediaUrl,
      mediaType,
      aspectRatio,
      category,
      tags,
      isSeeded: true,
      createdAt: getRandomDateInLastNDays(14)
    }
  });

  await generateEngagement(post.id, allUserIds);
  console.log(`✅ Created ${mediaType || 'text'} post for ${category}: ${post.id}`);
}

async function main() {
  if (!process.env.PEXELS_API_KEY) {
    throw new Error('Please add PEXELS_API_KEY to your .env.local file');
  }

  const ishaan = await prisma.user.findFirst({ where: { username: 'ishaan.codes' } });
  const kabir = await prisma.user.findFirst({ where: { username: 'kabir.runs' } });

  if (!ishaan || !kabir) {
    throw new Error('Could not find seeded accounts for Ishaan or Kabir. Ensure they are seeded first.');
  }

  // IDEMPOTENCY: Delete existing seeded posts for these two users
  console.log('Cleaning up previous seed posts for pilot accounts...');
  await prisma.post.deleteMany({
    where: { authorId: { in: [ishaan.id, kabir.id] }, isSeeded: true }
  });

  // Fetch a list of user IDs for generating engagement
  const users = await prisma.user.findMany({ select: { id: true } });
  const allUserIds = users.map(u => u.id).filter(id => id !== ishaan.id && id !== kabir.id);

  // ==========================================
  // 1. ISHAAN PATEL (Developer)
  // ==========================================
  console.log('Seeding Ishaan Patel...');
  
  // Image Post 1
  await createPost({
    authorId: ishaan.id,
    content: "Finally got my new coding setup organized. The dual monitors are an absolute game changer for debugging frontend while checking backend logs. What's your must-have desk accessory? 👨‍💻",
    mediaType: 'image',
    aspectRatio: 'original',
    category: 'Technology',
    tags: ['programming', 'coding', 'workspace', 'developer'],
    pexelsQuery: 'developer workspace',
    orientation: 'landscape',
    allUserIds
  });

  // Image Post 2
  await createPost({
    authorId: ishaan.id,
    content: "Just finished prototyping the new UI architecture. It took a few iterations, but the component structure is finally feeling solid and reusable.",
    mediaType: 'image',
    aspectRatio: '4:5',
    category: 'Technology',
    tags: ['software-development', 'app-development', 'ui', 'coding'],
    pexelsQuery: 'mobile app development',
    orientation: 'portrait',
    allUserIds
  });

  // Normal Video Post
  await createPost({
    authorId: ishaan.id,
    content: "A quick glimpse into today's deep work session. Currently migrating the old monolithic API into microservices. It's a bit of a headache but totally worth it for the scaling benefits. 🚀",
    mediaType: 'video',
    aspectRatio: '16:9',
    category: 'Technology',
    tags: ['coding', 'programmer', 'backend', 'software-engineer'],
    pexelsQuery: 'programmer coding',
    orientation: 'landscape',
    allUserIds
  });

  // Reel (Vertical Video)
  await createPost({
    authorId: ishaan.id,
    content: "Day in the life of shipping features! The best feeling is finally resolving that bug that kept you up all night. 💻✨",
    mediaType: 'video',
    aspectRatio: '9:16',
    category: 'Technology',
    tags: ['programming', 'developer', 'dayinthelife', 'tech'],
    pexelsQuery: 'coding',
    orientation: 'portrait',
    allUserIds
  });

  // Text Post
  await createPost({
    authorId: ishaan.id,
    content: "Does anyone else get sudden bursts of coding inspiration at 2 AM? I swear I solve complex architecture problems better when the rest of the world is asleep. There's just zero distraction.",
    mediaType: null,
    aspectRatio: null,
    category: 'Technology',
    tags: ['thoughts', 'developer-life', 'programming'],
    pexelsQuery: null,
    orientation: null,
    allUserIds
  });


  // ==========================================
  // 2. KABIR SINGH (Athlete / Runner)
  // ==========================================
  console.log('Seeding Kabir Singh...');

  // Image Post 1
  await createPost({
    authorId: kabir.id,
    content: "Nothing beats the clarity of a 6 AM track session. The air is crisp, the track is empty, and it's just you versus your own PRs. Let's get it today! 🏃‍♂️💨",
    mediaType: 'image',
    aspectRatio: '4:5',
    category: 'Sports',
    tags: ['running', 'athletics', 'morning-run', 'training'],
    pexelsQuery: 'runner training track',
    orientation: 'portrait',
    allUserIds
  });

  // Image Post 2
  await createPost({
    authorId: kabir.id,
    content: "Breaking in the new training shoes for the upcoming season. Footwear makes such a massive difference in endurance recovery. Never underestimate good support.",
    mediaType: 'image',
    aspectRatio: 'original',
    category: 'Sports',
    tags: ['running-shoes', 'fitness', 'endurance', 'athlete'],
    pexelsQuery: 'running shoes training',
    orientation: 'landscape',
    allUserIds
  });

  // Normal Video Post
  await createPost({
    authorId: kabir.id,
    content: "Putting in the sprint work today. Form is everything. Focused heavily on arm drive and staying relaxed through the final 50 meters.",
    mediaType: 'video',
    aspectRatio: '16:9',
    category: 'Sports',
    tags: ['athletics', 'sprint', 'trackandfield', 'workout'],
    pexelsQuery: 'runner training',
    orientation: 'landscape',
    allUserIds
  });

  // Reel (Vertical Video)
  await createPost({
    authorId: kabir.id,
    content: "Pre-race warmup routine. Preparation is 80% of the battle. If you aren't warm, you aren't ready. 🔥",
    mediaType: 'video',
    aspectRatio: '9:16',
    category: 'Sports',
    tags: ['fitness', 'warmup', 'athlete', 'running'],
    pexelsQuery: 'athlete training',
    orientation: 'portrait',
    allUserIds
  });

  // Text Post
  await createPost({
    authorId: kabir.id,
    content: "Discipline isn't about always being motivated. It's about lacing up your shoes on the days you really don't want to. Consistency over intensity. That's the only secret.",
    mediaType: null,
    aspectRatio: null,
    category: 'Sports',
    tags: ['discipline', 'mindset', 'consistency', 'training'],
    pexelsQuery: null,
    orientation: null,
    allUserIds
  });

  console.log('✅ Pilot seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
