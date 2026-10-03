'use client';

import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { updateCommunityAvatar } from '../actions';

export default function CommunityAvatarUploader({
  communityId,
  currentAvatar,
  name,
  isAdmin
}: {
  communityId: string;
  currentAvatar?: string | null;
  name: string;
  isAdmin: boolean;
}) {
  const [avatar, setAvatar] = useState(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAvatar(data.url);
        await updateCommunityAvatar(communityId, data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      overflow: 'hidden',
      flexShrink: 0,
      backgroundColor: '#18181B',
      border: '1px solid rgba(255, 255, 255, 0.12)'
    }}>
      <img
        src={avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80'}
        alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {isAdmin && (
        <label
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
          title="Click to update Community Photo"
        >
          {isUploading ? (
            <Loader2 size={16} color="#FFFFFF" className="animate-spin" />
          ) : (
            <Camera size={16} color="#FFFFFF" />
          )}
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      )}
    </div>
  );
}
