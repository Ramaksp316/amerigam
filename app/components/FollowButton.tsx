'use client';

import { useTransition, useOptimistic, useState } from 'react';
import { toggleFollow } from '../actions/userActions';
import { UserCheck, UserPlus, UserMinus } from 'lucide-react';

export default function FollowButton({ 
  targetUserId, 
  initialIsFollowing,
  fullWidth = false
}: { 
  targetUserId: string, 
  initialIsFollowing: boolean,
  fullWidth?: boolean
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
      style={{ 
        opacity: isPending ? 0.7 : 1,
        width: fullWidth ? '100%' : 'auto',
        minWidth: '110px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 600,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isFollowing 
          ? (isHovered ? 'rgba(239, 68, 68, 0.1)' : 'transparent') 
          : '#1D9BF0',
        color: isFollowing 
          ? (isHovered ? '#ef4444' : '#E4E4E7') 
          : 'white',
        border: isFollowing
          ? (isHovered ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)')
          : '1px solid #1D9BF0',
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
