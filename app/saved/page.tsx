import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Heart, MessageCircle, Play, Layers, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';

export const dynamic = 'force-dynamic';

export default async function SavedPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!currentUser) redirect('/login');

  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab === 'liked' ? 'liked' : 'saved';

  let posts: any[] = [];

  if (currentTab === 'saved') {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, username: true, avatarData: true } },
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    posts = bookmarks.map(b => b.post).filter(Boolean);
  } else {
    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, username: true, avatarData: true } },
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    posts = likes.map(l => l.post).filter(Boolean);
  }

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: '#000000', color: '#FFFFFF' }}>
      {/* Desktop Left Sidebar */}
      <Sidebar currentUser={currentUser} />

      {/* Main Content Column */}
      <main style={{
        flex: 1,
        maxWidth: '960px',
        margin: '0 auto',
        padding: '24px 20px 80px 20px',
        boxSizing: 'border-box'
      }}>
        {/* Top Header matching Instagram (media_1790239081823.png) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href="/home"
              style={{
                color: '#A1A1AA',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'color 0.15s ease'
              }}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </Link>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
              {currentTab === 'saved' ? 'Saved Posts' : 'Liked Posts'}
            </h1>
          </div>

          <span style={{ fontSize: '13px', color: '#71717A', fontWeight: 500 }}>
            {posts.length} {posts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Tab Switcher Pills */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px'
        }}>
          <Link
            href="/saved?tab=saved"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: currentTab === 'saved' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
              color: currentTab === 'saved' ? '#000000' : '#A1A1AA',
              transition: 'all 0.15s ease'
            }}
          >
            <Bookmark size={15} fill={currentTab === 'saved' ? '#000000' : 'none'} />
            <span>Saved</span>
          </Link>

          <Link
            href="/saved?tab=liked"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: currentTab === 'liked' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
              color: currentTab === 'liked' ? '#000000' : '#A1A1AA',
              transition: 'all 0.15s ease'
            }}
          >
            <Heart size={15} fill={currentTab === 'liked' ? '#EF4444' : 'none'} color={currentTab === 'liked' ? '#EF4444' : 'currentColor'} />
            <span>Liked</span>
          </Link>
        </div>

        {/* 3-Column Responsive Grid matching Instagram */}
        {posts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '20px',
            border: '1px dashed rgba(255, 255, 255, 0.1)'
          }}>
            {currentTab === 'saved' ? (
              <>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#A1A1AA'
                }}>
                  <Bookmark size={30} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>Save posts and reels</h3>
                <p style={{ fontSize: '13px', color: '#71717A', margin: 0, maxWidth: '340px' }}>
                  Save posts and videos that you want to see again. No one is notified, and only you can see what you&apos;ve saved.
                </p>
              </>
            ) : (
              <>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#EF4444'
                }}>
                  <Heart size={30} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>No liked posts yet</h3>
                <p style={{ fontSize: '13px', color: '#71717A', margin: 0, maxWidth: '340px' }}>
                  When you like posts or reels, they will appear here in your activity log.
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            {posts.map((post) => {
              const isVideo = post.mediaType === 'video';
              const isMultiImage = post.mediaUrls && post.mediaUrls.length > 1;
              const primaryMedia = (post.mediaUrls && post.mediaUrls[0]) || post.mediaUrl;

              return (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    backgroundColor: '#16161A',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'block',
                    textDecoration: 'none',
                    color: '#FFFFFF'
                  }}
                  className="saved-grid-item"
                >
                  {primaryMedia ? (
                    isVideo ? (
                      <video
                        src={primaryMedia}
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <img
                        src={primaryMedia}
                        alt={post.content?.slice(0, 30) || 'Saved post'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    )
                  ) : (
                    // Text-only post thumbnail card
                    <div style={{
                      width: '100%',
                      height: '100%',
                      padding: '16px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(135deg, #1C1D24 0%, #101014 100%)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#27272A',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {post.author?.avatarData ? (
                            <img src={post.author.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: 700 }}>{(post.author?.name || 'U')[0]}</span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#A1A1AA' }}>
                          @{post.author?.username || 'user'}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#E4E4E7',
                        lineHeight: '1.4',
                        margin: 0,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {post.content}
                      </p>
                    </div>
                  )}

                  {/* Top-Right Badge: Video/Reel icon or Multi-image icon */}
                  {isVideo && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      borderRadius: '4px',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <Play size={14} fill="#FFFFFF" />
                    </div>
                  )}
                  {isMultiImage && !isVideo && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      borderRadius: '4px',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <Layers size={14} />
                    </div>
                  )}

                  {/* Hover Overlay with Likes & Comments Count */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '20px',
                      opacity: 0,
                      transition: 'opacity 0.15s ease'
                    }}
                    className="grid-item-hover-overlay"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px' }}>
                      <Heart size={18} fill="#FFFFFF" color="#FFFFFF" />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px' }}>
                      <MessageCircle size={18} fill="#FFFFFF" color="#FFFFFF" />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentUser={currentUser} />

      <style dangerouslySetInnerHTML={{ __html: `
        .saved-grid-item:hover .grid-item-hover-overlay {
          opacity: 1 !important;
        }
        @media (max-width: 640px) {
          .saved-grid-item {
            border-radius: 4px !important;
          }
        }
      `}} />
    </div>
  );
}
