'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

interface PostMediaCarouselProps {
  mediaUrls: string[];
  mediaType?: string;
  alt?: string;
}

export default function PostMediaCarousel({
  mediaUrls,
  mediaType = 'image',
  alt = 'Post media'
}: PostMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // If only 1 image, render single clean image
  if (!mediaUrls || mediaUrls.length <= 1) {
    const singleUrl = mediaUrls?.[0];
    if (!singleUrl) return null;
    return <ImageLightbox src={singleUrl} alt={alt} />;
  }

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    // Each item takes approximately 86% of clientWidth
    const itemWidth = clientWidth * 0.86 + 12;
    const index = Math.round(scrollLeft / itemWidth);
    if (index >= 0 && index < mediaUrls.length) {
      setActiveIndex(index);
    }
  };

  const scrollTo = (index: number) => {
    if (!containerRef.current) return;
    const itemWidth = containerRef.current.clientWidth * 0.86 + 12;
    containerRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  return (
    <div style={{ position: 'relative', marginTop: '12px', width: '100%', overflow: 'hidden' }}>
      {/* Google Pay Style 1/N Badge Pill */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          letterSpacing: '0.5px'
        }}
      >
        {activeIndex + 1}/{mediaUrls.length}
      </div>

      {/* Desktop Prev Button */}
      {activeIndex > 0 && (
        <button
          onClick={() => scrollTo(activeIndex - 1)}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 15,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          aria-label="Previous image"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Desktop Next Button */}
      {activeIndex < mediaUrls.length - 1 && (
        <button
          onClick={() => scrollTo(activeIndex + 1)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 15,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          aria-label="Next image"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Horizontal Peek Carousel Track */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '8px',
          WebkitOverflowScrolling: 'touch',
          paddingRight: '20px'
        }}
        className="hide-scrollbar"
      >
        {mediaUrls.map((url, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              onClick={() => setLightboxSrc(url)}
              style={{
                flex: '0 0 86%',
                maxWidth: '86%',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#16181C',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                aspectRatio: '4/3',
                position: 'relative',
                transition: 'transform 0.25s ease, opacity 0.25s ease',
                transform: isActive ? 'scale(1)' : 'scale(0.96)',
                opacity: isActive ? 1 : 0.75,
                boxShadow: isActive ? '0 10px 30px rgba(0, 0, 0, 0.6)' : 'none'
              }}
            >
              {url.endsWith('.mp4') || url.endsWith('.webm') ? (
                <video
                  src={url}
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
                  src={url}
                  alt={`${alt} ${idx + 1}`}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Indicator Dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px'
        }}
      >
        {mediaUrls.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: idx === activeIndex ? '18px' : '6px',
              height: '6px',
              borderRadius: '999px',
              backgroundColor: idx === activeIndex ? '#1D9BF0' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          />
        ))}
      </div>

      {/* Lightbox when tapped */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <img
            src={lightboxSrc}
            alt="Enlarged media"
            style={{
              maxWidth: '95vw',
              maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: '12px'
            }}
          />
        </div>
      )}
    </div>
  );
}
