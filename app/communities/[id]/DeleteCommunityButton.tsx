
'use client';
import { deleteCommunity } from '../actions';
import { Trash } from 'lucide-react';

export default function DeleteCommunityButton({ communityId }: { communityId: string }) {
  return (
    <button 
      onClick={async () => {
        if (confirm('Are you sure you want to delete this community? This cannot be undone.')) {
          await deleteCommunity(communityId);
        }
      }}
      style={{
        marginTop: '20px',
        width: '100%',
        padding: '12px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#EF4444',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
    >
      <Trash size={18} />
      Delete Community
    </button>
  );
}
