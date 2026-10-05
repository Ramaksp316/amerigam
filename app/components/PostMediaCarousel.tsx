'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // If only 1 image, render single clean image with lightbox
  if (!mediaUrls || mediaUrls.length <= 1) {
    const singleUrl = mediaUrls?.[0];
    if (!singleUrl) return null;
    return <ImageLightbox src={singleUrl} alt={alt} />;
  }

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < mediaUrls.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  return (
    <div style={{ position: 'relative', marginTop: '12px', width: '100%', overflow: 'hidden' }}>
      {/* 1/N Pill Badge */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.68)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          letterSpacing: '0.5px',
          pointerEvents: 'none'
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
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
          const isVideoUrl = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
          return (
            <motion.div
              key={idx}
              onClick={() => openLightbox(idx)}
              whileHover={{ scale: isActive ? 1.01 : 0.98 }}
              style={{
                flex: '0 0 86%',
                maxWidth: '86%',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#16181C',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                aspectRatio: '16 / 10',
                maxHeight: '400px',
                position: 'relative',
                transition: 'transform 0.25s ease, opacity 0.25s ease',
                transform: isActive ? 'scale(1)' : 'scale(0.96)',
                opacity: isActive ? 1 : 0.75,
                boxShadow: isActive ? '0 10px 30px rgba(0, 0, 0, 0.6)' : 'none'
              }}
            >
              {isVideoUrl ? (
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
            </motion.div>
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

      {/* Lightbox Modal with Framer Motion Zoom Animation */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.94)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px',
              cursor: 'zoom-out'
            }}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 100000
              }}
              aria-label="Close"
            >
              <X size={20} />
            </motion.button>

            {/* Prev Lightbox Button */}
            {lightboxIndex > 0 && (
              <button
                onClick={prevLightbox}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 100000
                }}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next Lightbox Button */}
            {lightboxIndex < mediaUrls.length - 1 && (
              <button
                onClick={nextLightbox}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 100000
                }}
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Enlarged Media with Spring Zoom Animation */}
            {mediaUrls[lightboxIndex].endsWith('.mp4') || mediaUrls[lightboxIndex].endsWith('.webm') ? (
              <video
                src={mediaUrls[lightboxIndex]}
                controls
                autoPlay
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '92vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)'
                }}
              />
            ) : (
              <motion.img
                key={mediaUrls[lightboxIndex]}
                src={mediaUrls[lightboxIndex]}
                alt="Enlarged media"
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '92vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '14px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)'
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
