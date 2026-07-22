import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCommunityPost } from './actions';
import LocalTime from '../../components/LocalTime';
import Link from 'next/link';
import { Users, LayoutGrid, ArrowLeft } from 'lucide-react';

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const resolvedParams = await params;
  const communityId = resolvedParams.id;

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      creator: true,
      members: {
        include: { user: true }
      },
      posts: {
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!community) {
    return (
      <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
        <h2 className="heading-jakaas">Community not found</h2>
        <Link href="/communities" className="btn btn-outline" style={{ display: 'inline-flex', marginTop: 'var(--space-4)' }}><ArrowLeft size={16} /> Back to Communities</Link>
      </div>
    );
  }

  const isMember = community.members.some(member => member.userId === userId);

  return (
    <div style={{ animation: 'fadeIn var(--duration-slow) var(--ease-smooth)', maxWidth: '720px', margin: '0 auto' }}>
      
      <Link href="/communities" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
        <ArrowLeft size={16} /> All Communities
      </Link>

      <div className="glass-card" style={{ marginBottom: 'var(--space-8)', textAlign: 'center', position: 'relative', overflow: 'hidden', padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '150px', background: 'var(--accent-glow-strong)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.75rem', background: 'var(--surface-2)', color: 'var(--accent-emerald)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid var(--border-color)', display: 'inline-block', marginBottom: 'var(--space-4)' }}>
            {community.category}
          </span>
          <h1 className="heading-jakaas" style={{ margin: '0 0 var(--space-3) 0', fontSize: '3rem' }}>{community.name}</h1>
          <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)', maxWidth: '500px', margin: '0 auto var(--space-6) auto', lineHeight: 1.6 }}>{community.description}</p>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', background: 'var(--surface-2)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)' }}>
            <span>Created by <strong style={{ color: 'var(--text-primary)' }}><Link href={`/user/${community.creatorId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{community.creator.name || community.creator.username}</Link></strong></span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontWeight: 600, color: 'var(--text-primary)' }}><Users size={14} /> {community.members.length} Members</span>
          </div>
        </div>

        {!isMember && (
          <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>You need to join this community to see its posts.</p>
            <Link href="/communities" className="btn btn-outline" style={{ display: 'inline-flex' }}>Go Back</Link>
          </div>
        )}
      </div>

      {isMember && (
        <>
          <div className="glass-card" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)' }}>
            <h2 style={{ marginBottom: 'var(--space-4)', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>POST TO COMMUNITY</h2>
            <form action={createCommunityPost} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <input type="hidden" name="communityId" value={community.id} />
              <div>
                <textarea name="content" className="input-field" placeholder={`What's happening in ${community.name}?`} style={{ resize: 'vertical', minHeight: '100px', fontSize: 'var(--text-md)' }}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: 500 }}>Upload Photo/Video</label>
                <input type="file" name="media" accept="image/*,video/*" className="input-field" style={{ padding: 'var(--space-2)' }} />
              </div>
              <button type="submit" className="btn" style={{ marginTop: 'var(--space-2)' }}>Post</button>
            </form>
          </div>

          <div className="divider" style={{ fontSize: 'var(--text-sm)' }}>COMMUNITY POSTS</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {community.posts.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-10)' }}>
                No posts in this community yet. Be the first to start the conversation!
              </div>
            )}

            {community.posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-header-left">
                    <div className="post-avatar">
                      <div className="post-avatar-inner">
                        {(post.author.name || post.author.username || '?').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                        <Link href={`/user/${post.authorId}`} style={{ textDecoration: 'none', color: 'inherit' }}>{post.author.name || post.author.username}</Link>
                      </strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                        <LocalTime date={post.createdAt} format="full" />
                      </span>
                    </div>
                  </div>
                </div>

                {post.content && (
                  <div className="post-content" style={{ fontSize: 'var(--text-base)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {post.content}
                  </div>
                )}
                
                {post.mediaUrl && (
                  <div className="media-container">
                    {post.mediaType === 'image' ? (
                      <img src={post.mediaUrl} alt="Post media" />
                    ) : (
                      <video src={post.mediaUrl} controls />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
