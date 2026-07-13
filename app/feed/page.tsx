import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import ShareButton from './ShareButton';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import DeletePostButton from '../components/DeletePostButton';



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
  revalidatePath('/feed');
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
    revalidatePath('/feed');
  }
}

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
    <div>


      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Link href="/feed?tab=foryou" className={`btn ${currentTab === 'foryou' ? '' : 'btn-outline'}`} style={{ flex: 1, textAlign: 'center' }}>
          For You
        </Link>
        <Link href="/feed?tab=all" className={`btn ${currentTab === 'all' ? '' : 'btn-outline'}`} style={{ flex: 1, textAlign: 'center' }}>
          Global
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {posts.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>
            No posts found in this category.
          </p>
        )}
        {posts.map((post) => {
          const hasLiked = post.likes.some(like => like.userId === userId);
          const authorInitial = (post.author.name || post.author.username || '?').charAt(0).toUpperCase();

          return (
            <div key={post.id} className="post-card" style={{ width: '100%', maxWidth: '470px' }}>
              
              {/* Post Header */}
              <div className="post-header">
                <div className="post-header-left">
                  <div className="post-avatar">
                    <div className="post-avatar-inner">{authorInitial}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '0.9rem' }}>
                      <a href={`/user/${post.authorId}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{post.author.username || post.author.name}</a>
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
                <form action={toggleLike} style={{ display: 'inline' }}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button type="submit" className="post-action-btn">
                    <Heart size={24} fill={hasLiked ? "#ff3040" : "none"} color={hasLiked ? "#ff3040" : "var(--text-primary)"} />
                  </button>
                </form>
                <button className="post-action-btn">
                  <MessageCircle size={24} />
                </button>
                <button className="post-action-btn">
                  <Send size={24} />
                </button>
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
                  <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    <strong>{post.author.username || post.author.name}</strong> {post.content}
                  </p>
                )}

                {post.comments.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {post.comments.length > 2 && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', display: 'block', marginBottom: '4px' }}>
                        View all {post.comments.length} comments
                      </span>
                    )}
                    {post.comments.slice(-2).map(comment => (
                      <div key={comment.id} style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                        <strong>{comment.author.username || comment.author.name}</strong> {comment.content}
                      </div>
                    ))}
                  </div>
                )}
                
                <form action={addComment} style={{ marginTop: '12px', display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <input type="hidden" name="postId" value={post.id} />
                  <input type="text" name="content" placeholder="Add a comment..." required style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                  <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--btn-primary-bg)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Post</button>
                </form>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
