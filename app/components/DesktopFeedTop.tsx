'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, ChevronRight, UserPlus, Sparkles } from 'lucide-react';
import StoryViewerModal, { StoryItem, UserStoriesGroup } from './StoryViewerModal';

interface DesktopFeedTopProps {
  currentUser?: any;
  stories?: StoryItem[];
}

export default function DesktopFeedTop({
  currentUser,
  stories = []
}: DesktopFeedTopProps) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group stories by author
  const groupMap = new Map<string, StoryItem[]>();
  stories.forEach((s) => {
    if (!s.author?.id) return;
    const list = groupMap.get(s.author.id) || [];
    list.push(s);
    groupMap.set(s.author.id, list);
  });

  const myGroupStories = currentUser?.id ? groupMap.get(currentUser.id) || [] : [];
  myGroupStories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Other creators' story groups
  const otherGroups: UserStoriesGroup[] = [];
  groupMap.forEach((userStories, authorId) => {
    if (authorId === currentUser?.id) return;
    userStories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    otherGroups.push({
      author: userStories[0].author,
      stories: userStories
    });
  });

  // Unified list of groups for the viewer modal
  const allViewerGroups: UserStoriesGroup[] = [];
  if (myGroupStories.length > 0 && currentUser) {
    allViewerGroups.push({
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatarData: currentUser.avatarData
      },
      stories: myGroupStories
    });
  }
  allViewerGroups.push(...otherGroups);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const hasMultipleCards = (myGroupStories.length > 0 ? 1 : 1) + otherGroups.length > 3;

  return (
    <div className="home-stories-container" style={{ padding: '16px 20px 0 20px', position: 'relative' }}>
      {/* Navigation Arrows for Horizontal Carousel */}
      {hasMultipleCards && (
        <>
          <button
            onClick={scrollLeft}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 20, 24, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              transition: 'background-color 0.15s ease'
            }}
            className="desktop-only"
            title="Scroll Left"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={scrollRight}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 20, 24, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              transition: 'background-color 0.15s ease'
            }}
            className="desktop-only"
            title="Scroll Right"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Horizontal Scrollable Row / Carousel matching Figma Home page.png */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          marginBottom: '20px',
          paddingBottom: '4px'
        }}
        className="stories-scroll-row"
      >
        {/* ========================================================
            SLOT 1: CURRENT USER'S STORY OR ADD STORY
           ======================================================== */}
        {myGroupStories.length > 0 ? (
          /* User has an active story: show card with latest media preview */
          <div
            onClick={() => setActiveGroupIndex(0)}
            style={{
              width: '136px',
              minWidth: '136px',
              height: '236px',
              backgroundColor: '#16181C',
              borderRadius: '18px',
              border: '1.5px solid #0284C7',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              scrollSnapAlign: 'start',
              flexShrink: 0
            }}
            className="story-card-hover"
          >
            {/* Background preview */}
            {(() => {
              const latest = myGroupStories[myGroupStories.length - 1];
              if (latest.mediaUrl) {
                return latest.mediaType === 'video' ? (
                  <video
                    src={latest.mediaUrl}
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={latest.mediaUrl}
                    alt="Your story"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                );
              }
              return (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #0284C7, #1E1B4B)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px',
                    color: '#FFF',
                    fontSize: '11px',
                    textAlign: 'center'
                  }}
                >
                  {latest.content?.slice(0, 40)}
                </div>
              );
            })()}

            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none'
              }}
            />

            {/* Top Avatar & 'Your Story' */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 5
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: '2px solid #0284C7',
                  overflow: 'hidden',
                  backgroundColor: '#1E1E22',
                  flexShrink: 0
                }}
              >
                {currentUser?.avatarData ? (
                  <img src={currentUser.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '11px', fontWeight: 700 }}>
                    {(currentUser?.name || currentUser?.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Your Story
              </span>
            </div>

            {/* Bottom Add-More Plus Pill */}
            <Link
              href="/create?type=story"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#0284C7',
                border: '1.5px solid #16181C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                textDecoration: 'none',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)'
              }}
              title="Add another story"
            >
              <Plus size={14} strokeWidth={3} />
            </Link>
          </div>
        ) : (
          /* User has NO active story: Clean "Add Story" Card */
          <Link
            key="add_story"
            href="/create?type=story"
            style={{
              width: '136px',
              minWidth: '136px',
              height: '236px',
              backgroundColor: '#16181C',
              borderRadius: '18px',
              border: '1.5px dashed rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px',
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              scrollSnapAlign: 'start',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
            className="story-card-hover"
          >
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#27272A',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {currentUser?.avatarData ? (
                  <img src={currentUser.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700 }}>
                    {(currentUser?.name || currentUser?.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  backgroundColor: '#0284C7',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #16181C',
                  color: '#FFF'
                }}
              >
                <Plus size={13} strokeWidth={3} />
              </div>
            </div>

            <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
              Add Story
            </span>
            <span style={{ color: '#71717A', fontSize: '11px', textAlign: 'center', marginTop: '2px' }}>
              24h update
            </span>
          </Link>
        )}

        {/* ========================================================
            SLOT 2+: FOLLOWED CREATORS' STORIES (One card per creator)
           ======================================================== */}
        {otherGroups.map((group, groupIdx) => {
          const viewerIndex = (myGroupStories.length > 0 ? 1 : 0) + groupIdx;
          const latestStory = group.stories[group.stories.length - 1];

          return (
            <div
              key={group.author.id}
              onClick={() => setActiveGroupIndex(viewerIndex)}
              style={{
                width: '136px',
                minWidth: '136px',
                height: '236px',
                backgroundColor: '#16181C',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                scrollSnapAlign: 'start',
                flexShrink: 0
              }}
              className="story-card-hover"
            >
              {/* Media Background Preview */}
              {latestStory.mediaUrl ? (
                latestStory.mediaType === 'video' ? (
                  <video
                    src={latestStory.mediaUrl}
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={latestStory.mediaUrl}
                    alt="Story preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}
                >
                  {latestStory.content?.slice(0, 45)}...
                </div>
              )}

              {/* Gradient Overlay for high-contrast text */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Top Creator Info matching Figma Home page.png (@creator overlay) */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  right: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 5
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '2px solid #0284C7',
                    overflow: 'hidden',
                    backgroundColor: '#1E1E22',
                    flexShrink: 0
                  }}
                >
                  {group.author.avatarData ? (
                    <img src={group.author.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '11px', fontWeight: 700 }}>
                      {(group.author.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  @{group.author.username}
                </span>
              </div>

              {/* Bottom Multi-Slide Indicator Badge if creator has multiple stories */}
              {group.stories.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    zIndex: 5
                  }}
                >
                  {group.stories.length}
                </div>
              )}
            </div>
          );
        })}

        {/* Discovery card if no followed creators have stories */}
        {otherGroups.length === 0 && (
          <Link
            href="/network"
            style={{
              width: '136px',
              minWidth: '136px',
              height: '236px',
              backgroundColor: '#121316',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px',
              textDecoration: 'none',
              position: 'relative',
              textAlign: 'center',
              scrollSnapAlign: 'start',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284C7',
                marginBottom: '8px'
              }}
            >
              <UserPlus size={18} />
            </div>
            <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600, lineHeight: '1.3' }}>
              Find Friends
            </span>
            <span style={{ color: '#71717A', fontSize: '10px', marginTop: '4px', lineHeight: '1.2' }}>
              Follow creators to view stories
            </span>
          </Link>
        )}
      </div>

      {/* Story Viewer Modal (Multi-user, Multi-slide) */}
      {activeGroupIndex !== null && allViewerGroups.length > 0 && (
        <StoryViewerModal
          groups={allViewerGroups}
          initialGroupIndex={activeGroupIndex}
          onClose={() => setActiveGroupIndex(null)}
        />
      )}
    </div>
  );
}
