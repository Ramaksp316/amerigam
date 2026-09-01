import { prisma } from '@/lib/prisma';

export async function getForYouPosts(userId: string) {
  // Fetch user profile and relations
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      businessProfile: true,
      creatorProfile: true,
      influencerProfile: true,
      orgProfile: true,
      following: true,
      likes: { select: { postId: true } }
    }
  });

  if (!user) return [];

  // Parse interests and hobbies
  let interests: string[] = [];
  let hobbies: string[] = [];

  if (user.personalProfile) {
    try {
      interests = user.personalProfile.interests ? JSON.parse(user.personalProfile.interests) : [];
      hobbies = user.personalProfile.hobbies ? JSON.parse(user.personalProfile.hobbies) : [];
    } catch (e) {
      console.warn("Failed to parse interests/hobbies");
    }
  }

  // Gather followings
  const followingIds = new Set(user.following.map(f => f.followingId));

  // Get raw candidate pool: recent posts, excluding 9:16 reels.
  // We'll fetch 200 posts to give the algorithm enough candidates to score.
  const rawPosts = await prisma.post.findMany({
    where: {
      NOT: {
        AND: [
          { mediaType: 'video' },
          { aspectRatio: '9:16' }
        ]
      }
    },
    include: {
      author: {
        include: { outgoingConnections: { include: { target: true } } }
      },
      likes: { select: { id: true } },
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
        take: 3
      },
      _count: { select: { likes: true, comments: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 250
  });

  // Scoring function
  const scorePost = (post: any, isInterestMatch: boolean, isHobbyMatch: boolean) => {
    let score = 0;
    
    // 1. Relevance (max 50 points)
    // If it's a direct tag or category match to interest/hobby
    let relevance = 0;
    if (isInterestMatch) relevance += 40;
    else if (isHobbyMatch) relevance += 40;
    else relevance += 10; // Base discovery

    score += relevance;

    // 2. Freshness (max 20 points)
    const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    let freshness = 0;
    if (ageInHours < 24) freshness = 20;
    else if (ageInHours < 72) freshness = 15;
    else if (ageInHours < 168) freshness = 10;
    else freshness = 5;

    score += freshness;

    // 3. Engagement (max 15 points)
    // Logarithmic normalization
    const engagementScore = Math.log10((post._count.likes || 0) + (post._count.comments * 2 || 0) + 1) * 5;
    score += Math.min(15, engagementScore);

    // 4. Relationship (max 10 points)
    if (followingIds.has(post.authorId)) {
      score += 10;
    }

    // 5. Diversity / Random jitter (max 5 points)
    score += Math.random() * 5; 

    return score;
  };

  // Helper to check text matches
  const textMatchesList = (text: string, list: string[]) => {
    if (!text || list.length === 0) return false;
    const lowerText = text.toLowerCase();
    return list.some(item => {
      const lowerItem = item.toLowerCase();
      return lowerText.includes(lowerItem) || lowerItem.includes(lowerText);
    });
  };

  const interestPool: any[] = [];
  const hobbyPool: any[] = [];
  const fallbackPool: any[] = [];

  for (const post of rawPosts) {
    // Check match
    const categoryMatch = post.category ? textMatchesList(post.category, interests) : false;
    const tagMatch = post.tags.some((t: string) => textMatchesList(t, interests));
    const isInterestMatch = categoryMatch || tagMatch;

    const hobbyCatMatch = post.category ? textMatchesList(post.category, hobbies) : false;
    const hobbyTagMatch = post.tags.some((t: string) => textMatchesList(t, hobbies));
    const isHobbyMatch = hobbyCatMatch || hobbyTagMatch;

    const postWithScore = { 
      ...post, 
      _algoScore: scorePost(post, isInterestMatch, isHobbyMatch),
      _matchType: isInterestMatch ? 'Interest' : (isHobbyMatch ? 'Hobby' : 'Fallback')
    };

    if (isInterestMatch) {
      interestPool.push(postWithScore);
    } else if (isHobbyMatch) {
      hobbyPool.push(postWithScore);
    } else {
      fallbackPool.push(postWithScore);
    }
  }

  // Sort pools by score
  interestPool.sort((a, b) => b._algoScore - a._algoScore);
  hobbyPool.sort((a, b) => b._algoScore - a._algoScore);
  fallbackPool.sort((a, b) => b._algoScore - a._algoScore);

  // Compose the final 20 posts (80% Interest = 16, 20% Hobby = 4)
  const targetTotal = 20;
  const targetInterest = 16;
  const targetHobby = 4;

  const finalFeed: any[] = [];
  const seenAuthors = new Map<string, number>(); // track recent author positions to penalize
  
  const addPost = (pool: any[]) => {
    // Find the highest scoring post in the pool that doesn't violate diversity constraints too badly
    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      const lastSeenIdx = seenAuthors.get(candidate.authorId);
      
      // If same author appeared in the last 3 posts, we skip them for now (diversity penalty)
      if (lastSeenIdx !== undefined && finalFeed.length - lastSeenIdx <= 3) {
        continue;
      }

      // Found a good candidate
      seenAuthors.set(candidate.authorId, finalFeed.length);
      finalFeed.push(candidate);
      pool.splice(i, 1);
      return true;
    }
    
    // If all candidates violated diversity but we still need posts, just take the top one
    if (pool.length > 0) {
      const candidate = pool.shift();
      seenAuthors.set(candidate.authorId, finalFeed.length);
      finalFeed.push(candidate);
      return true;
    }
    return false;
  };

  let interestsAdded = 0;
  let hobbiesAdded = 0;

  // Pattern sequence to naturally mix (approx 4 interests then 1 hobby, but loosely)
  for (let i = 0; i < targetTotal; i++) {
    // Need hobby?
    if (hobbiesAdded < targetHobby && (i % 5 === 4 || interestsAdded >= targetInterest)) {
      if (!addPost(hobbyPool)) {
        if (!addPost(interestPool)) addPost(fallbackPool);
        else interestsAdded++;
      } else {
        hobbiesAdded++;
      }
    } else {
      // Need interest
      if (!addPost(interestPool)) {
        if (!addPost(hobbyPool)) addPost(fallbackPool);
        else hobbiesAdded++;
      } else {
        interestsAdded++;
      }
    }
  }

  return finalFeed;
}
