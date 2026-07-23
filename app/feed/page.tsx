import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import ShareButton from './ShareButton';
import LocalTime from '../components/LocalTime';
import DeletePostButton from '../components/DeletePostButton';
import LikeButton from '../components/LikeButton';
import CommentForm from '../components/CommentForm';
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

  let whereClause = {};
  if (currentTab === 'foryou' && currentUser) {
    whereClause = {
      OR: [
        { relatedMasterPath: currentUser.masterPath || undefined },
        { relatedCorePath: currentUser.corePath || undefined }
      ]
    };
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: { 
      author: true,
      likes: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      {/* Feed Category Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <Link 
          href="/feed?tab=foryou" 
          className={`btn ${currentTab === 'foryou' ? '' : 'btn-outline'}`} 
          style={{ flex: 1, textAlign: 'center', borderRadius: 'var(--radius-full)' }}
        >
          For You
        </Link>
        <Link 
          href="/feed?tab=all" 
          className={`btn ${currentTab === 'all' ? '' : 'btn-outline'}`} 
          style={{ flex: 1, textAlign: 'center', borderRadius: 'var(--radius-full)' }}
        >
          Global
        </Link>
      </div>

      <div className="feed-snap-container">
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)' }}>No posts found in this feed.</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Explore the global tab to discover creators!</p>
          </div>
        )}

        {posts.map((post) => {
          const hasLiked = post.likes.some(like => like.userId === userId);
          const authorInitial = (post.author.name || post.author.username || '?').charAt(0).toUpperCase();

          return (
            <div key={post.id} className="post-card feed-snap-post">
              
              {/* Post Header */}
              <div className="post-header">
                <div className="post-header-left">
                  <ProfilePicture user={post.author} size={38} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: 'var(--text-sm)' }}>
                      <Link href={`/user/${post.authorId}`} style={{ color: 'var(--text-primary)' }}>
                        {post.author.username || post.author.name}
                      </Link>
                    </strong>
                    {(post.relatedMasterPath || post.relatedCorePath) && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {post.relatedMasterPath} {post.relatedCorePath ? `• ${post.relatedCorePath}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {post.authorId === userId && (
                    <DeletePostButton postId={post.id} />
                  )}
                  <button className="post-action-btn">
                    <MoreHorizontal size={20} color="var(--text-secondary)" />
                  </button>
                </div>
              </div>

              {/* Media */}
              {post.mediaUrl && (
                <div className="media-container" style={{ 
                  aspectRatio: post.aspectRatio === 'square' ? '1/1' : post.aspectRatio === 'portrait' ? '4/5' : post.aspectRatio === 'landscape' ? '16/9' : 'auto',
                  maxHeight: post.aspectRatio === 'original' || !post.aspectRatio ? 'none' : '450px',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#000'
                }}>
                  {post.mediaType === 'image' ? (
                    <img 
                      src={post.mediaUrl} 
                      alt="Post media" 
                      loading="lazy" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: post.aspectRatio === 'original' || !post.aspectRatio ? 'contain' : 'cover' 
                      }} 
                    />
                  ) : (
                    <CustomVideoPlayer 
                      src={post.mediaUrl} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        aspectRatio: post.aspectRatio === 'square' ? '1/1' : post.aspectRatio === 'portrait' ? '4/5' : post.aspectRatio === 'landscape' ? '16/9' : 'auto' 
                      }} 
                    />
                  )}
                </div>
              )}

              {/* Action Bar */}
              <div className="post-actions">
                <LikeButton postId={post.id} initialHasLiked={hasLiked} initialLikesCount={post.likes.length} />
                <button className="post-action-btn">
                  <MessageCircle size={24} strokeWidth={1.8} />
                </button>
                <ShareButton 
                  url={`/post/${post.id}`} 
                  title={`${post.author.username || post.author.name} on Amerigam`} 
                  text={post.content.substring(0, 50)} 
                />
                <div style={{ flex: 1 }}></div>
                <button className="post-action-btn">
                  <Bookmark size={24} strokeWidth={1.8} />
                </button>
              </div>

              {/* Likes & Content */}
              <div className="post-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>
                    {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                    <LocalTime date={post.createdAt} format="date" />
                  </span>
                </div>
                
                {post.content && (
                  <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', lineHeight: '1.5' }}>
                    <strong style={{ marginRight: 'var(--space-1)' }}>{post.author.username || post.author.name}</strong> 
                    <span>{post.content}</span>
                  </p>
                )}

                {post.comments.length > 0 && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    {post.comments.length > 2 && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', cursor: 'pointer', display: 'block', marginBottom: 'var(--space-1)' }}>
                        View all {post.comments.length} comments
                      </span>
                    )}
                    {post.comments.slice(-2).map(comment => (
                      <div key={comment.id} style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>
                        <strong style={{ marginRight: 'var(--space-1)' }}>{comment.author.username || comment.author.name}</strong> 
                        <span style={{ color: 'var(--text-secondary)' }}>{comment.content}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <CommentForm postId={post.id} />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
