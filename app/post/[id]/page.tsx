import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowLeft } from 'lucide-react';
import ShareButton from '../../feed/ShareButton';

async function toggleLike(formData: FormData) {
  'use server';
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const postId = formData.get('postId') as string;

  const existingLike = await prisma.like.findFirst({
    where: { userId, postId },
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }
  revalidatePath(`/post/${postId}`);
}

async function addComment(formData: FormData) {
  'use server';
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  if (!userId) return;

  const postId = formData.get('postId') as string;
  const content = formData.get('content') as string;

  if (content && content.trim().length > 0) {
    await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
      },
    });
    revalidatePath(`/post/${postId}`);
  }
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
          <MoreHorizontal size={20} color="var(--text-primary)" style={{ cursor: 'pointer' }} />
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
          <form action={toggleLike} style={{ display: 'inline' }}>
            <input type="hidden" name="postId" value={post.id} />
            <button type="submit" className="post-action-btn">
              <Heart size={24} fill={hasLiked ? "#ff3040" : "none"} color={hasLiked ? "#ff3040" : "var(--text-primary)"} />
            </button>
          </form>
          <button className="post-action-btn">
            <MessageCircle size={24} />
          </button>
          <ShareButton url={post.mediaUrl || ''} />
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
          
          <form action={addComment} style={{ marginTop: '15px', display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <input type="hidden" name="postId" value={post.id} />
            <input type="text" name="content" placeholder="Add a comment..." required style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--btn-primary-bg)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Post</button>
          </form>
        </div>

      </div>
    </div>
  );
}
