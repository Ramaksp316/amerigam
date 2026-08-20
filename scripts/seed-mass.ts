import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fetchPexelsMedia } from '../lib/pexels';

dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();

const mediaCache: Record<string, string[]> = {};

async function fetchBulkMedia(query: string, type: 'photo' | 'video', orientation: 'landscape' | 'portrait' | 'square' = 'landscape') {
  const cacheKey = `${query}-${type}-${orientation}`;
  if (mediaCache[cacheKey]) return mediaCache[cacheKey];

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error('PEXELS_API_KEY missing');

  // Modify query for videos to favor ones with audio (vlog, speaking, talking)
  const finalQuery = type === 'video' ? `${query} vlog talking` : query;
  
  const endpoint = type === 'photo'
    ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(finalQuery)}&orientation=${orientation}&per_page=60`
    : `https://api.pexels.com/videos/search?query=${encodeURIComponent(finalQuery)}&orientation=${orientation}&per_page=60`;

  try {
    const res = await fetch(endpoint, { headers: { Authorization: apiKey } });
    if (!res.ok) throw new Error('API limit or error');
    const data = await res.json();

    let urls: string[] = [];
    if (type === 'photo' && data.photos) {
      // Use large strictly to avoid original 404s and heavy sizes
      urls = data.photos.map((p: any) => p.src.large).filter(Boolean);
    } else if (type === 'video' && data.videos) {
      urls = data.videos.map((v: any) => {
        // prefer 720p to 1080p
        const validFiles = v.video_files.filter((f: any) => f.file_type === 'video/mp4' && f.height >= 720 && f.height <= 1080);
        return (validFiles.length > 0 ? validFiles[0].link : v.video_files[0]?.link) || null;
      }).filter(Boolean);
    }

    // Shuffle the array to avoid picking the same ones first
    const shuffled = urls.sort(() => Math.random() - 0.5);
    
    // Inject known MP4s with audio (since Pexels is mostly silent) 
    // to guarantee we have audio test variants in the DB
    if (type === 'video') {
      const AUDIO_TEST_VIDEOS = [
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
      ];
      // Randomly replace some of the Pexels results with known audio videos
      for (let i = 0; i < Math.min(5, shuffled.length); i++) {
        if (Math.random() < 0.3) {
          shuffled[i] = AUDIO_TEST_VIDEOS[Math.floor(Math.random() * AUDIO_TEST_VIDEOS.length)];
        }
      }
    }

    mediaCache[cacheKey] = shuffled;
    console.log(`Fetched ${urls.length} items for ${cacheKey}`);
    return mediaCache[cacheKey];
  } catch (err: any) {
    console.log(`Error fetching bulk media for ${query}: ${err.message}`);
    return [];
  }
}

async function validateUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch (e) {
    return false;
  }
}

function getRandomDateInLastNDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days) - 1);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date;
}

function getUserIdentity(user: any) {
  if (user.personalProfile) return user.personalProfile.mainIdentity || 'Lifestyle';
  if (user.businessProfile) return user.businessProfile.industry || 'Business';
  if (user.creatorProfile) return user.creatorProfile.creatorType || 'Creative';
  if (user.influencerProfile) return user.influencerProfile.influencerType || 'Influencer';
  if (user.orgProfile) return user.orgProfile.orgType || 'Event';
  return 'General';
}

function mapIdentityToQuery(identity: string) {
  const lowered = identity.toLowerCase();
  if (lowered.includes('dev') || lowered.includes('code') || lowered.includes('hackathon')) return 'technology software developer';
  if (lowered.includes('sport') || lowered.includes('athlet') || lowered.includes('fitness')) return 'sports athlete fitness';
  if (lowered.includes('art') || lowered.includes('design') || lowered.includes('ui/ux')) return 'digital art designer studio';
  if (lowered.includes('photo') || lowered.includes('film') || lowered.includes('video')) return 'filmmaker photography behind the scenes';
  if (lowered.includes('music') || lowered.includes('sing')) return 'musician singing studio performance';
  if (lowered.includes('game') || lowered.includes('esport')) return 'gaming setup streamer';
  if (lowered.includes('food')) return 'food cooking aesthetic';
  if (lowered.includes('fashion')) return 'fashion style model outfit';
  if (lowered.includes('startup') || lowered.includes('business')) return 'startup office meeting team';
  if (lowered.includes('writer')) return 'writing author coffee notebook';
  return 'lifestyle aesthetic daily vlog';
}

function getCategory(identity: string) {
  const lowered = identity.toLowerCase();
  if (lowered.includes('dev') || lowered.includes('software') || lowered.includes('tech') || lowered.includes('startup')) return 'Technology';
  if (lowered.includes('sport') || lowered.includes('fitness')) return 'Sports';
  if (lowered.includes('art') || lowered.includes('design')) return 'Art & Design';
  if (lowered.includes('photo') || lowered.includes('film') || lowered.includes('music')) return 'Media';
  if (lowered.includes('game')) return 'Gaming';
  if (lowered.includes('fashion') || lowered.includes('beauty')) return 'Fashion';
  if (lowered.includes('food')) return 'Food';
  if (lowered.includes('business')) return 'Business';
  return 'Lifestyle';
}

const captions = {
  Technology: [
    "Just finished prototyping the new UI architecture. The component structure is finally feeling solid.",
    "Does anyone else get sudden bursts of inspiration at 2 AM? Zero distractions.",
    "A quick glimpse into today's deep work session. Migrating legacy systems is painful but worth it. 🚀",
    "Day in the life of shipping features! The best feeling is finally resolving that bug.",
    "Testing out the new deployment pipeline today. Automate everything.",
    "Is it just me or does coffee taste better when the code compiles on the first try?",
    "Finally cleaned up the codebase. Removing 1000 lines of dead code is so therapeutic.",
    "Late night debugging sessions. Some issues just require absolute silence to figure out.",
    "Excited to start planning the architecture for our next major feature release.",
    "Sometimes the best solution is to step away from the laptop for an hour and go for a walk."
  ],
  Sports: [
    "Nothing beats the clarity of a 6 AM track session. Let's get it today! 🏃‍♂️💨",
    "Breaking in the new training gear for the upcoming season.",
    "Putting in the sprint work today. Form is everything. Focused heavily on arm drive.",
    "Pre-race warmup routine. Preparation is 80% of the battle. 🔥",
    "Discipline isn't about always being motivated. Consistency over intensity.",
    "Pushed past my limits today. Recovery is going to be crucial tonight.",
    "Rest days are just as important as training days. Listen to your body.",
    "Focused on building explosive power this block. The progress is slow but steady.",
    "Great session with the team today. Iron sharpens iron.",
    "It never gets easier, you just get faster."
  ],
  Business: [
    "Excited to announce our newest product update rolling out today. Feedback has been amazing so far!",
    "Behind the scenes at the office today. The team is pushing hard for Q3 goals. 💼",
    "Scaling operations means rethinking every workflow. Proud of how far we've come this year.",
    "Great strategy session this morning. It’s all about focusing on core value.",
    "Hiring alert! We are expanding the engineering team. Check out the careers page.",
    "Building a company is a marathon, not a sprint. Grateful for the team keeping the pace.",
    "Reflecting on our journey this past year. So many lessons learned the hard way.",
    "Just wrapped up an incredible meeting with potential partners. Big things coming.",
    "Customer feedback is the only compass you need when building a product.",
    "Sometimes you have to pivot to find the right product-market fit."
  ],
  Gaming: [
    "Finally got the new setup dialed in. The framerates are butter smooth. 🎮",
    "Grinding out the ranked ladder tonight. Wish me luck!",
    "Just dropped a new highlight reel from yesterday's tournament. The clutch was real.",
    "Testing some new level design mechanics for the indie game. Starting to take shape.",
    "What's everyone playing this weekend? I need some recommendations.",
    "The new update completely changed the meta. Having to relearn my favorite class.",
    "Late night raid with the squad. We finally cleared it after 3 hours.",
    "Esports is 90% mental. Keeping your composure under pressure is everything.",
    "Just upgraded the streaming setup. The new mic sounds incredible.",
    "Sometimes you just need a cozy single-player game to unwind after a long day."
  ],
  Creative: [
    "Sharing some work-in-progress shots. Trust the process. ✨",
    "Sometimes you have to scrap the whole canvas and start over. It's part of the journey.",
    "New tutorial dropping soon on how I achieved this lighting setup.",
    "Finding inspiration in the little details today.",
    "Just wrapped up a massive project. Can't wait to share the final results next week!",
    "Experimenting with a completely new color palette today. Stepping out of the comfort zone.",
    "The hardest part of any creative project is just starting. Staring at the blank page is intimidating.",
    "Behind the scenes of today's shoot. The lighting was absolutely perfect.",
    "Finally hit a flow state today. Spent 6 hours working and it felt like 10 minutes.",
    "Remember to create for yourself sometimes, not just for the algorithm."
  ],
  Event: [
    "Registration is now officially open! Secure your spot early. 🏆",
    "Throwback to last year's finals. The energy in the room was unmatched.",
    "Meet our incredible panel of judges for this weekend's competition.",
    "Only 48 hours left to submit your entries. Don't miss the deadline!",
    "A huge thank you to everyone who participated. You made this event unforgettable.",
    "The venue is set, the stage is ready. We can't wait to welcome you all tomorrow.",
    "Announcing our keynote speakers for the upcoming summit. This is going to be massive.",
    "Early bird tickets are officially sold out! Regular admission is now available.",
    "We are so impressed by the quality of submissions this year. The judges have a tough job.",
    "Congratulations to our grand prize winners! Your hard work truly paid off."
  ],
  Lifestyle: [
    "Taking a moment to appreciate the little things today. ☕️",
    "Weekend reset mode activated.",
    "Exploring new places and finding new perspectives.",
    "Sometimes the best ideas come when you step away from the screen.",
    "Just wrapped up a busy week. Time to recharge.",
    "Current mood: slow mornings and good coffee.",
    "Finding balance is an ongoing process. Taking it one day at a time.",
    "A little photo dump from the weekend adventures.",
    "Starting a new book today. Any good reading recommendations?",
    "Grateful for the people who make ordinary days feel special."
  ]
};

function getCaption(category: string) {
  let cat = captions[category as keyof typeof captions] ? category : 'Lifestyle';
  const options = captions[cat as keyof typeof captions];
  return options[Math.floor(Math.random() * options.length)];
}

async function generateEngagement(prisma: any, postId: string, allUserIds: string[]) {
  const isViral = Math.random() > 0.85;
  const numLikes = isViral ? Math.floor(Math.random() * 200) + 50 : Math.floor(Math.random() * 30) + 2;
  const numComments = Math.floor(Math.random() * (numLikes / 5));

  const shuffledUsers = [...allUserIds].sort(() => 0.5 - Math.random());
  const likers = shuffledUsers.slice(0, Math.min(numLikes, shuffledUsers.length));
  
  for (const userId of likers) {
    try { await prisma.like.create({ data: { postId, userId } }); } catch (e) {}
  }

  const commenters = shuffledUsers.slice(0, Math.min(numComments, shuffledUsers.length));
  const commentTexts = ['Amazing!', 'Love this.', 'Great job 🔥', 'So inspiring!', 'Wow 🚀', 'Keep going!', 'This is awesome.', 'Unreal!', 'So cool!', 'Thanks for sharing.'];
  
  for (const userId of commenters) {
    try {
      await prisma.comment.create({
        data: {
          postId,
          authorId: userId,
          content: commentTexts[Math.floor(Math.random() * commentTexts.length)]
        }
      });
    } catch(e) {}
  }
}

async function main() {
  console.log('Starting mass content seeding pipeline (Idempotent & Optimized)...');
  
  const users = await prisma.user.findMany({
    include: {
      personalProfile: true,
      businessProfile: true,
      creatorProfile: true,
      influencerProfile: true,
      orgProfile: true
    }
  });

  const allUserIds = users.map(u => u.id);
  
  let totalPosts = 0;
  let totalReels = 0;
  let accountsProcessed = 0;
  let accountsSkipped = 0;
  let replacedMediaCount = 0;

  const seededPosts = await prisma.post.findMany({ where: { isSeeded: true }, select: { id: true } });
  const seededPostIds = seededPosts.map(p => p.id);
  if (seededPostIds.length > 0) {
    await prisma.comment.deleteMany({ where: { postId: { in: seededPostIds } } });
    await prisma.like.deleteMany({ where: { postId: { in: seededPostIds } } });
    await prisma.post.deleteMany({ where: { id: { in: seededPostIds } } });
  }
  console.log('Cleaned up old seeded posts.');

  for (const user of users) {
    let postCount = 0;
    if (user.accountType === 'PERSONAL') postCount = 4;
    else if (user.accountType === 'BUSINESS') postCount = 4;
    else if (user.accountType === 'CREATOR') postCount = 5;
    else if (user.accountType === 'INFLUENCER') postCount = 5;
    else if (user.accountType === 'ORGANIZATION') postCount = 3;
    
    if (postCount === 0) {
      accountsSkipped++;
      continue;
    }

    const identity = getUserIdentity(user);
    const query = mapIdentityToQuery(identity);
    const category = getCategory(identity);
    const tags = query.split(' ').concat([category.toLowerCase()]).filter(Boolean);

    // Make sure we have media for this persona pre-fetched
    await fetchBulkMedia(query, 'photo', 'landscape');
    await fetchBulkMedia(query, 'photo', 'portrait');
    await fetchBulkMedia(query, 'video', 'landscape');
    await fetchBulkMedia(query, 'video', 'portrait');

    for (let i = 0; i < postCount; i++) {
      let mediaType: 'image' | 'video' | null = null;
      let aspectRatio = 'original';
      let isReel = false;
      let orientation: 'landscape' | 'portrait' | 'square' = 'landscape';
      
      // Determine mix
      const roll = Math.random();
      if (i === 0) { mediaType = 'image'; orientation = 'landscape'; aspectRatio = 'original'; }
      else if (i === 1) { mediaType = 'image'; orientation = 'portrait'; aspectRatio = '4:5'; }
      else if (i === 2) { mediaType = 'video'; orientation = 'landscape'; aspectRatio = '16:9'; }
      else if (i === 3) { mediaType = 'video'; orientation = 'portrait'; aspectRatio = '9:16'; isReel = true; }
      else { 
        if (roll > 0.5) { mediaType = null; } 
        else { mediaType = 'image'; orientation = 'square'; aspectRatio = 'original'; }
      }
      
      let mediaUrl = null;
      if (mediaType) {
        const cacheKey = `${query}-${mediaType === 'image' ? 'photo' : 'video'}-${orientation}`;
        const options = mediaCache[cacheKey] || [];
        
        for (let attempt = 0; attempt < 3; attempt++) {
          if (options.length > 0) {
            const candidate = options.shift(); // Pick and remove the first element (which is already shuffled)
            if (candidate) {
              if (mediaType === 'video') {
                const isValid = await validateUrl(candidate);
                if (isValid) {
                  mediaUrl = candidate;
                  break;
                } else {
                  replacedMediaCount++;
                }
              } else {
                // Image from Pexels .large is highly reliable. Skip HEAD to save time.
                mediaUrl = candidate;
                break;
              }
            }
          }
        }
        if (!mediaUrl) continue; // Skip creating broken post
      }

      const post = await prisma.post.create({
        data: {
          authorId: user.id,
          content: getCaption(category),
          mediaUrl,
          mediaType,
          aspectRatio,
          category,
          tags,
          isSeeded: true,
          createdAt: getRandomDateInLastNDays(14)
        }
      });

      await generateEngagement(prisma, post.id, allUserIds);
      
      totalPosts++;
      if (isReel) totalReels++;
    }
    accountsProcessed++;
    console.log(`Processed ${accountsProcessed}/${users.length}: ${user.name} (${user.accountType}) - ${identity}`);
  }

  console.log('\n==================================');
  console.log('MASS SEEDING REPORT');
  console.log('==================================');
  console.log(`Total Accounts Processed: ${accountsProcessed}`);
  console.log(`Accounts Skipped: ${accountsSkipped}`);
  console.log(`Total Posts Created: ${totalPosts}`);
  console.log(`Total Reels Created: ${totalReels}`);
  console.log(`Broken Media URLs Replaced/Skipped: ${replacedMediaCount}`);
  console.log('Categories/Tags used effectively for next feed logic.');
  console.log('==================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
