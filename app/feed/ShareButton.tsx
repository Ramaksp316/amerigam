'use client';

import { Share } from 'lucide-react';

export default function ShareButton({ 
  url, 
  title = "Check this out on Amerigam", 
  text = "" 
}: { 
  url: string, 
  title?: string, 
  text?: string 
}) {
  const handleShare = async () => {
    const fullUrl = window.location.origin + url;
    
    // Check if the Web Share API is available (Native sharing on mobile/desktop)
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
      // Fallback for browsers that don't support Web Share API (older desktops)
      try {
        await navigator.clipboard.writeText(fullUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        alert('Failed to copy link.');
      }
    }
  };

  return (
    <button type="button" onClick={handleShare} className="post-action-btn" title="Share Post">
      <Share size={24} />
    </button>
  );
}
