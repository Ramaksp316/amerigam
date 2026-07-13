import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowLeft } from 'lucide-react';
import ShareButton from '../../feed/ShareButton';
import DeletePostButton from '../../components/DeletePostButton';
import LikeButton from '../../components/LikeButton';
import CommentForm from '../../components/CommentForm';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true }
  });

  if (!post) return { title: 'Post not found' };

  const title = `${post.author.username || post.author.name} on Amerigam`;
  const description = post.content ? (post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content) : 'Check out this post on Amerigam';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/post/${post.id}`,
      images: post.mediaUrl && post.mediaType === 'image' ? [post.mediaUrl] : [],
      type: 'website',
    },
    twitter: {
      card: post.mediaUrl && post.mediaType === 'image' ? 'summary_large_image' : 'summary',
      title,
      description,
      images: post.mediaUrl && post.mediaType === 'image' ? [post.mediaUrl] : [],
    }
  };
}

export default async function SinglePostPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const postId = resolvedParams.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { 
      author: true,
      likes: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      }
    }
  });

  if (!post) {
    notFound();
  }

  const hasLiked = post.likes.some(like => like.userId === userId);
  const authorInitial = (post.author.name || post.author.username || '?').charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '50px' }}>
      
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href={`/user/${post.authorId}`} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={20} style={{ marginRight: '5px' }} /> Back to Profile
        </Link>
      </div>

      <div className="post-card" style={{ width: '100%' }}>
        
        {/* Post Header */}
        <div className="post-header">
          <div className="post-header-left">
            <div className="post-avatar">
              <div className="post-avatar-inner">{authorInitial}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ fontSize: '0.9rem' }}>
                <Link href={`/user/${post.authorId}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{post.author.username || post.author.name}</Link>
              </strong>
              {(post.relatedMasterPath || post.relatedCorePath) && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {post.relatedMasterPath} {post.relatedCorePath ? `• ${post.relatedCorePath}` : ''}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {post.authorId === userId && (
              <DeletePostButton postId={post.id} />
            )}
            <MoreHorizontal size={20} color="var(--text-primary)" style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Media */}
        {post.mediaUrl && (
          <div className="media-container">
            {post.mediaType === 'image' ? (
              <img src={post.mediaUrl} alt="Post media" />
            ) : (
              <video src={post.mediaUrl} controls />
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="post-actions">
          <LikeButton postId={post.id} initialHasLiked={hasLiked} initialLikesCount={post.likes.length} />
          <button className="post-action-btn">
            <MessageCircle size={24} />
          </button>
          <ShareButton 
            url={`/post/${post.id}`} 
            title={`${post.author.username || post.author.name} on Amerigam`} 
            text={post.content.substring(0, 50)} 
          />
          <div style={{ flex: 1 }}></div>
          <button className="post-action-btn">
            <Bookmark size={24} />
          </button>
        </div>

        {/* Likes & Content */}
        <div className="post-content">
          <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </strong>
          
          {post.content && (
            <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
              <strong>{post.author.username || post.author.name}</strong> {post.content}
            </p>
          )}

          {/* Comments Section */}
          <div style={{ marginTop: '8px' }}>
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <div key={comment.id} style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                  <strong><Link href={`/user/${comment.authorId}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{comment.author.username || comment.author.name}</Link></strong> {comment.content}
                </div>
              ))
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No comments yet. Be the first to comment!</span>
            )}
          </div>
          
          <CommentForm postId={post.id} />
        </div>

      </div>
    </div>
  );
}
