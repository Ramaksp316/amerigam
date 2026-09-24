'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Sparkles, UserPlus } from 'lucide-react';
import StoryViewerModal, { StoryItem } from './StoryViewerModal';

interface DesktopFeedTopProps {
  currentUser?: any;
  stories?: StoryItem[];
}

export default function DesktopFeedTop({
  currentUser,
  stories = []
}: DesktopFeedTopProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  // Separate user's own story from others
  const myStory = stories.find(s => s.author.id === currentUser?.id);
  const otherStories = stories.filter(s => s.author.id !== currentUser?.id);

  const displayStories = [
    // Slot 1: User's own story or "Add Story"
    myStory ? { type: 'story', data: myStory, isMine: true } : { type: 'add_story' },
    // Slot 2: First other story or discovery placeholder
    otherStories[0] ? { type: 'story', data: otherStories[0], isMine: false } : { type: 'empty_explore' },
    // Slot 3: Second other story or create prompt
    otherStories[1] ? { type: 'story', data: otherStories[1], isMine: false } : { type: 'empty_prompt' }
  ];

  return (
    <div className="home-stories-container" style={{ padding: '16px 20px 0 20px' }}>
      {/* 3 Story Cards Grid matching Figma dimensions & 9:16 aspect ratio */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        {displayStories.map((slot, idx) => {
          if (slot.type === 'add_story') {
            return (
              <Link
                key="add_story"
                href="/create?type=story"
                style={{
                  aspectRatio: '9/16',
                  backgroundColor: '#16181C',
                  borderRadius: '18px',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="story-card-hover"
              >
                {/* User avatar with plus icon */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
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
                      backgroundColor: '#1D9BF0',
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
            );
          }

          if (slot.type === 'empty_explore') {
            return (
              <Link
                key="empty_explore"
                href="/network"
                style={{
                  aspectRatio: '9/16',
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
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(29, 155, 240, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1D9BF0',
                    marginBottom: '8px'
                  }}
                >
                  <UserPlus size={18} />
                </div>
                <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600, lineHeight: '1.3' }}>
                  Discover Friends
                </span>
                <span style={{ color: '#71717A', fontSize: '10px', marginTop: '4px', lineHeight: '1.2' }}>
                  Follow creators to see stories
                </span>
              </Link>
            );
          }

          if (slot.type === 'empty_prompt') {
            return (
              <div
                key="empty_prompt"
                style={{
                  aspectRatio: '9/16',
                  backgroundColor: '#121316',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EAB308',
                    marginBottom: '8px'
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600, lineHeight: '1.3' }}>
                  Amerigam Pulse
                </span>
                <span style={{ color: '#71717A', fontSize: '10px', marginTop: '4px', lineHeight: '1.2' }}>
                  Real stories disappear in 24h
                </span>
              </div>
            );
          }

          // Real Story Card
          const story = slot.data as StoryItem;
          const storyIdx = stories.findIndex(s => s.id === story.id);

          return (
            <div
              key={story.id}
              onClick={() => setSelectedStoryIndex(storyIdx >= 0 ? storyIdx : 0)}
              style={{
                aspectRatio: '9/16',
                backgroundColor: '#16181C',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
              }}
              className="story-card-hover"
            >
              {/* Media Background Preview */}
              {story.mediaUrl ? (
                story.mediaType === 'video' ? (
                  <video
                    src={story.mediaUrl}
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={story.mediaUrl}
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
                    fontSize: '12px',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}
                >
                  {story.content?.slice(0, 50)}...
                </div>
              )}

              {/* Gradient Overlay for contrast */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Top Creator Info */}
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
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: '2px solid #1D9BF0',
                    overflow: 'hidden',
                    backgroundColor: '#1E1E22',
                    flexShrink: 0
                  }}
                >
                  {story.author.avatarData ? (
                    <img src={story.author.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '11px', fontWeight: 700 }}>
                      {(story.author.username || 'U')[0].toUpperCase()}
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
                  {slot.isMine ? 'You' : `@${story.author.username}`}
                </span>
              </div>

              {/* Bottom Caption snippet if any */}
              {story.content && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    right: '8px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '11px',
                    fontWeight: 500,
                    lineHeight: '1.2',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    zIndex: 5
                  }}
                >
                  {story.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </div>
  );
}
