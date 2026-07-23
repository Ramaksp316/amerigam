'use client';

import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';

export default function ProfileFormClient({ 
  user, 
  updateAction 
}: { 
  user: any; 
  updateAction: (formData: FormData) => Promise<void> 
}) {
  const [avatarData, setAvatarData] = useState<string>(user.avatarData || '');
  const [status, setStatus] = useState<string>(user.status || 'ONLINE');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form action={updateAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Hidden inputs to send avatar and status */}
      <input type="hidden" name="avatarData" value={avatarData} />
      
      {/* Profile Picture Upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
        <ProfilePicture user={{ ...user, avatarData, status }} size={80} />
        <div>
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={16} /> Change Picture
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-secondary)' }}>Online Status</label>
        <select 
          name="status" 
          value={status} 
          onChange={(e) => setStatus(e.target.value)} 
          className="input-field"
        >
          <option value="ONLINE">Online (Green)</option>
          <option value="DND">Do Not Disturb (Red)</option>
          <option value="OFFLINE">Offline (Gray)</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-secondary)' }}>Display Name</label>
        <input type="text" name="name" className="input-field" defaultValue={user.name || ''} placeholder="Your Name" required />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-secondary)' }}>Bio</label>
        <textarea name="bio" className="input-field" defaultValue={user.bio || ''} placeholder="Write a short bio..." style={{ resize: 'vertical', minHeight: '100px' }}></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-secondary)' }}>Portfolio URL</label>
        <input type="url" name="portfolioUrl" className="input-field" defaultValue={user.portfolioUrl || ''} placeholder="https://yourwebsite.com" />
      </div>

      <button type="submit" className="btn" style={{ marginTop: 'var(--space-2)' }}>Save Profile</button>
    </form>
  );
}
