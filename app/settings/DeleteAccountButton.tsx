'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteAccountButton({ deleteAction }: { deleteAction: () => Promise<void> }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAction();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  if (isConfirming) {
    return (
      <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <h3 style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: 'var(--space-2)' }}>Are you absolutely sure?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-4)' }}>
          This action cannot be undone. This will permanently delete your account, posts, comments, and remove your data from our servers.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ 
              backgroundColor: 'var(--danger)', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1
            }}
          >
            {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
          </button>
          <button 
            onClick={() => setIsConfirming(false)}
            disabled={isDeleting}
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-color)' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trash2 size={18} /> Delete Account
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-4)' }}>
        Permanently delete your account and all of your content.
      </p>
      <button 
        onClick={() => setIsConfirming(true)}
        style={{ 
          backgroundColor: 'transparent', 
          color: 'var(--danger)', 
          border: '1px solid var(--danger)', 
          padding: '8px 16px', 
          borderRadius: '6px', 
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Delete Account
      </button>
    </div>
  );
}
