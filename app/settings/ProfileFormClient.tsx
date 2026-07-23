'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Check, X } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';

export default function ProfileFormClient({ 
  user, 
  updateAction 
}: { 
  user: any; 
  updateAction: (formData: FormData) => Promise<void> 
}) {
  const [avatarData, setAvatarData] = useState<string>(user.avatarData || '');
  const [status, setStatus] = useState<string>(user.status || 'ONLINE');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isCropping && imageSrc && imageRef.current) {
      // Destroy any existing cropper instance
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }

      cropperRef.current = new Cropper(imageRef.current, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        cropBoxMovable: true,
        cropBoxResizable: false,
        toggleDragModeOnDblclick: false,
        background: false,
      });
    }

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [isCropping, imageSrc]);

  const handleCropSave = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas({
        width: 300,
        height: 300,
      });
      if (canvas) {
        setAvatarData(canvas.toDataURL('image/jpeg', 0.8));
      }
    }
    setIsCropping(false);
    setImageSrc(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <form action={updateAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Hidden inputs to send avatar data */}
        <input type="hidden" name="avatarData" value={avatarData} />
        <input type="hidden" name="status" value={status} />
        
        {/* Profile Picture Upload Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
          <ProfilePicture user={{ ...user, avatarData, status }} size={80} />
          <div>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: 'var(--text-sm)' }}
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
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="input-field"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 14px', borderRadius: '10px', width: '100%', outline: 'none' }}
          >
            <option value="ONLINE" style={{ background: 'var(--surface-1)' }}>Online (Green dot)</option>
            <option value="DND" style={{ background: 'var(--surface-1)' }}>Do Not Disturb (Dark dot with line)</option>
            <option value="OFFLINE" style={{ background: 'var(--surface-1)' }}>Offline (Dark dot)</option>
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

      {/* Cropping Modal */}
      {isCropping && imageSrc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '20px',
            maxWidth: '500px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Crop Profile Image</h3>
              <button onClick={handleCropCancel} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ 
              width: '100%', 
              maxHeight: '300px', 
              overflow: 'hidden', 
              background: '#000',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                ref={imageRef} 
                src={imageSrc} 
                alt="To Crop" 
                style={{ maxWidth: '100%', display: 'block' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={handleCropCancel} 
                className="btn btn-outline" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <X size={16} /> Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCropSave} 
                className="btn" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Check size={16} /> Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
