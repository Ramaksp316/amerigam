'use client';

import { useTransition, useOptimistic } from 'react';
import { toggleFollow } from '../actions/userActions';

export default function FollowButton({ 
  targetUserId, 
  initialIsFollowing 
}: { 
  targetUserId: string, 
  initialIsFollowing: boolean
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useOptimistic(
    initialIsFollowing,
    (_, newIsFollowing: boolean) => newIsFollowing
  );

  const handleFollow = () => {
    startTransition(async () => {
      setOptimisticIsFollowing(!optimisticIsFollowing);
      await toggleFollow(targetUserId);
    });
  };

  return (
    <button 
      onClick={handleFollow}
      disabled={isPending}
      className={`btn btn-small ${optimisticIsFollowing ? 'btn-outline' : ''}`} 
      style={{ fontWeight: 600, opacity: isPending ? 0.7 : 1 }}
    >
      {optimisticIsFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
