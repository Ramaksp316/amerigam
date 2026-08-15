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
    // Optimistic update immediately
    const nextState = !optimisticLike.hasLiked;
    startTransition(() => {
      addOptimisticLike(nextState);
      if (!optimisticLike.hasLiked) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
    });
    
    // Fire server action in background without awaiting it to block UI
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
      }}
    >
      <Heart 
        size={18} 
        fill={optimisticLike.hasLiked ? "#F91880" : "none"} 
        color={optimisticLike.hasLiked ? "#F91880" : "#71717A"} 
        style={{ 
          transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      />
      {optimisticLike.count > 0 ? optimisticLike.count : ''}
    </button>
  );
}
