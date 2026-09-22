import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { MessageCircle, Bookmark, MoreHorizontal, Repeat2, Send, Search, Bell, CheckCircle2 } from 'lucide-react';
import LocalTime from '../components/LocalTime';
import LikeButton from '../components/LikeButton';
import ProfilePicture from '../components/ProfilePicture';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import ImageLightbox from '../components/ImageLightbox';
import PostActionButtons from '../components/PostActionButtons';
import DesktopRightSidebar from '../components/DesktopRightSidebar';
import DesktopFeedTop from '../components/DesktopFeedTop';

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

  // Get posts based on current tab
  let posts: any[] = [];
  
  if (currentTab === 'communities') {
    // Show Community Posts from communities the user has joined
    const userCommunities = await prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true }
    });
    
    if (userCommunities.length > 0) {
      const communityIds = userCommunities.map(c => c.communityId);
      const commPosts = await prisma.communityPost.findMany({
        where: { communityId: { in: communityIds } },
        include: {
          author: { include: { outgoingConnections: { include: { target: true } } } },
          community: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      // Map community posts to regular post format so the UI doesn't break
      posts = commPosts.map(cp => ({
        ...cp,
        likes: [],
        comments: [],
        isCommunityPost: true
      }));
    }
  } else if (currentTab === 'network') {
    // Show posts only from followed users
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    
    if (following.length > 0) {
      const followingIds = following.map(f => f.followingId);
      posts = await prisma.post.findMany({
        where: {
          authorId: { in: followingIds },
          NOT: { AND: [{ mediaType: 'video' }, { aspectRatio: '9:16' }] }
        },
        include: { 
          author: { include: { outgoingConnections: { include: { target: true } } } },
          likes: true,
          comments: { include: { author: true }, orderBy: { createdAt: 'asc' }, take: 3 }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    }
  } else {
    // Default 'For You' - Global posts personalized
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

    const allGlobalPosts = await prisma.post.findMany({
      where: {
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
      take: 100 // Fetch a pool to score
    });

    const scoredPosts = allGlobalPosts.map(post => {
      let score = 0;
      
      // Match post content
      const contentText = (post.content || '').toLowerCase();
      userKeywords.forEach(kw => {
        if (contentText.includes(kw)) score += 3;
      });

      // Match author profile
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

      // Exact Account Type match fallback
      if (post.author.accountType === currentUser.accountType) {
        score += 1;
      }
      
      return { post, score };
    });

    posts = scoredPosts
      .sort((a, b) => b.score - a.score)
      .map(item => item.post)
      .slice(0, 20);
  }

  // Reorder to force Diya's Post 1 to the top for testing (only on For You)
  if (currentTab === 'foryou') {
    const diyaPost1 = posts.find(p => p.author.username === 'diyadraws' && p.content?.includes('Packaging doesn’t'));
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
          .desktop-feed-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; padding: 0 24px; }
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
          {/* Amerigam Logo Symbol */}
          <Link href="/feed" style={{ display: 'flex', alignItems: 'center' }}>
            <Image 
              src="/logo-new.jpg" 
              alt="Amerigam" 
              width={34} 
              height={34} 
              style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
              priority
            />
          </Link>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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
            )
          })}
        </div>
      </div>

      <DesktopFeedTop />
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
          const hasLiked = post.likes.some(like => like.userId === userId);
          const isVerified = post.author.accountType !== 'PERSONAL' || post.author.followers?.length > 100;
          
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

          return (
            <div key={post.id} className="desktop-feed-post-wrap" style={{
              padding: '12px 16px',
              borderBottom: '1px solid #27272A',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              {/* Header Row: Avatar + Info */}
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
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="desktop-only" style={{ background: '#00588A', color: '#FFF', border: 'none', borderRadius: '24px', padding: '6px 16px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.5px' }}>Follow</button>
                    <button style={{ background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', padding: '0 4px', marginTop: '2px' }}>
                      <MoreHorizontal size={20} />
                    </button>
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

                {/* Full-width Media */}
                {post.mediaUrl && (
                  <>
                    {post.mediaType === 'image' ? (
                      <ImageLightbox src={post.mediaUrl} alt="Post media" />
                    ) : (
                      <div style={{ 
                        marginTop: '12px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #27272A',
                        backgroundColor: '#15161C',
                        width: '100%',
                        display: 'block'
                      }}>
                        <CustomVideoPlayer 
                          src={post.mediaUrl} 
                          audioSrc={post.audioUrl || undefined}
                          style={{ width: '100%', display: 'block' }} 
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Full-width Action Bar */}
                <PostActionButtons 
                  postId={post.id} 
                  hasLiked={hasLiked} 
                  likesCount={post.likes.length} 
                  commentsCount={post.comments.length} 
                />

              </div>
            </div>
          );
        })}
              </div>
        
        {/* Headlines Column (Desktop Only) */}
        <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px' }}>
          <div style={{ aspectRatio: '1/1', backgroundColor: '#1A1A1B', borderRadius: '12px', width: '100%' }}></div>
          <div style={{ aspectRatio: '1/1', backgroundColor: '#1A1A1B', borderRadius: '12px', width: '100%' }}></div>
        </div>
      </div>
      </div>
      
      <DesktopRightSidebar currentUser={currentUser} joinedCommunities={[]} networkUsers={[]} />
    </div>
  );
}