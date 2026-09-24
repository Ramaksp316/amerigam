'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

export default function CustomVideoPlayer({ 
  src, 
  audioSrc,
  style 
}: { 
  src: string; 
  audioSrc?: string;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted like X/Twitter
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play / pause on scroll via IntersectionObserver (X/Twitter style)
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Auto play muted when scrolled into viewport
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.muted = isMuted;
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
            }
          } else {
            // Auto pause when scrolled away
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: [0.1, 0.5, 0.8] }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMuted]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      if (audioRef.current) audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    if (audioRef.current) audioRef.current.muted = nextMuted;

    if (!nextMuted) {
      videoRef.current.volume = 1.0;
      if (audioRef.current) audioRef.current.volume = 1.0;
    }
    setIsMuted(nextMuted);
    resetControlsTimeout();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    setIsLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || !duration) return;
    const seekValue = parseFloat(e.target.value);
    const seekTime = (seekValue / 100) * duration;
    videoRef.current.currentTime = seekTime;
    if (audioRef.current) audioRef.current.currentTime = seekTime;
    setProgress(seekValue);
    resetControlsTimeout();
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={() => resetControlsTimeout()}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: '16/9',
        userSelect: 'none',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        ...style
      }}
    >
      <video
        ref={videoRef}
        src={src}
        onClick={() => togglePlay()}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        playsInline
        muted={isMuted}
        loop
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer'
        }}
      />
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          playsInline
        />
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 5
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            borderTop: '3px solid #1D9BF0',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}

      {/* Twitter/X Style Center Play Button when paused */}
      {!isPlaying && !isLoading && (
        <div 
          onClick={() => togglePlay()}
          style={{
            position: 'absolute',
            zIndex: 4,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(29, 155, 240, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
          className="play-btn-hover"
        >
          <Play size={26} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: '3px' }} />
        </div>
      )}

      {/* Twitter/X Style Persistent Bottom-Right Mute/Unmute Pill */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          zIndex: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '999px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        <span>{isMuted ? 'Muted' : 'Unmuted'}</span>
      </button>

      {/* Twitter/X Style Persistent Bottom-Left Time Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.72)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '999px',
          padding: '4px 10px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '11px',
          fontWeight: 600,
          fontFamily: 'monospace',
          letterSpacing: '0.3px',
          pointerEvents: 'none'
        }}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Top-Right Fullscreen Button */}
      {showControls && (
        <button
          onClick={handleFullscreen}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 6,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
          aria-label="Fullscreen"
        >
          <Maximize size={15} />
        </button>
      )}

      {/* Bottom Slim Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          zIndex: 5
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#1D9BF0',
            transition: 'width 0.1s linear'
          }}
        />
      </div>

      {/* Spinner Animation */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .play-btn-hover:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
