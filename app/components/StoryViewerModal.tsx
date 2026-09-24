'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import LocalTime from './LocalTime';

export interface StoryItem {
  id: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  content?: string | null;
  createdAt: string | Date;
  expiresAt: string | Date;
  author: {
    id: string;
    name?: string | null;
    username?: string | null;
    avatarData?: string | null;
  };
}

export interface UserStoriesGroup {
  author: {
    id: string;
    name?: string | null;
    username?: string | null;
    avatarData?: string | null;
  };
  stories: StoryItem[];
}

interface StoryViewerModalProps {
  groups: UserStoriesGroup[];
  initialGroupIndex?: number;
  initialSlideIndex?: number;
  onClose: () => void;
}

export default function StoryViewerModal({
  groups = [],
  initialGroupIndex = 0,
  initialSlideIndex = 0,
  onClose
}: StoryViewerModalProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(
    Math.min(initialGroupIndex, Math.max(0, groups.length - 1))
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentGroup = groups[currentGroupIndex];
  const currentStories = currentGroup?.stories || [];
  const currentStory = currentStories[currentSlideIndex];

  // Auto-advance progress timer
  useEffect(() => {
    if (!currentStory) return;
    setProgress(0);

    const isVideo = currentStory.mediaType === 'video';
    const durationMs = isVideo ? 15000 : 5000;
    const intervalMs = 50;
    const step = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      if (isPaused) return;
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentGroupIndex, currentSlideIndex, isPaused, currentStory]);

  const handleNextSlide = () => {
    if (!currentGroup) return;

    if (currentSlideIndex < currentStories.length - 1) {
      // Advance to next slide of current creator
      setCurrentSlideIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentGroupIndex < groups.length - 1) {
      // Advance to next creator's first slide
      setCurrentGroupIndex((prev) => prev + 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    } else {
      // Finished all creators
      onClose();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      // Go to previous slide of current creator
      setCurrentSlideIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0) {
      // Go to previous creator's last slide
      const prevGroup = groups[currentGroupIndex - 1];
      setCurrentGroupIndex((prev) => prev - 1);
      setCurrentSlideIndex(Math.max(0, prevGroup.stories.length - 1));
      setProgress(0);
    } else {
      // Restart current slide from beginning
      setProgress(0);
    }
  };

  const handlePrevGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prev) => prev - 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    }
  };

  const handleNextGroup = () => {
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.96)',
        backdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Story Card Box (Mobile 9:16 frame) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px',
          height: '100%',
          maxHeight: '92vh',
          backgroundColor: '#0A0A0C',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Top Progress Bars (Multi-slide WhatsApp / Instagram segments for current creator) */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            gap: '4px',
            zIndex: 30
          }}
        >
          {currentStories.map((s, idx) => {
            let fillWidth = '0%';
            if (idx < currentSlideIndex) fillWidth = '100%';
            else if (idx === currentSlideIndex) fillWidth = `${progress}%`;

            return (
              <div
                key={s.id || idx}
                style={{
                  flex: 1,
                  height: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: fillWidth,
                    backgroundColor: '#FFFFFF',
                    transition: idx === currentSlideIndex ? 'width 0.05s linear' : 'none'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Author Row */}
        <div
          style={{
            position: 'absolute',
            top: '26px',
            left: '14px',
            right: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 30
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #0284C7',
                backgroundColor: '#1E1E22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {currentGroup.author.avatarData ? (
                <img
                  src={currentGroup.author.avatarData}
                  alt={currentGroup.author.username || 'Story author'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#FFF', fontWeight: 700, fontSize: '14px' }}>
                  {(currentGroup.author.name || currentGroup.author.username || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700 }}>
                {currentGroup.author.name || currentGroup.author.username}
              </div>
              <div style={{ color: '#A1A1AA', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>@{currentGroup.author.username}</span>
                <span>•</span>
                <LocalTime date={currentStory.createdAt} format="relative" />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Media / Content Area */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentStory.mediaUrl ? (
            currentStory.mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={currentStory.mediaUrl}
                autoPlay
                playsInline
                muted={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={currentStory.mediaUrl}
                alt="Story content"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#FFFFFF', fontSize: '18px', fontWeight: 600 }}>
              {currentStory.content}
            </div>
          )}

          {/* Left / Right Tap zones */}
          <div
            onClick={handlePrevSlide}
            style={{ position: 'absolute', left: 0, top: 0, width: '35%', height: '100%', cursor: 'pointer', zIndex: 20 }}
          />
          <div
            onClick={handleNextSlide}
            style={{ position: 'absolute', right: 0, top: 0, width: '65%', height: '100%', cursor: 'pointer', zIndex: 20 }}
          />
        </div>

        {/* Story Caption at bottom if present */}
        {currentStory.content && currentStory.mediaUrl && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '16px',
              right: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: '10px 14px',
              borderRadius: '14px',
              color: '#FFFFFF',
              fontSize: '14px',
              textAlign: 'center',
              zIndex: 30
            }}
          >
            {currentStory.content}
          </div>
        )}
      </div>

      {/* Outside Desktop Navigation Controls (Switching between creators) */}
      {currentGroupIndex > 0 && (
        <button
          onClick={handlePrevGroup}
          style={{
            position: 'absolute',
            left: '32px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background-color 0.15s ease'
          }}
          title="Previous Creator"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {currentGroupIndex < groups.length - 1 && (
        <button
          onClick={handleNextGroup}
          style={{
            position: 'absolute',
            right: '32px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background-color 0.15s ease'
          }}
          title="Next Creator"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}
