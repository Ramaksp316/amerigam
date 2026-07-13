'use client';

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { createPost } from './actions';

export default function CreatePostForm({ currentUser }: { currentUser: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const mediaFile = formData.get('media') as File | null;
    
    let mediaUrl = '';
    let mediaType = '';

    // Upload file directly from Client if present
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

    // Call the server action with the exact URL instead of the file
    // We create a new FormData without the large file to avoid Vercel's 4.5MB limit
    const actionData = new FormData();
    actionData.append('type', formData.get('type') as string);
    actionData.append('content', formData.get('content') as string);
    actionData.append('relatedMasterPath', formData.get('relatedMasterPath') as string);
    actionData.append('relatedCorePath', formData.get('relatedCorePath') as string);
    
    if (mediaUrl) {
      actionData.append('mediaUrl', mediaUrl);
      actionData.append('mediaType', mediaType);
    }

    // We can't await redirect from the server action directly in a component try-catch easily 
    // unless we let the action execute and let it redirect on the server.
    try {
      await createPost(actionData);
    } catch (error) {
      // If error occurs, we handle it. But standard Next.js redirect throws a specific error we shouldn't catch,
      // but wrapping it usually works since server actions handle redirect internally.
      // Since createPost calls redirect(), we don't need to do anything else here.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-primary)', fontWeight: 600 }}>Post Type:</label>
        <select name="type" className="input-field" style={{ cursor: 'pointer', backgroundColor: 'var(--card-bg)' }}>
          <option value="post">Normal Post</option>
          <option value="project">Project / Portfolio Update</option>
          <option value="status">Status Update</option>
        </select>
      </div>

      <div>
        <textarea name="content" className="input-field" placeholder="What's on your mind? Describe your post or project here..." style={{ resize: 'vertical', minHeight: '120px' }}></textarea>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Related Path:</label>
          <select name="relatedMasterPath" className="input-field" defaultValue={currentUser?.masterPath || ""} style={{ cursor: 'pointer' }}>
            <option value="">None</option>
            <option value="The Professional">The Professional</option>
            <option value="The Creator">The Creator</option>
            <option value="The Athlete">The Athlete</option>
            <option value="The Explorer">The Explorer</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Specific Arena (Optional):</label>
          <input type="text" name="relatedCorePath" className="input-field" placeholder="e.g. Tech & AI" defaultValue={currentUser?.corePath || ""} />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Upload Photo/Video: </label>
        <div style={{ padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
          <input type="file" name="media" accept="image/*,video/*" style={{ color: 'var(--text-secondary)' }} disabled={isUploading} />
        </div>
      </div>

      <button type="submit" className="btn" disabled={isUploading}>
        {isUploading ? 'Uploading & Sharing...' : 'Share'}
      </button>
    </form>
  );
}
