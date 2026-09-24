import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import LocalTime from '../components/LocalTime';
import ProfilePicture from '../components/ProfilePicture';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import PostActionButtons from '../components/PostActionButtons';
import DesktopHeader from '../components/DesktopHeader';
import MobileHomeHeader from '../components/MobileHomeHeader';
import DesktopLeftNav from '../components/DesktopLeftNav';
import DesktopRightSidebar from '../components/DesktopRightSidebar';
import DesktopFeedTop from '../components/DesktopFeedTop';
import FollowButton from '../components/FollowButton';
import PostDropdownMenu from '../components/PostDropdownMenu';
import PostMediaCarousel from '../components/PostMediaCarousel';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
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
    orderBy: { joinedAt: 'desc' }
  });
  const joinedCommunities = userCommunityMemberships.map(m => m.community);

  // 3. Followed Users Set (for Affinity, Follow buttons, and Stories)
  const followingList = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingUserIds = followingList.map(f => f.followingId);
  const followingSet = new Set(followingUserIds);

  // 4. Query Real Active Friends (followed users active in last 3 min, matching dev board)
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  let activeFriends: any[] = [];
  if (followingUserIds.length > 0) {
    activeFriends = await prisma.user.findMany({
      where: {
        id: { in: followingUserIds },
        lastSeen: { gte: threeMinutesAgo }
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
          authorId: { not: userId }
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
          bookmarks: true,
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
        authorId: { not: userId },
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
        bookmarks: true,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' }, take: 3 }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
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

    // Interleave to prevent consecutive author spam
    const interleaved: any[] = [];
    const pool = [...sortedPool];
    let lastAuthorId: string | null = null;

    while (pool.length > 0 && interleaved.length < 30) {
      let nextIdx = pool.findIndex(p => p.authorId !== lastAuthorId);
      if (nextIdx === -1) {
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
    <div className="home-blueprint-layout">
      {/* 1. DESKTOP TOP HEADER (Fixed 58px across top, logo + search + 4 icons) */}
      <DesktopHeader unreadCount={unreadCount} />

      {/* 2. MOBILE TOP HEADER (Sticky 54px, logo + bell + profile avatar) */}
      <MobileHomeHeader currentUser={currentUser} unreadCount={unreadCount} />

      {/* 3. THREE-COLUMN DESKTOP CONTAINER / RESPONSIVE CENTER ON MOBILE */}
      <div
        className="home-main-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          minHeight: 'calc(100vh - 58px)',
          boxSizing: 'border-box'
        }}
      >
        {/* LEFT COLUMN: Fixed ~245px Desktop Navigation */}
        <DesktopLeftNav unreadCount={unreadCount} />

        {/* CENTER COLUMN: Stories Rail + Feed (Max ~720px) */}
        <main
          className="home-center-column"
          style={{
            flex: 1,
            maxWidth: '720px',
            minWidth: 0,
            padding: '16px 16px 40px 16px',
            boxSizing: 'border-box'
          }}
        >
          {/* Feed Filter Tabs (Pill Buttons) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
              padding: '0 4px',
              overflowX: 'auto'
            }}
          >
            {[
              { label: 'For You', key: 'foryou' },
              { label: 'Communities', key: 'communities' },
              { label: 'Network', key: 'network' }
            ].map((tab) => {
              const isActive = currentTab === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={`/home?tab=${tab.key}`}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : '#A1A1AA',
                    backgroundColor: isActive ? 'rgba(2, 132, 199, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                    border: isActive ? '1px solid #0284C7' : '1px solid rgba(255, 255, 255, 0.08)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Section 6: Stories Rail (First section in center column) */}
          <div style={{ marginBottom: '20px' }}>
            <DesktopFeedTop currentUser={currentUser} stories={activeStories} />
          </div>

          {/* Section 7: Feed Stream */}
          <div className="home-feed-stream" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                  backgroundColor: '#16181C',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#71717A'
                }}
              >
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
                <article
                  key={post.id}
                  className="home-post-card"
                  style={{
                    backgroundColor: '#16181C',
                    borderRadius: '18px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '18px 20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Post Header: Avatar + Identity Context + Follow + 3-Dots */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Link href={`/user/${post.authorId}`} style={{ flexShrink: 0 }}>
                      <ProfilePicture user={post.author} size={42} />
                    </Link>
                    
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minWidth: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Link
                            href={`/user/${post.authorId}`}
                            style={{
                              color: '#FFFFFF',
                              fontWeight: 700,
                              textDecoration: 'none',
                              fontSize: '15px',
                              letterSpacing: '-0.2px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {post.author.name || post.author.username}
                          </Link>
                          {isVerified && <CheckCircle2 size={15} color="#0284C7" fill="#0284C7" />}
                        </div>
                        
                        <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '1px', fontWeight: 500 }}>
                          {identityLine}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#71717A', marginTop: '2px' }}>
                          <span>@{post.author.username}</span>
                          <span style={{ fontSize: '10px' }}>•</span>
                          <LocalTime date={post.createdAt} format="relative" />
                        </div>
                      </div>
                      
                      {/* Header Actions: Follow Button + 3-Dots Dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        {!isFollowing && post.authorId !== userId && (
                          <div className="desktop-only">
                            <FollowButton targetUserId={post.authorId} initialIsFollowing={false} />
                          </div>
                        )}
                        
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

                  {/* Post Text Content */}
                  {post.content && (
                    <div
                      style={{ 
                        fontSize: '15px', 
                        color: '#F4F4F5', 
                        lineHeight: '1.45', 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        marginTop: '12px',
                        fontWeight: 400
                      }}
                    >
                      {post.content}
                    </div>
                  )}

                  {/* Media Content: Video or Image Carousel */}
                  {mediaList.length > 0 && (
                    <div style={{ marginTop: '14px', borderRadius: '14px', overflow: 'hidden' }}>
                      {post.mediaType === 'video' ? (
                        <div style={{ 
                          borderRadius: '14px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
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
                    </div>
                  )}

                  {/* Action Buttons Bar: Like, Comment, Repost, Share, Bookmark */}
                  <PostActionButtons 
                    postId={post.id} 
                    hasLiked={hasLiked} 
                    likesCount={post.likes?.length || 0} 
                    commentsCount={post.comments?.length || 0} 
                    initialIsBookmarked={post.bookmarks?.some((b: any) => b.userId === userId) || false}
                  />
                </article>
              );
            })}
          </div>
        </main>

        {/* RIGHT COLUMN: User Profile Highlights, Communities & Real Active Friends */}
        <DesktopRightSidebar 
          currentUser={currentUser} 
          userRank={userRank} 
          joinedCommunities={joinedCommunities} 
          activeFriends={activeFriends} 
        />
      </div>

      {/* Responsive Style Overrides */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 1024px) {
              .home-center-column {
                max-width: 100% !important;
                padding: 12px 12px 80px 12px !important;
              }
              .home-post-card {
                padding: 14px 14px !important;
                border-radius: 14px !important;
              }
            }
          `
        }}
      />
    </div>
  );
}