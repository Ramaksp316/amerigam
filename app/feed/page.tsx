import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageCircle, Bookmark, MoreHorizontal, Repeat2, Send, CheckCircle2 } from 'lucide-react';
import ShareButton from './ShareButton';
import LocalTime from '../components/LocalTime';
import DeletePostButton from '../components/DeletePostButton';
import LikeButton from '../components/LikeButton';
import CommentForm from '../components/CommentForm';
import ProfilePicture from '../components/ProfilePicture';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import RightSidebar from '../components/RightSidebar';

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

  let whereClause = {};
  if (currentTab === 'foryou' && currentUser) {
    whereClause = {};
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
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

  return (
    <div className="layout-3-col">
      <div className="layout-center">
        
        {/* Sticky Header with Tabs */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(11, 12, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 50,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0 16px'
        }}>
          <Link href="/feed?tab=foryou" style={{
            flex: 1, textAlign: 'center', padding: '16px 0',
            color: currentTab === 'foryou' ? 'white' : '#A1A1AA',
            fontWeight: currentTab === 'foryou' ? 700 : 500,
            textDecoration: 'none',
            position: 'relative'
          }}>
            For you
            {currentTab === 'foryou' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '4px', background: 'var(--accent-purple)', borderRadius: '4px 4px 0 0' }} />
            )}
          </Link>
          <Link href="/feed?tab=communities" style={{
            flex: 1, textAlign: 'center', padding: '16px 0',
            color: currentTab === 'communities' ? 'white' : '#A1A1AA',
            fontWeight: currentTab === 'communities' ? 700 : 500,
            textDecoration: 'none',
            position: 'relative'
          }}>
            Communities
            {currentTab === 'communities' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '4px', background: 'var(--accent-purple)', borderRadius: '4px 4px 0 0' }} />
            )}
          </Link>
          <Link href="/feed?tab=network" style={{
            flex: 1, textAlign: 'center', padding: '16px 0',
            color: currentTab === 'network' ? 'white' : '#A1A1AA',
            fontWeight: currentTab === 'network' ? 700 : 500,
            textDecoration: 'none',
            position: 'relative'
          }}>
            Network
            {currentTab === 'network' && (
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '56px', height: '4px', background: 'var(--accent-purple)', borderRadius: '4px 4px 0 0' }} />
            )}
          </Link>
        </div>

        {/* Post Composer Placeholder */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
          <ProfilePicture user={currentUser} size={40} />
          <div style={{ flex: 1 }}>
            <input type="text" placeholder="What is happening?!" style={{
              width: '100%', background: 'transparent', border: 'none',
              fontSize: '20px', color: 'white', outline: 'none', padding: '8px 0', marginTop: '4px'
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div style={{ color: 'var(--accent-purple)', display: 'flex', gap: '16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </div>
              <button style={{
                background: 'white', color: 'black', borderRadius: '24px',
                padding: '8px 16px', fontWeight: 600, border: 'none', cursor: 'pointer'
              }}>Post</button>
            </div>
          </div>
        </div>

        <div className="feed-stream">
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#A1A1AA' }}>
              <p style={{ fontSize: '16px' }}>No posts found.</p>
            </div>
          )}

          {posts.map((post) => {
            const hasLiked = post.likes.some(like => like.userId === userId);
            const isVerified = post.author.accountType !== 'PERSONAL' || post.author.followers?.length > 100; // Mock verification
            
            // Build the context string (e.g. "Product Designer • Building in Public" or "Founder at NovaNest AI")
            let identityLine = '';
            if (post.author.outgoingConnections && post.author.outgoingConnections.length > 0) {
              const conn = post.author.outgoingConnections[0];
              identityLine = `${conn.role.replace('_', ' ')} at ${conn.target.name || conn.target.username}`;
            } else {
              identityLine = post.author.accountType.charAt(0) + post.author.accountType.slice(1).toLowerCase();
            }

            return (
              <div key={post.id} className="feed-post" style={{
                padding: '16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                gap: '12px',
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                
                {/* Left Avatar Column */}
                <div style={{ flexShrink: 0 }}>
                  <ProfilePicture user={post.author} size={40} />
                </div>

                {/* Right Content Column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  
                  {/* Author Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Link href={`/user/${post.authorId}`} style={{ color: 'white', fontWeight: 700, textDecoration: 'none', fontSize: '15px' }} className="hover-underline">
                          {post.author.name || post.author.username}
                        </Link>
                        {isVerified && <CheckCircle2 size={14} color="#1D9BF0" fill="#1D9BF0" style={{ color: 'white' }} />}
                        <span style={{ color: '#71717A', fontSize: '15px', marginLeft: '4px' }}>
                          @{post.author.username}
                        </span>
                        <span style={{ color: '#71717A', fontSize: '15px' }}>·</span>
                        <span style={{ color: '#71717A', fontSize: '15px' }}>
                          <LocalTime date={post.createdAt} format="relative" />
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '2px' }}>
                        {identityLine}
                      </div>
                    </div>
                    
                    <button style={{ background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', padding: '4px' }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Post Content */}
                  {post.content && (
                    <div style={{ fontSize: '15px', color: 'white', marginTop: '8px', lineHeight: '1.4', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {post.content}
                    </div>
                  )}

                  {/* Media */}
                  {post.mediaUrl && (
                    <div style={{ 
                      marginTop: '12px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      maxHeight: '500px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.02)'
                    }}>
                      {post.mediaType === 'image' ? (
                        <img 
                          src={post.mediaUrl} 
                          alt="Post media" 
                          loading="lazy" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
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

                  {/* Minimal Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#71717A', maxWidth: '425px' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <MessageCircle size={18} /> {post.comments.length > 0 ? post.comments.length : ''}
                    </button>
                    
                    <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <Repeat2 size={18} /> {Math.floor(Math.random() * 50)}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasLiked ? '#F91880' : 'inherit' }}>
                      <LikeButton postId={post.id} initialHasLiked={hasLiked} initialLikesCount={post.likes.length} />
                    </div>

                    <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <Send size={18} />
                    </button>

                    <button style={{ background: 'transparent', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <Bookmark size={18} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="layout-right">
        <RightSidebar userId={currentUser.id} />
      </div>
    </div>
  );
}
