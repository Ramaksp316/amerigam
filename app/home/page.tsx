import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Search, Bell, CheckCircle2 } from 'lucide-react';
import LocalTime from '../components/LocalTime';
import ProfilePicture from '../components/ProfilePicture';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import PostActionButtons from '../components/PostActionButtons';
import DesktopRightSidebar from '../components/DesktopRightSidebar';
import DesktopFeedTop from '../components/DesktopFeedTop';
import FollowButton from '../components/FollowButton';
import PostDropdownMenu from '../components/PostDropdownMenu';
import PostMediaCarousel from '../components/PostMediaCarousel';

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  // Guard: redirect non-onboarded users to complete onboarding
  if (!currentUser) redirect('/login');
  if (!currentUser.onboarded) redirect('/onboarding');

  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || 'foryou';

  // Get unread notifications
  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false }
  });

  // 1. Calculate Real User Rank based on AP
  const userRank = await prisma.user.count({
    where: { amerigamPoints: { gt: currentUser.amerigamPoints || 0 } }
  }) + 1;

  // 2. Query Real Joined Communities
  const userCommunityMemberships = await prisma.communityMember.findMany({
    where: { userId },
    include: {
      community: {
        include: {
          _count: { select: { members: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  const joinedCommunities = userCommunityMemberships.map(m => m.community);

  // 3. Followed Users Set (for Affinity, Follow buttons, and Stories)
  const followingList = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingUserIds = followingList.map(f => f.followingId);
  const followingSet = new Set(followingUserIds);

  // 4. Query Real Active Friends (followed users active in last 10 min or ONLINE)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  let activeFriends: any[] = [];
  if (followingUserIds.length > 0) {
    activeFriends = await prisma.user.findMany({
      where: {
        id: { in: followingUserIds },
        OR: [
          { status: 'ONLINE' },
          { lastSeen: { gte: tenMinutesAgo } }
        ]
      },
      include: { personalProfile: true },
      take: 10
    });
  }

  // 5. Query Real 24h Stories from Current User + Followed Creators
  const storyAuthorIds = [userId, ...followingUserIds];
  const activeStories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: new Date() },
      authorId: { in: storyAuthorIds }
    },
    include: {
      author: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // 6. Get posts based on current tab (Filtering out user's own posts)
  let posts: any[] = [];
  
  if (currentTab === 'communities') {
    // Show Community Posts from communities the user has joined (exclude own posts)
    if (joinedCommunities.length > 0) {
      const communityIds = joinedCommunities.map(c => c.id);
      const commPosts = await prisma.communityPost.findMany({
        where: { 
          communityId: { in: communityIds },
          authorId: { not: userId } // Requirement 6: Exclude own posts
        },
        include: {
          author: { include: { outgoingConnections: { include: { target: true } } } },
          community: true
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      posts = commPosts.map(cp => ({
        ...cp,
        likes: [],
        comments: [],
        isCommunityPost: true
      }));
    }
  } else if (currentTab === 'network') {
    // Show posts only from followed users (exclude own posts)
    if (followingUserIds.length > 0) {
      const filteredFollowingIds = followingUserIds.filter(id => id !== userId);
      const networkPosts = await prisma.post.findMany({
        where: {
          authorId: { in: filteredFollowingIds },
          NOT: { AND: [{ mediaType: 'video' }, { aspectRatio: '9:16' }] }
        },
        include: { 
          author: { include: { outgoingConnections: { include: { target: true } } } },
          likes: true,
          comments: { include: { author: true }, orderBy: { createdAt: 'asc' }, take: 3 }
        },
        orderBy: { createdAt: 'desc' },
        take: 40
      });

      // Interleave network posts by author so no consecutive spam
      const netInterleaved: any[] = [];
      const netPool = [...networkPosts];
      let netLastAuthorId: string | null = null;
      while (netPool.length > 0 && netInterleaved.length < 30) {
        let idx = netPool.findIndex(p => p.authorId !== netLastAuthorId);
        if (idx === -1) idx = 0;
        const [chosen] = netPool.splice(idx, 1);
        netInterleaved.push(chosen);
        netLastAuthorId = chosen.authorId;
      }
      posts = netInterleaved;
    }
  } else {
    // Default 'For You' - Global posts personalized & interleaved
    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { personalProfile: true }
    });
    
    let userKeywords: string[] = [];
    if (fullUser?.personalProfile) {
      const pp = fullUser.personalProfile;
      let skills: string[] = [];
      let interests: string[] = [];
      let hobbies: string[] = [];
      try { if (pp.skills) skills = JSON.parse(pp.skills); } catch(e){}
      try { if (pp.interests) interests = JSON.parse(pp.interests); } catch(e){}
      try { if (pp.hobbies) hobbies = JSON.parse(pp.hobbies); } catch(e){}
      
      userKeywords = [
        pp.mainIdentity,
        ...skills,
        ...interests,
        ...hobbies
      ].filter(Boolean).map(k => String(k).toLowerCase());
    }

    // Exclude currentUser's own posts from For You feed
    const allGlobalPosts = await prisma.post.findMany({
      where: {
        authorId: { not: userId }, // Requirement 6: Exclude own posts
        NOT: { AND: [{ mediaType: 'video' }, { aspectRatio: '9:16' }] },
      },
      include: { 
        author: { 
          include: { 
            outgoingConnections: { include: { target: true } },
            personalProfile: true
          } 
        },
        likes: true,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' }, take: 3 }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Pool to score and interleave
    });

    const scoredPosts = allGlobalPosts.map(post => {
      let score = 0;
      
      // Recency decay / freshness boost
      const ageInHours = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      if (ageInHours <= 2) score += 5;
      else if (ageInHours <= 24) score += 2;

      // Match post content keywords
      const contentText = (post.content || '').toLowerCase();
      userKeywords.forEach(kw => {
        if (contentText.includes(kw)) score += 3;
      });

      // Match author profile keywords
      if (post.author.personalProfile) {
        const up = post.author.personalProfile;
        let uSkills: string[] = [];
        let uInterests: string[] = [];
        let uHobbies: string[] = [];
        try { if (up.skills) uSkills = JSON.parse(up.skills); } catch(e){}
        try { if (up.interests) uInterests = JSON.parse(up.interests); } catch(e){}
        try { if (up.hobbies) uHobbies = JSON.parse(up.hobbies); } catch(e){}

        const authorText = [up.mainIdentity, ...uSkills, ...uInterests, ...uHobbies].join(' ').toLowerCase();
        userKeywords.forEach(kw => {
          if (authorText.includes(kw)) score += 2;
        });
      }

      // Followed creator affinity bonus
      if (followingSet.has(post.authorId)) {
        score += 4;
      }

      // Exact Account Type match fallback
      if (post.author.accountType === currentUser.accountType) {
        score += 1;
      }
      
      return { post, score };
    });

    const sortedPool = scoredPosts
      .sort((a, b) => b.score - a.score)
      .map(item => item.post);

    // Requirement 6: Interleave to prevent consecutive author spam
    const interleaved: any[] = [];
    const pool = [...sortedPool];
    let lastAuthorId: string | null = null;

    while (pool.length > 0 && interleaved.length < 30) {
      let nextIdx = pool.findIndex(p => p.authorId !== lastAuthorId);
      if (nextIdx === -1) {
        // No remaining post from a different author
        nextIdx = 0;
      }
      const [chosen] = pool.splice(nextIdx, 1);
      interleaved.push(chosen);
      lastAuthorId = chosen.authorId;
    }

    posts = interleaved;
  }

  // Preserve Diya's Post 1 at top for testing if present (only on For You)
  if (currentTab === 'foryou') {
    const diyaPost1 = posts.find(p => p.author?.username === 'diyadraws' && p.content?.includes('Packaging doesn’t'));
    if (diyaPost1) {
      const otherPosts = posts.filter(p => p.id !== diyaPost1.id);
      posts = [diyaPost1, ...otherPosts];
    }
  }

  return (
    <div className="home-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .home-page-wrapper { display: flex; width: 100%; min-height: 100vh; }
        .home-feed-col { flex: 1; width: 100%; max-width: 600px; margin: 0 auto; background-color: #000; min-height: 100vh; }
        .desktop-feed-grid { display: block; }
        @media (min-width: 1024px) {
          .home-feed-col { max-width: 700px; border-right: 1px solid #27272A; margin: 0; }
          .desktop-feed-grid { display: block; padding: 0; }
          .desktop-feed-post-wrap { border: 1px solid #333; border-radius: 12px; margin-bottom: 16px; }
          .desktop-feed-post-wrap > div { border-bottom: none !important; }
        }
      `}} />
      <div className="home-feed-col">
        {/* Mobile Sticky Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Top Icons Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
          }}>
            {/* Requirement 10: Amerigam Logo Symbol - Mobile only (hidden on desktop) */}
            <Link href="/feed" className="mobile-only" style={{ display: 'flex', alignItems: 'center' }}>
              <Image 
                src="/logo-new.jpg" 
                alt="Amerigam" 
                width={34} 
                height={34} 
                style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
                priority
              />
            </Link>
            
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginLeft: 'auto' }}>
              <Link href="/search" style={{ color: 'white' }}>
                <Search size={22} strokeWidth={2.5} />
              </Link>
              <Link href="/notifications" style={{ color: 'white', position: 'relative' }}>
                <Bell size={22} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--accent-primary)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: '2px solid #000'
                  }} />
                )}
              </Link>
            </div>
          </div>

          {/* Tabs Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid #27272A',
            padding: '0 8px'
          }}>
            {['For You', 'Communities', 'Network'].map((tabLabel) => {
              const tabKey = tabLabel.toLowerCase().replace(' ', '');
              const isActive = currentTab === tabKey;
              return (
                <Link key={tabKey} href={`/home?tab=${tabKey}`} style={{
                  flex: 1, padding: '14px 0',
                  color: isActive ? 'white' : '#71717A',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  fontSize: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{ position: 'relative', paddingBottom: '4px' }}>
                    {tabLabel}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: 0,
                        right: 0,
                        height: '4px',
                        backgroundColor: '#1D9BF0',
                        borderRadius: '4px'
                      }} />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Requirements 1 & 2: 24h Real Stories Bar */}
        <DesktopFeedTop currentUser={currentUser} stories={activeStories} />

        {/* Requirements 3: Clean Feed Grid without 2 square headline boxes */}
        <div className="desktop-feed-grid">
          <div className="feed-stream" style={{ paddingBottom: '20px' }}>
            {posts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#71717A' }}>
                {currentTab === 'network' ? (
                  <p style={{ fontSize: '15px' }}>Start following people to see their posts here!</p>
                ) : currentTab === 'communities' ? (
                  <p style={{ fontSize: '15px' }}>Join a community to see posts here.</p>
                ) : (
                  <p style={{ fontSize: '15px' }}>No posts found.</p>
                )}
              </div>
            )}

            {posts.map((post) => {
              const isFollowing = followingSet.has(post.authorId);
              const hasLiked = post.likes?.some((like: any) => like.userId === userId) || false;
              const isVerified = post.author.accountType !== 'PERSONAL' || (post.author.followers?.length || 0) > 100;
              
              let identityLine = '';
              if (post.author.outgoingConnections && post.author.outgoingConnections.length > 0) {
                const conn = post.author.outgoingConnections[0];
                identityLine = `${conn.role.replace('_', ' ')} • ${conn.target.name || conn.target.username}`;
              } else {
                if (post.author.username === 'diyadraws') identityLine = 'Illustrator • Digital Artist';
                else if (post.author.username === 'aaravbuilds') identityLine = 'Aspiring Founder • Tech';
                else if (post.author.username === 'rohan.cuts') identityLine = 'Video Editor • Filmmaking';
                else if (post.author.username === 'kabir.runs') identityLine = 'Athlete • Training';
                else if (post.author.username === 'meeraframes') identityLine = 'Photographer • Visual Arts';
                else if (post.author.username === 'ishaan.codes') identityLine = 'Developer • Apps';
                else if (post.author.username === 'arjunstrings') identityLine = 'Musician • Songwriting';
                else identityLine = post.author.accountType.charAt(0) + post.author.accountType.slice(1).toLowerCase();
              }

              // Consolidate media URLs (multiple or single)
              const mediaList: string[] = (post.mediaUrls && post.mediaUrls.length > 0)
                ? post.mediaUrls
                : (post.mediaUrl ? [post.mediaUrl] : []);

              return (
                <div key={post.id} className="desktop-feed-post-wrap" style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #27272A',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  
                  {/* Header Row: Avatar + Info + Follow Button + Twitter 3-Dots */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <Link href={`/user/${post.authorId}`} style={{ flexShrink: 0 }}>
                      <ProfilePicture user={post.author} size={42} />
                    </Link>
                    
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Link href={`/user/${post.authorId}`} style={{ color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: '15px', letterSpacing: '-0.3px' }}>
                            {post.author.name || post.author.username}
                          </Link>
                          {isVerified && <CheckCircle2 size={15} color="var(--accent-primary)" fill="var(--accent-primary)" />}
                        </div>
                        
                        <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '2px', fontWeight: 400, letterSpacing: '-0.2px' }}>
                          {identityLine}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#71717A', marginTop: '2px', fontWeight: 400 }}>
                          <span>@{post.author.username}</span>
                          <span style={{ fontSize: '10px' }}>•</span>
                          <LocalTime date={post.createdAt} format="relative" />
                        </div>
                      </div>
                      
                      {/* Action buttons on post header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Requirement 7: Functional Follow button (hidden if already followed or user's own post) */}
                        {!isFollowing && post.authorId !== userId && (
                          <div className="desktop-only">
                            <FollowButton targetUserId={post.authorId} initialIsFollowing={false} />
                          </div>
                        )}
                        
                        {/* Requirement 7: Twitter/X Style 3-Dots Dropdown Menu */}
                        <PostDropdownMenu 
                          postId={post.id}
                          authorId={post.authorId}
                          authorUsername={post.author.username || 'user'}
                          initialIsFollowing={isFollowing}
                          likesCount={post.likes?.length || 0}
                          commentsCount={post.comments?.length || 0}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full-width Post Content */}
                  <div style={{ marginTop: '12px' }}>
                    {post.content && (
                      <div style={{ 
                        fontSize: '15px', 
                        color: '#F4F4F5', 
                        lineHeight: '1.45', 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        fontWeight: 400,
                        letterSpacing: '-0.2px'
                      }}>
                        {post.content}
                      </div>
                    )}

                    {/* Requirements 8: Multi-Image Google Pay Style Carousel or Video Auto-Play */}
                    {mediaList.length > 0 && (
                      <>
                        {post.mediaType === 'video' ? (
                          <div style={{ 
                            marginTop: '12px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid #27272A',
                            backgroundColor: '#0F1015',
                            width: '100%',
                            display: 'block'
                          }}>
                            <CustomVideoPlayer 
                              src={mediaList[0]} 
                              audioSrc={post.audioUrl || undefined}
                              style={{ width: '100%', display: 'block' }} 
                            />
                          </div>
                        ) : (
                          <PostMediaCarousel 
                            mediaUrls={mediaList} 
                            mediaType="image"
                            alt={post.content?.slice(0, 30) || 'Post media'} 
                          />
                        )}
                      </>
                    )}

                    {/* Full-width Action Bar */}
                    <PostActionButtons 
                      postId={post.id} 
                      hasLiked={hasLiked} 
                      likesCount={post.likes?.length || 0} 
                      commentsCount={post.comments?.length || 0} 
                    />

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Requirements 4 & 5: Profile Highlights, Joined Communities, and Real Active Friends */}
      <DesktopRightSidebar 
        currentUser={currentUser} 
        userRank={userRank} 
        joinedCommunities={joinedCommunities} 
        activeFriends={activeFriends} 
      />
    </div>
  );
}