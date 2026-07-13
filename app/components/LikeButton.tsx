'use client';

import { useTransition, useOptimistic } from 'react';
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
  const [optimisticLike, addOptimisticLike] = useOptimistic(
    { hasLiked: initialHasLiked, count: initialLikesCount },
    (state, newHasLiked: boolean) => ({
      hasLiked: newHasLiked,
      count: newHasLiked ? state.count + 1 : state.count - 1
    })
  );

  const handleLike = () => {
    startTransition(async () => {
      addOptimisticLike(!optimisticLike.hasLiked);
      await toggleLike(postId);
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <button 
        onClick={handleLike} 
        disabled={isPending}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <Heart 
          size={24} 
          fill={optimisticLike.hasLiked ? "#ff3040" : "none"} 
          color={optimisticLike.hasLiked ? "#ff3040" : "var(--text-primary)"} 
          style={{ transition: 'all 0.2s ease-in-out', transform: isPending ? 'scale(0.9)' : 'scale(1)' }}
        />
      </button>
    </div>
  );
}
