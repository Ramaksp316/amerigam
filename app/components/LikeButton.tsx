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
    if (!optimisticLike.hasLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
    startTransition(async () => {
      addOptimisticLike(!optimisticLike.hasLiked);
      await toggleLike(postId);
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <button 
        onClick={handleLike} 
        disabled={isPending}
        className="post-action-btn"
        style={{ 
          transform: isAnimating ? 'scale(1.3)' : 'scale(1)',
          transition: 'transform var(--duration-normal) var(--ease-spring)'
        }}
      >
        <Heart 
          size={24} 
          fill={optimisticLike.hasLiked ? "#EF4444" : "none"} 
          color={optimisticLike.hasLiked ? "#EF4444" : "var(--text-primary)"} 
        />
      </button>
    </div>
  );
}
