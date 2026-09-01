
'use client';
import { Plus } from 'lucide-react';

export default function InviteMembersButton({ communityId }: { communityId: string }) {
  return (
    <button 
      onClick={() => {
        if (typeof window !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(window.location.origin + '/communities/' + communityId);
          alert('Invite link copied to clipboard! Share it with others so they can join.');
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundColor: '#27272A',
        color: 'white',
        border: '1px solid #3F3F46',
        padding: '12px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3F3F46'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#27272A'}
    >
      <Plus size={18} />
      Invite Members (Copy Link)
    </button>
  );
}
