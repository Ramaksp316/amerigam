'use client';

import { useTransition, useOptimistic, useState } from 'react';
import { toggleFollow } from '../actions/userActions';
import { UserCheck, UserPlus, UserMinus } from 'lucide-react';

export default function FollowButton({ 
  targetUserId, 
  initialIsFollowing 
}: { 
  targetUserId: string, 
  initialIsFollowing: boolean
}) {
  const [isPending, startTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);
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

  const isFollowing = optimisticIsFollowing;
  let btnClass = 'btn btn-small';
  let icon = <UserPlus size={15} />;
  let text = 'Follow';

  if (isFollowing) {
    if (isHovered) {
      btnClass = 'btn btn-small';
      icon = <UserMinus size={15} />;
      text = 'Unfollow';
    } else {
      btnClass = 'btn btn-small btn-outline';
      icon = <UserCheck size={15} />;
      text = 'Following';
    }
  }

  return (
    <button 
      onClick={handleFollow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isPending}
      className={btnClass} 
      style={{ 
        opacity: isPending ? 0.7 : 1,
        minWidth: '105px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1)',
        background: (isFollowing && isHovered) ? 'var(--danger)' : undefined,
        borderColor: (isFollowing && isHovered) ? 'transparent' : undefined,
        color: (isFollowing && isHovered) ? '#FFFFFF' : undefined,
      }}
    >
      {isPending ? (
        <span>Wait...</span>
      ) : (
        <>
          {icon}
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
