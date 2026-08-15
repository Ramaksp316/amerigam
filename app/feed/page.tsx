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

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || 'foryou';

  // Get unread notifications
  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false }
  });

  // Get posts
  let posts = await prisma.post.findMany({
    include: { 
      author: {
        include: { outgoingConnections: { include: { target: true } } }
      },
      likes: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Reorder to force Diya's Post 1 to the top for testing
  const diyaPost1 = posts.find(p => p.author.username === 'diyadraws' && p.content?.includes('Packaging doesn’t'));
  if (diyaPost1) {
    const otherPosts = posts.filter(p => p.id !== diyaPost1.id);
    posts = [diyaPost1, ...otherPosts];
  }

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100%' }}>
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
              src="/logo-symbol.png" 
              alt="Amerigam" 
              width={34} 
              height={34} 
              style={{ objectFit: 'contain' }}
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
                  background: '#F91880',
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
          justifyContent: 'space-around',
          borderBottom: '1px solid #27272A',
        }}>
          <Link href="/feed?tab=foryou" style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            color: currentTab === 'foryou' ? 'white' : '#71717A',
            fontWeight: currentTab === 'foryou' ? 700 : 600,
            textDecoration: 'none',
            position: 'relative',
            fontSize: '15px'
          }}>
            For you
            {currentTab === 'foryou' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '4px', background: '#FFFFFF', borderRadius: '4px 4px 0 0' }} />
            )}
          </Link>
          <Link href="/feed?tab=communities" style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            color: currentTab === 'communities' ? 'white' : '#71717A',
            fontWeight: currentTab === 'communities' ? 700 : 600,
            textDecoration: 'none',
            position: 'relative',
            fontSize: '15px'
          }}>
            Communities
            {currentTab === 'communities' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '4px', background: '#FFFFFF', borderRadius: '4px 4px 0 0' }} />
            )}
          </Link>
          <Link href="/feed?tab=network" style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            color: currentTab === 'network' ? 'white' : '#71717A',
            fontWeight: currentTab === 'network' ? 700 : 600,
            textDecoration: 'none',
            position: 'relative',
            fontSize: '15px'
          }}>
            Network
            {currentTab === 'network' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '4px', background: '#FFFFFF', borderRadius: '4px 4px 0 0' }} />
            )}
          </Link>
        </div>
      </div>

      <div className="feed-stream" style={{ paddingBottom: '20px' }}>
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#71717A' }}>
            <p style={{ fontSize: '15px' }}>No posts found.</p>
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
            <div key={post.id} style={{
              padding: '16px',
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
                      {isVerified && <CheckCircle2 size={15} color="#1D9BF0" fill="#1D9BF0" />}
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
                  
                  <button style={{ background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', padding: '0 4px', marginTop: '2px' }}>
                    <MoreHorizontal size={20} />
                  </button>
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
                  <div style={{ 
                    marginTop: '12px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #27272A',
                    backgroundColor: '#15161C',
                    width: '100%',
                    display: 'block'
                  }}>
                    {post.mediaType === 'image' ? (
                      <img 
                        src={post.mediaUrl} 
                        alt="Post media" 
                        loading="lazy" 
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          display: 'block',
                          objectFit: 'contain'
                        }} 
                      />
                    ) : (
                      <CustomVideoPlayer 
                        src={post.mediaUrl} 
                        style={{ width: '100%', display: 'block' }} 
                      />
                    )}
                  </div>
                )}

                {/* Full-width Action Bar */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '16px', 
                  color: '#71717A',
                  paddingRight: '8px'
                }}>
                  <LikeButton postId={post.id} initialHasLiked={hasLiked} initialLikesCount={post.likes.length} />

                  <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', outline: 'none' }} className="action-btn-hover">
                    <MessageCircle size={20} strokeWidth={2} /> {post.comments.length > 0 ? post.comments.length : '24'}
                  </button>
                  
                  <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', outline: 'none' }} className="action-btn-hover">
                    <Repeat2 size={20} strokeWidth={2} /> {Math.floor(Math.random() * 20) + 5}
                  </button>

                  <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', outline: 'none' }} className="action-btn-hover">
                    <Send size={18} strokeWidth={2} /> {Math.floor(Math.random() * 10) + 1}
                  </button>

                  <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', outline: 'none' }} className="action-btn-hover">
                    <Bookmark size={20} strokeWidth={2} />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
