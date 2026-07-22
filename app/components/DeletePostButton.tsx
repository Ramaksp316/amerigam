'use client';

import { useTransition, useState } from 'react';
import { deletePost } from '../actions/postActions';
import { Trash2, AlertCircle } from 'lucide-react';

export default function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deletePost(postId);
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setShowConfirm(!showConfirm)}
        disabled={isPending}
        className="post-action-btn"
        style={{
          color: showConfirm ? 'var(--danger)' : 'var(--text-secondary)',
          opacity: isPending ? 0.5 : 1,
        }}
        title="Delete Post"
      >
        <Trash2 size={20} />
      </button>

      {showConfirm && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
            onClick={() => setShowConfirm(false)}
          />
          <div className="card" style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3)',
            width: '200px',
            zIndex: 50,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--danger)' }}>
              <AlertCircle size={16} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Delete Post?</span>
            </div>
            
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button 
                onClick={() => setShowConfirm(false)}
                className="btn btn-outline btn-small"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isPending}
                className="btn btn-small"
                style={{ flex: 1, background: 'var(--danger)' }}
              >
                {isPending ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
