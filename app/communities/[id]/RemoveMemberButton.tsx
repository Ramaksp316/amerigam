'use client';
import { useState } from 'react';
import { UserMinus } from 'lucide-react';
import { removeMemberFromCommunity } from './actions';

export default function RemoveMemberButton({ communityId, userId, userName }: { communityId: string, userId: string, userName: string }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent link navigation if it's inside a Link
    e.stopPropagation();

    if (!confirm(`Are you sure you want to remove ${userName} from the community?`)) return;

    setIsRemoving(true);
    try {
      const res = await removeMemberFromCommunity(communityId, userId);
      if (res && !res.success) {
        alert(res.error || 'Failed to remove member');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to remove member');
    }
    setIsRemoving(false);
  };

  return (
    <button 
      onClick={handleRemove}
      disabled={isRemoving}
      style={{
        background: 'none',
        border: 'none',
        color: '#ef4444',
        cursor: isRemoving ? 'not-allowed' : 'pointer',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        opacity: isRemoving ? 0.5 : 1
      }}
      title="Remove member"
    >
      <UserMinus size={18} />
    </button>
  );
}