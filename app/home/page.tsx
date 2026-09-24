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
import MobileHeader from '../components/MobileHeader';
import DesktopSidebar from '../components/DesktopSidebar';
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
    <div
      className="home-page-container"
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Desktop Full Edge-to-Edge Top Header */}
      <DesktopHeader unreadCount={unreadCount} />

      {/* 2. Mobile Sticky Header */}
      <MobileHeader currentUser={currentUser} unreadCount={unreadCount} />

      {/* 3. 3-Column Layout Container */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          flex: 1,
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Column: Desktop Navigation Sidebar */}
        <DesktopSidebar unreadCount={unreadCount} />

        {/* Center Column: Feed (Stories + Tabs + Posts) */}
        <main
          className="home-feed-main"
          style={{
            flex: 1,
            maxWidth: '920px',
            width: '100%',
            minHeight: '100vh',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}
        >
          {/* Stories Horizontal Carousel */}
          <DesktopFeedTop currentUser={currentUser} stories={activeStories} />

          {/* Contextual Active Friends Section on Mobile (True Mobile Recomposition) */}
          {activeFriends.length > 0 && (
            <div
              className="mobile-only"
              style={{
                padding: '10px 16px 14px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      boxShadow: '0 0 6px #10B981'
                    }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#E4E4E7' }}>
                    Active Friends
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 500 }}>
                  {activeFriends.length} online
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  paddingBottom: '2px'
                }}
              >
                {activeFriends.map((friend) => (
                  <Link
                    key={friend.id}
                    href={`/user/${friend.id}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textDecoration: 'none',
                      flexShrink: 0,
                      minWidth: '44px'
                    }}
                  >
                    <div style={{ position: 'relative', width: '42px', height: '42px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          backgroundColor: '#1E1E22',
                          border: '1.5px solid rgba(255, 255, 255, 0.15)'
                        }}
                      >
                        {friend.avatarData ? (
                          <img
                            src={friend.avatarData}
                            alt={friend.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFF',
                              fontSize: '13px',
                              fontWeight: 700
                            }}
                          >
                            {(friend.name || friend.username || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                          border: '2px solid #000'
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#D4D4D8',
                        marginTop: '4px',
                        maxWidth: '52px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {friend.username}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Clean Segment Tabs Row: For You, Communities, Network */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0 20px',
              gap: '32px'
            }}
          >
            {['For You', 'Communities', 'Network'].map((tabLabel) => {
              const tabKey = tabLabel.toLowerCase().replace(' ', '');
              const isActive = currentTab === tabKey;
              return (
                <Link
                  key={tabKey}
                  href={`/home?tab=${tabKey}`}
                  style={{
                    padding: '14px 0',
                    color: isActive ? '#FFFFFF' : '#71717A',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    fontSize: '14px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '44px',
                    boxSizing: 'border-box'
                  }}
                >
                  <span>{tabLabel}</span>
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        backgroundColor: '#0284C7',
                        borderRadius: '3px 3px 0 0'
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Posts Stream */}
          <div style={{ paddingBottom: '40px' }}>
            {posts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#71717A' }}>
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
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Header Row: Rainbow Avatar + Creator Info + Follow Button + 3-Dots */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Creator Avatar with Rainbow Ring matching Figma Home page */}
                    <Link href={`/user/${post.authorId}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #EC4899, #F59E0B, #10B981, #3B82F6)',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            backgroundColor: '#1E1E22',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {post.author.avatarData ? (
                            <img
                              src={post.author.avatarData}
                              alt={post.author.name || post.author.username}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <ProfilePicture user={post.author} size={38} showStatus={false} />
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Name & Identity */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Link
                          href={`/user/${post.authorId}`}
                          style={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            textDecoration: 'none',
                            fontSize: '15px',
                            letterSpacing: '-0.2px'
                          }}
                        >
                          @{post.author.username}
                        </Link>
                        {isVerified && <CheckCircle2 size={14} color="#0284C7" fill="#0284C7" />}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: '#A1A1AA',
                          marginTop: '1px',
                          fontWeight: 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {identityLine}
                      </div>
                    </div>

                    {/* Right: Blue Follow Pill Button & 3-Dots */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {!isFollowing && post.authorId !== userId && (
                        <FollowButton targetUserId={post.authorId} initialIsFollowing={false} />
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

                  {/* Caption Text */}
                  {post.content && (
                    <div
                      style={{
                        marginTop: '12px',
                        fontSize: '15px',
                        color: '#F4F4F5',
                        lineHeight: '1.45',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontWeight: 400
                      }}
                    >
                      {post.content}
                    </div>
                  )}

                  {/* Media Content (Images Carousel or Video Player) */}
                  {mediaList.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      {post.mediaType === 'video' ? (
                        <div
                          style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            backgroundColor: '#0F1015',
                            width: '100%',
                            display: 'block'
                          }}
                        >
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

                  {/* Action Bar (Like, Comment, Share, Bookmark with min 44px touch targets) */}
                  <div style={{ marginTop: '4px' }}>
                    <PostActionButtons
                      postId={post.id}
                      hasLiked={hasLiked}
                      likesCount={post.likes?.length || 0}
                      commentsCount={post.comments?.length || 0}
                      initialIsBookmarked={post.bookmarks?.some((b: any) => b.userId === userId) || false}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </main>

        {/* Right Column: Desktop Profile Highlights & Active Friends Card */}
        <DesktopRightSidebar
          currentUser={currentUser}
          userRank={userRank}
          joinedCommunities={joinedCommunities}
          activeFriends={activeFriends}
        />
      </div>
    </div>
  );
}