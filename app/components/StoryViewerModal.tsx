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

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex?: number;
  onClose: () => void;
}

export default function StoryViewerModal({
  stories,
  initialIndex = 0,
  onClose
}: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStory = stories[currentIndex];

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
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentStory) return null;

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
      {/* Story Box Container (Mobile 9:16 frame) */}
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
        {/* Top Progress Bars */}
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
          {stories.map((s, idx) => {
            let fillWidth = '0%';
            if (idx < currentIndex) fillWidth = '100%';
            else if (idx === currentIndex) fillWidth = `${progress}%`;

            return (
              <div
                key={s.id}
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
                    transition: idx === currentIndex ? 'width 0.05s linear' : 'none'
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
                border: '2px solid #1D9BF0',
                backgroundColor: '#1E1E22'
              }}
            >
              {currentStory.author.avatarData ? (
                <img
                  src={currentStory.author.avatarData}
                  alt={currentStory.author.username || 'Story author'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700 }}>
                  {(currentStory.author.username || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700 }}>
                {currentStory.author.name || currentStory.author.username}
              </div>
              <div style={{ color: '#A1A1AA', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>@{currentStory.author.username}</span>
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
            onClick={handlePrev}
            style={{ position: 'absolute', left: 0, top: 0, width: '35%', height: '100%', cursor: 'pointer', zIndex: 20 }}
          />
          <div
            onClick={handleNext}
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

      {/* Outside Desktop Navigation Controls */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          style={{
            position: 'absolute',
            left: '32px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          style={{
            position: 'absolute',
            right: '32px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}
