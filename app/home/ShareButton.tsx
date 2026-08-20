'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ 
  url, 
  title = "Check this out on Amerigam", 
  text = "" 
}: { 
  url: string, 
  title?: string, 
  text?: string 
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = async () => {
    const fullUrl = window.location.origin + url;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: fullUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        type="button" 
        onClick={handleShare} 
        className="post-action-btn" 
        title="Share Post"
      >
        <Share2 size={24} strokeWidth={1.8} />
      </button>
      
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-8px)',
          backgroundColor: 'var(--surface-3)',
          color: 'var(--text-primary)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10
        }}>
          Link copied!
        </div>
      )}
    </div>
  );
}
