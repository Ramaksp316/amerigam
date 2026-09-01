'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

export default function ProfileShareButton({ username, userId }: { username: string; userId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/user/${userId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Profile on Amerigam`,
          url: url
        });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button 
      onClick={handleShare}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: '#E4E4E7',
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}
    >
      <Share2 size={16} />
      {copied ? 'Copied!' : 'Share Profile'}
    </button>
  );
}
