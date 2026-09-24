'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function VoiceMessagePlayer({
  src,
  duration,
  isMe = false
}: {
  src: string;
  duration?: number | null;
  isMe?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error('Audio play error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && (!totalDuration || isNaN(totalDuration))) {
      setTotalDuration(Math.floor(audioRef.current.duration) || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // 18 pseudo-random wave bar heights for audio visualizer
  const waveHeights = [8, 14, 20, 12, 18, 24, 16, 22, 10, 18, 24, 14, 20, 16, 12, 18, 10, 6];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '4px 2px',
        minWidth: '220px',
        maxWidth: '280px'
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        title={isPlaying ? 'Pause' : 'Play voice note'}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: isMe ? '#FFFFFF' : '#0284C7',
          color: isMe ? '#0284C7' : '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.15s ease'
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" style={{ marginLeft: '2px' }} />}
      </button>

      {/* Waveform Visualization Bars */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
            if (audioRef.current && totalDuration > 0) {
              const newTime = newPercent * totalDuration;
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            height: '24px',
            cursor: 'pointer'
          }}
        >
          {waveHeights.map((h, i) => {
            const barPercent = (i / (waveHeights.length - 1)) * 100;
            const isFilled = barPercent <= progressPercent;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}px`,
                  borderRadius: '2px',
                  backgroundColor: isFilled
                    ? (isMe ? '#FFFFFF' : '#38BDF8')
                    : (isMe ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'),
                  transition: 'background-color 0.1s ease'
                }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: isMe ? 'rgba(255, 255, 255, 0.85)' : '#A1A1AA',
            fontWeight: 500
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
}
