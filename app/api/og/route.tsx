import { ImageResponse } from 'next/og';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return new Response('Missing postId', { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    const isVideo = post.mediaType === 'video';
    const hasMedia = !!post.mediaUrl;

    const authorName = post.author.username || post.author.name || 'Someone';
    const textPreview = post.content ? (post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content) : '';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#111111',
            color: 'white',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Background Image (if any) */}
          {hasMedia && (
            <img
              src={post.mediaUrl!}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.7,
              }}
            />
          )}

          {/* Semi-transparent Overlay to simulate blur / make text readable */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
            }}
          />

          {/* Content Wrapper */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            {isVideo && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  marginBottom: '20px',
                }}
              >
                {/* Play Button SVG */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}

            <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {authorName}
            </h1>
            {textPreview && (
              <p style={{ fontSize: '28px', opacity: 0.9, textShadow: '0 2px 10px rgba(0,0,0,0.8)', maxWidth: '800px' }}>
                {textPreview}
              </p>
            )}
            <div style={{ marginTop: '30px', fontSize: '20px', opacity: 0.6 }}>
              Amerigam - Connect, Create & Share
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
