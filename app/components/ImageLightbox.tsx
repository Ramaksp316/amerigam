'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageLightbox({ 
  src, 
  alt 
}: { 
  src: string; 
  alt: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        style={{ 
          marginTop: '12px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #27272A',
          backgroundColor: '#15161C',
          width: '100%',
          display: 'block',
          cursor: 'pointer'
        }}
      >
        <motion.img 
          layoutId={`media-${src}`}
          src={src} 
          alt={alt} 
          loading="lazy" 
          style={{ 
            width: '100%', 
            height: 'auto',
            display: 'block',
            objectFit: 'contain'
          }} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out'
            }}
          >
            <motion.img 
              layoutId={`media-${src}`}
              src={src} 
              alt={alt} 
              style={{ 
                maxWidth: '100vw', 
                maxHeight: '100vh',
                objectFit: 'contain'
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
