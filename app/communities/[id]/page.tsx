import { prisma } from '../../../lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createCommunityPost } from './actions';
import LocalTime from '../../components/LocalTime';

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
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Community not found</h2>
        <a href="/communities" className="btn">Back to Communities</a>
      </div>
    );
  }

  const isMember = community.members.some(member => member.userId === userId);

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>
          {community.category}
        </span>
        <h1 className="heading-jakaas" style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>{community.name}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '20px' }}>{community.description}</p>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Created by <strong><a href={`/user/${community.creatorId}`} style={{ textDecoration: 'none' }}>{community.creator.name || community.creator.username}</a></strong> • {community.members.length} Members
        </p>

        {!isMember && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>You need to join this community to see its posts.</p>
            <a href="/communities" className="btn">Go Back</a>
          </div>
        )}
      </div>

      {isMember && (
        <>
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: 'Oswald, sans-serif' }}>POST TO COMMUNITY</h2>
            <form action={createCommunityPost}>
              <input type="hidden" name="communityId" value={community.id} />
              <div>
                <textarea name="content" className="input-field" placeholder={`What's happening in ${community.name}?`} style={{ resize: 'vertical', minHeight: '80px' }}></textarea>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Upload Photo/Video: </label>
                <input type="file" name="media" accept="image/*,video/*" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <button type="submit" className="btn">Post</button>
            </form>
          </div>

          <div className="divider">COMMUNITY POSTS</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {community.posts.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No posts in this community yet.</p>
            )}

            {community.posts.map(post => (
              <div key={post.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <strong style={{ fontSize: '1.1rem' }}>
                    <a href={`/user/${post.authorId}`} style={{ textDecoration: 'none' }}>{post.author.name || post.author.username}</a>
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <LocalTime date={post.createdAt} format="date" />
                  </span>
                </div>

                {post.content && <p style={{ marginBottom: '15px', fontSize: '1.1rem' }}>{post.content}</p>}
                
                {post.mediaUrl && (
                  <div className="media-container" style={{ marginBottom: '15px' }}>
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
