'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function ImageLightbox({
  src,
  alt = 'Image',
  style,
  imgStyle,
  onLoad
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#0F1015',
          width: '100%',
          display: 'block',
          cursor: 'zoom-in',
          position: 'relative',
          ...style
        }}
      >
        <motion.img
          layoutId={`media-${src}`}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={onLoad}
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            ...imgStyle
          }}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
              padding: '20px'
            }}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
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
                zIndex: 100000,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
              aria-label="Close image"
            >
              <X size={20} />
            </motion.button>

            {/* Enlarged Image with Smooth Spring Zoom Animation */}
            <motion.img
              layoutId={`media-${src}`}
              src={src}
              alt={alt}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
