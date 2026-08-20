'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

export default function CustomVideoPlayer({ 
  src, 
  audioSrc,
  style 
}: { 
  src: string; 
  audioSrc?: string;
  style?: React.CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    }, 2500);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  useEffect(() => {
    resetControlsTimeout();
    // Explicitly set initial audio state
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = isMuted ? 0 : 1.0;
    }
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = isMuted ? 0 : 1.0;
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isMuted]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: '16/9',
        boxShadow: 'var(--shadow-lg)',
        userSelect: 'none',
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
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
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
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            borderTop: '3px solid var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}

      {/* Play/Pause Large Center Overlay (Shows on Hover/Pause) */}
      {(!isPlaying || showControls) && !isLoading && (
        <div 
          onClick={() => togglePlay()}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isPlaying ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.45)',
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            zIndex: 2
          }}
        >
          {!isPlaying && (
            <div style={{
              background: 'var(--gradient-primary)',
              borderRadius: '50%',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)',
              transform: 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Play size={28} color="white" fill="white" style={{ marginLeft: '4px' }} />
            </div>
          )}
        </div>
      )}

      {/* Bottom Controls Overlay */}
      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.3), transparent)',
          padding: '12px 16px 8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 3,
          transition: 'opacity 0.3s ease'
        }}>
          {/* Progress Seekbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <input 
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              style={{
                flexGrow: 1,
                height: '4px',
                accentColor: 'var(--accent-cyan)',
                cursor: 'pointer',
                background: `linear-gradient(to right, var(--accent-cyan) ${progress}%, rgba(255, 255, 255, 0.25) ${progress}%)`,
                borderRadius: '2px',
                outline: 'none'
              }}
            />
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Play/Pause Button */}
              <button 
                onClick={togglePlay}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
              </button>

              {/* Mute Button */}
              <button 
                onClick={toggleMute}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* Time Display */}
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.95)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div>
              {/* Fullscreen Button */}
              <button 
                onClick={handleFullscreen}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Spinner Spin Style */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
