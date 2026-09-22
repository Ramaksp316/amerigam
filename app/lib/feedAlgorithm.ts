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
      likes: { select: { postId: true } },
      communityMembers: { select: { communityId: true } }
    }
  });

  if (!user) return [];

  const followingIds = new Set(user.following.map(f => f.followingId));
  const userCommunityIds = new Set(user.communityMembers.map(c => c.communityId));
  const likedPostIds = new Set(user.likes.map(l => l.postId));

  let interestKeywords: string[] = [];
  let hobbyKeywords: string[] = [];

  const safeParse = (str: string | null | undefined) => {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [str];
    }
  };

  if (user.personalProfile) {
    interestKeywords.push(...safeParse(user.personalProfile.interests));
    interestKeywords.push(...safeParse(user.personalProfile.skills));
    hobbyKeywords.push(...safeParse(user.personalProfile.hobbies));
  }
  if (user.businessProfile) {
    interestKeywords.push(user.businessProfile.industry || '', user.businessProfile.stage || '', user.businessProfile.mainFocus || '');
  }
  if (user.creatorProfile) {
    interestKeywords.push(user.creatorProfile.niche || '', user.creatorProfile.creatorType || '');
  }
  if (user.influencerProfile) {
    interestKeywords.push(user.influencerProfile.mainNiche || '', user.influencerProfile.influencerType || '');
  }
  if (user.orgProfile) {
    interestKeywords.push(user.orgProfile.orgType || '');
  }

  interestKeywords = interestKeywords.filter(Boolean).map(k => String(k).toLowerCase());
  hobbyKeywords = hobbyKeywords.filter(Boolean).map(k => String(k).toLowerCase());

  // Get raw candidate pool: recent posts, excluding 9:16 reels.
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
        include: { 
          outgoingConnections: { include: { target: true } },
          personalProfile: true,
          communityMembers: { select: { communityId: true } },
          followers: { select: { id: true } }
        }
      },
      likes: true,
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

  const checkMatch = (post: any, keywords: string[]) => {
    if (keywords.length === 0) return { tagCatMatch: false, contentMatch: false };
    
    // Tag match: exact string comparison
    const tagMatch = post.tags.map((t: string) => t.toLowerCase()).some((t: string) => keywords.includes(t));
    
    // Category match: word boundary
    const catMatch = keywords.some(kw => {
      // Escape keyword for regex to avoid syntax errors
      const safeKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${safeKw}\\b`, 'i').test(post.category || '');
    });
    
    const tagCatMatch = tagMatch || catMatch;

    // Content match: split by non-word characters and check overlap
    const contentWords = (post.content || '').toLowerCase().split(/\\W+/);
    const contentMatch = keywords.some(kw => contentWords.includes(kw));

    return { tagCatMatch, contentMatch };
  };

  const interestPool: any[] = [];
  const hobbyPool: any[] = [];
  const fallbackPool: any[] = [];

  for (const post of rawPosts) {
    const interestMatch = checkMatch(post, interestKeywords);
    const hobbyMatch = checkMatch(post, hobbyKeywords);

    let relevanceScore = 0;
    let isInterest = false;
    let isHobby = false;

    if (interestMatch.tagCatMatch || interestMatch.contentMatch) {
      isInterest = true;
      if (interestMatch.tagCatMatch) relevanceScore += 30;
      if (interestMatch.contentMatch) relevanceScore += 10;
    } else if (hobbyMatch.tagCatMatch || hobbyMatch.contentMatch) {
      isHobby = true;
      if (hobbyMatch.tagCatMatch) relevanceScore += 30;
      if (hobbyMatch.contentMatch) relevanceScore += 10;
    } else {
      relevanceScore += 10; // Base discovery
    }

    const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    let freshnessScore = 0;
    if (ageInHours < 6) freshnessScore = 20;
    else if (ageInHours < 24) freshnessScore = 15;
    else if (ageInHours < 72) freshnessScore = 10;
    else if (ageInHours < 168) freshnessScore = 5;
    else freshnessScore = 2;

    const engagementScore = Math.min(15, Math.log10((post._count.likes || 0) + (post._count.comments * 2 || 0) + 1) * 5);

    let relationshipScore = 0;
    if (followingIds.has(post.authorId)) relationshipScore += 15;
    
    const authorCommunityIds = post.author.communityMembers.map((c: any) => c.communityId);
    const sameCommunity = authorCommunityIds.some((id: string) => userCommunityIds.has(id));
    if (sameCommunity) relationshipScore += 5;

    let qualityScore = 0;
    if (post.mediaUrl) qualityScore += 3;
    if (post.tags && post.tags.length > 0) qualityScore += 2;

    const diversityScore = Math.random() * 5;

    let score = relevanceScore + freshnessScore + engagementScore + relationshipScore + qualityScore + diversityScore;

    if (likedPostIds.has(post.id)) {
      score -= 10;
    }

    const postWithScore = { ...post, _algoScore: score };

    if (isInterest) {
      interestPool.push(postWithScore);
    } else if (isHobby) {
      hobbyPool.push(postWithScore);
    } else {
      fallbackPool.push(postWithScore);
    }
  }

  interestPool.sort((a, b) => b._algoScore - a._algoScore);
  hobbyPool.sort((a, b) => b._algoScore - a._algoScore);
  fallbackPool.sort((a, b) => b._algoScore - a._algoScore);

  const targetTotal = 20;
  const targetInterest = 12; // 60%
  const targetHobby = 4; // 20%

  const finalFeed: any[] = [];
  const seenAuthors = new Map<string, number>();

  const addPost = (pool: any[]) => {
    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      const lastSeenIdx = seenAuthors.get(candidate.authorId);
      
      // Same author can't appear within last 4 posts
      if (lastSeenIdx !== undefined && finalFeed.length - lastSeenIdx <= 4) {
        continue;
      }

      seenAuthors.set(candidate.authorId, finalFeed.length);
      finalFeed.push(candidate);
      pool.splice(i, 1);
      return true;
    }
    
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

  for (let i = 0; i < targetTotal; i++) {
    if (interestsAdded < targetInterest) {
      if (addPost(interestPool)) interestsAdded++;
      else if (addPost(hobbyPool)) hobbiesAdded++;
      else addPost(fallbackPool);
    } else if (hobbiesAdded < targetHobby) {
      if (addPost(hobbyPool)) hobbiesAdded++;
      else if (addPost(interestPool)) interestsAdded++;
      else addPost(fallbackPool);
    } else {
      if (!addPost(fallbackPool)) {
        if (!addPost(interestPool)) addPost(hobbyPool);
      }
    }
  }

  return finalFeed;
}
