import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import ShareButton from './ShareButton';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { toggleLike, addComment } from '../actions/postActions';
import LocalTime from '../components/LocalTime';
import DeletePostButton from '../components/DeletePostButton';
import LikeButton from '../components/LikeButton';
import CommentForm from '../components/CommentForm';

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>
                    {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <LocalTime date={post.createdAt} format="date" />
                  </span>
                </div>
                
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
                
                <CommentForm postId={post.id} />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
