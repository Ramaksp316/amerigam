'use client';

import { useTransition, useOptimistic, useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleLike } from '../actions/postActions';

export default function LikeButton({ 
  postId, 
  initialHasLiked, 
  initialLikesCount 
}: { 
  postId: string, 
  initialHasLiked: boolean,
  initialLikesCount: number
}) {
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);
  const [optimisticLike, addOptimisticLike] = useOptimistic(
    { hasLiked: initialHasLiked, count: initialLikesCount },
    (state, newHasLiked: boolean) => ({
      hasLiked: newHasLiked,
      count: newHasLiked ? state.count + 1 : state.count - 1
    })
  );

  const handleLike = () => {
    const nextState = !optimisticLike.hasLiked;
    startTransition(() => {
      addOptimisticLike(nextState);
      if (!optimisticLike.hasLiked) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
    });
    
    toggleLike(postId).catch(console.error);
  };

  return (
    <button 
      onClick={(e) => { e.preventDefault(); handleLike(); }} 
      style={{ 
        background: 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        color: optimisticLike.hasLiked ? '#F91880' : '#71717A',
        outline: 'none',
        position: 'relative',
        padding: '4px',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Ring burst effect */}
      {isAnimating && (
        <span style={{
          position: 'absolute',
          left: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid #F91880',
          animation: 'heartRingBurst 0.5s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}
      <Heart 
        size={18} 
        fill={optimisticLike.hasLiked ? "#F91880" : "none"} 
        color={optimisticLike.hasLiked ? "#F91880" : "#71717A"} 
        style={{ 
          transform: isAnimating ? 'scale(1.35)' : 'scale(1)',
          transition: isAnimating 
            ? 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' 
            : 'transform 0.15s ease, color 0.15s ease',
          filter: isAnimating ? 'drop-shadow(0 0 6px rgba(249, 24, 128, 0.5))' : 'none',
        }}
      />
      <span style={{
        transition: 'color 0.2s ease',
        fontWeight: optimisticLike.hasLiked ? 600 : 400,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {optimisticLike.count > 0 ? optimisticLike.count : ''}
      </span>
      <style>{`
        @keyframes heartRingBurst {
          0% { transform: translateY(-50%) scale(0.5); opacity: 1; }
          100% { transform: translateY(-50%) scale(1.8); opacity: 0; }
        }
      `}</style>
    </button>
  );
}
