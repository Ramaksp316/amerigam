import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import Link from 'next/link';
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

  if (currentUser && !currentUser.onboarded) {
    redirect('/onboarding');
  }

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
        background: '#000000',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Icons Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
        }}>
          {/* Amerigam Logo Symbol */}
          <Link href="/feed">
            <svg width="28" height="28" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.4 125.7L67.7 35.1C72.5 26.8 81.3 21.8 90.9 21.8H181.5C186.6 21.8 189.5 27.6 186.4 31.6L129.5 106.1C122.9 114.8 112.5 120 101.5 120H43.9C33.1 120 22.8 126 17.1 135.5L11.5 145C8.4 150.2 11 157 17 157H106.5C111.6 157 114.5 162.8 111.4 166.8L96.2 186.7C91.4 193 83.5 196.7 75.3 196.7H17.5C7.2 196.7 0.9 186.6 5.8 178L15.4 125.7Z" fill="white"/>
            </svg>
          </Link>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/search" style={{ color: 'white' }}>
              <Search size={24} />
            </Link>
            <Link href="/notifications" style={{ color: 'white', position: 'relative' }}>
              <Bell size={24} />
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
            fontWeight: currentTab === 'foryou' ? 700 : 500,
            textDecoration: 'none',
            position: 'relative',
            fontSize: '15px'
          }}>
            For you
            {currentTab === 'foryou' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '3px', background: '#1D9BF0', borderRadius: '3px 3px 0 0' }} />
            )}
          </Link>
          <Link href="/feed?tab=communities" style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            color: currentTab === 'communities' ? 'white' : '#71717A',
            fontWeight: currentTab === 'communities' ? 700 : 500,
            textDecoration: 'none',
            position: 'relative',
            fontSize: '15px'
          }}>
            Communities
            {currentTab === 'communities' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '3px', background: '#1D9BF0', borderRadius: '3px 3px 0 0' }} />
            )}
          </Link>
          <Link href="/feed?tab=network" style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            color: currentTab === 'network' ? 'white' : '#71717A',
            fontWeight: currentTab === 'network' ? 700 : 500,
            textDecoration: 'none',
            position: 'relative',
            fontSize: '15px'
          }}>
            Network
            {currentTab === 'network' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '3px', background: '#1D9BF0', borderRadius: '3px 3px 0 0' }} />
            )}
          </Link>
        </div>
      </div>

      <div className="feed-stream">
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
            identityLine = `${conn.role.replace('_', ' ')} at ${conn.target.name || conn.target.username}`;
          } else {
            // Check specific mock identities for seeds
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
              padding: '16px 20px',
              borderBottom: '1px solid #27272A',
              display: 'flex',
              gap: '12px'
            }}>
              {/* Left Avatar Column */}
              <div style={{ flexShrink: 0 }}>
                <Link href={`/user/${post.authorId}`}>
                  <ProfilePicture user={post.author} size={44} />
                </Link>
              </div>

              {/* Right Content Column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                
                {/* Author Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Link href={`/user/${post.authorId}`} style={{ color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '15px' }}>
                        {post.author.name || post.author.username}
                      </Link>
                      {isVerified && <CheckCircle2 size={15} color="#1D9BF0" fill="#1D9BF0" style={{ color: 'white' }} />}
                    </div>
                    <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '1px' }}>
                      {identityLine}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#71717A', marginTop: '1px' }}>
                      <span>@{post.author.username}</span>
                      <span style={{ fontSize: '10px' }}>•</span>
                      <LocalTime date={post.createdAt} format="relative" />
                    </div>
                  </div>
                  
                  <button style={{ background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', padding: '0 4px' }}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Post Content */}
                {post.content && (
                  <div style={{ fontSize: '15px', color: 'white', marginTop: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {post.content}
                  </div>
                )}

                {/* Media */}
                {post.mediaUrl && (
                  <div style={{ 
                    marginTop: '12px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #27272A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#15161C'
                  }}>
                    {post.mediaType === 'image' ? (
                      <img 
                        src={post.mediaUrl} 
                        alt="Post media" 
                        loading="lazy" 
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          maxHeight: '500px',
                          objectFit: 'cover' 
                        }} 
                      />
                    ) : (
                      <CustomVideoPlayer 
                        src={post.mediaUrl} 
                        style={{ width: '100%' }} 
                      />
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', color: '#71717A' }}>
                  <LikeButton postId={post.id} initialHasLiked={hasLiked} initialLikesCount={post.likes.length} />

                  <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', outline: 'none' }}>
                    <MessageCircle size={18} /> {post.comments.length > 0 ? post.comments.length : '24'}
                  </button>
                  
                  <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', outline: 'none' }}>
                    <Repeat2 size={18} /> {Math.floor(Math.random() * 20) + 5}
                  </button>

                  <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', outline: 'none' }}>
                    <Send size={18} /> {Math.floor(Math.random() * 10) + 1}
                  </button>

                  <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', outline: 'none' }}>
                    <Bookmark size={18} />
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
