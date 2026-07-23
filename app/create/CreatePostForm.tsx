'use client';

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { createPost } from './actions';
import { UploadCloud } from 'lucide-react';

export default function CreatePostForm({ currentUser }: { currentUser: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasMedia, setHasMedia] = useState(false);
  const [mediaName, setMediaName] = useState('');
  
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHasMedia(true);
      setMediaName(file.name);
    } else {
      setHasMedia(false);
      setMediaName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const mediaFile = formData.get('media') as File | null;
    
    let mediaUrl = '';
    let mediaType = '';

    if (mediaFile && mediaFile.size > 0) {
      const fileName = `${Date.now()}-${mediaFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      
      const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, mediaFile, {
            contentType: mediaFile.type,
          });

      if (error) {
        console.error('Storage upload error:', error);
        setErrorMsg('Failed to upload file. Please try again.');
        setIsUploading(false);
        return;
      }

      if (data) {
        const { data: publicUrlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);
        
        mediaUrl = publicUrlData.publicUrl;
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
      }
    }

    const actionData = new FormData();
    actionData.append('type', formData.get('type') as string);
    actionData.append('content', formData.get('content') as string);
    actionData.append('aspectRatio', formData.get('aspectRatio') as string || 'original');
    actionData.append('relatedMasterPath', formData.get('relatedMasterPath') as string);
    actionData.append('relatedCorePath', formData.get('relatedCorePath') as string);
    
    if (mediaUrl) {
      actionData.append('mediaUrl', mediaUrl);
      actionData.append('mediaType', mediaType);
    }

    try {
      await createPost(actionData);
    } catch (error) {
      // Handled by Next.js redirect
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid #dc2626' }}>
          {errorMsg}
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-primary)', fontWeight: 600 }}>Post Type</label>
        <select name="type" className="input-field" style={{ cursor: 'pointer' }}>
          <option value="post">Normal Post</option>
          <option value="project">Project / Portfolio Update</option>
          <option value="status">Status Update</option>
        </select>
      </div>

      <div>
        <textarea name="content" className="input-field" placeholder="What's on your mind? Describe your post or project here..." style={{ resize: 'vertical', minHeight: '140px', fontSize: 'var(--text-md)' }}></textarea>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: 500 }}>Related Path</label>
          <select name="relatedMasterPath" className="input-field" defaultValue={currentUser?.masterPath || ""} style={{ cursor: 'pointer' }}>
            <option value="">None</option>
            <option value="The Professional">The Professional</option>
            <option value="The Creator">The Creator</option>
            <option value="The Athlete">The Athlete</option>
            <option value="The Explorer">The Explorer</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: 500 }}>Specific Arena (Optional)</label>
          <input type="text" name="relatedCorePath" className="input-field" placeholder="e.g. Tech & AI" defaultValue={currentUser?.corePath || ""} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: 500 }}>Upload Photo/Video</label>
        <div style={{ position: 'relative', padding: 'var(--space-8)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', backgroundColor: 'var(--surface-2)', transition: 'all var(--duration-fast) var(--ease-smooth)' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-purple)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
          <UploadCloud size={32} color="var(--text-secondary)" style={{ marginBottom: 'var(--space-2)' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
            {mediaName ? `Selected: ${mediaName}` : 'Drag and drop or click to upload'}
          </p>
          <input 
            type="file" 
            name="media" 
            accept="image/*,video/*" 
            onChange={handleFileChange}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
            disabled={isUploading} 
          />
        </div>
      </div>

      {hasMedia && (
        <div style={{ animation: 'fadeIn var(--duration-fast) var(--ease-smooth)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: 500 }}>Frame / Aspect Ratio</label>
          <select name="aspectRatio" className="input-field" style={{ cursor: 'pointer' }}>
            <option value="original">Original / Fit</option>
            <option value="square">Square (1:1)</option>
            <option value="portrait">Portrait (4:5)</option>
            <option value="landscape">Landscape (16:9)</option>
          </select>
        </div>
      )}

      <button type="submit" className="btn" disabled={isUploading} style={{ marginTop: 'var(--space-4)' }}>
        {isUploading ? 'Uploading & Sharing...' : 'Share Now'}
      </button>
    </form>
  );
}
