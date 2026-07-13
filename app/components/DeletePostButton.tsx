'use client';

import { useTransition } from 'react';
import { deletePost } from '../actions/postActions';

export default function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      startTransition(async () => {
        await deletePost(postId);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        padding: '5px',
        opacity: isPending ? 0.5 : 1,
      }}
      title="Delete Post"
    >
      🗑️
    </button>
  );
}
