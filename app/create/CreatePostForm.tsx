'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { createPost } from './actions';
import { UploadCloud } from 'lucide-react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';

export default function CreatePostForm({ currentUser }: { currentUser: any }) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasMedia, setHasMedia] = useState(false);
  const [mediaName, setMediaName] = useState('');
  
  // Cropping Modal States
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | typeof NaN>(NaN);
  const [selectedAspectRatioType, setSelectedAspectRatioType] = useState<string>('original');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaName(file.name);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result as string);
          setIsCropping(true);
        };
        reader.readAsDataURL(file);
      } else {
        // Video file - skip cropping
        setHasMedia(true);
        setCroppedBlob(null);
        setCroppedPreview(null);
      }
    } else {
      setHasMedia(false);
      setMediaName('');
      setCroppedBlob(null);
      setCroppedPreview(null);
    }
  };

  useEffect(() => {
    if (isCropping && imageSrc && imageRef.current) {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
      cropperRef.current = new Cropper(imageRef.current, {
        aspectRatio: aspectRatio,
        viewMode: 1,
        dragMode: 'move',
        cropBoxMovable: true,
        cropBoxResizable: true,
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
  }, [isCropping, imageSrc, aspectRatio]);

  const changeCropRatio = (ratioType: string, ratioValue: number | typeof NaN) => {
    setSelectedAspectRatioType(ratioType);
    setAspectRatio(ratioValue);
    if (cropperRef.current) {
      cropperRef.current.setAspectRatio(ratioValue);
    }
  };

  const handleCropSave = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas({
        maxWidth: 1200,
        maxHeight: 1200,
      });
      if (canvas) {
        setCroppedPreview(canvas.toDataURL('image/jpeg', 0.85));
        canvas.toBlob((blob) => {
          if (blob) {
            setCroppedBlob(blob);
            setHasMedia(true);
          }
        }, 'image/jpeg', 0.85);
      }
    }
    setIsCropping(false);
    setImageSrc(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    setHasMedia(false);
    setMediaName('');
    setCroppedBlob(null);
    setCroppedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const originalFile = formData.get('media') as File | null;
    
    let mediaFile: File | Blob | null = originalFile;
    if (croppedBlob && mediaName) {
      mediaFile = new File([croppedBlob], mediaName, { type: 'image/jpeg' });
    }
    
    let mediaUrl = '';
    let mediaType = '';

    if (mediaFile && mediaFile.size > 0) {
      const fileName = `${Date.now()}-${mediaName.replace(/[^a-zA-Z0-9.\-_]/g, '') || 'post-image.jpg'}`;
      
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
    actionData.append('aspectRatio', selectedAspectRatioType);
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
            ref={fileInputRef}
            name="media" 
            accept="image/*,video/*" 
            onChange={handleFileChange}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
            disabled={isUploading} 
          />
        </div>
      </div>

      {croppedPreview && (
        <div style={{ marginTop: 'var(--space-2)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Cropped Post Preview:</span>
          <img src={croppedPreview} alt="Cropped Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'contain' }} />
          <button 
            type="button" 
            className="btn btn-xs btn-outline" 
            onClick={() => {
              setCroppedBlob(null);
              setCroppedPreview(null);
              setIsCropping(true);
              setImageSrc(croppedPreview);
            }}
          >
            Adjust Crop
          </button>
        </div>
      )}

      {hasMedia && !croppedPreview && (
        <div style={{ animation: 'fadeIn var(--duration-fast) var(--ease-smooth)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)', fontWeight: 500 }}>Frame / Aspect Ratio</label>
          <select 
            name="aspectRatio" 
            className="input-field" 
            value={selectedAspectRatioType}
            onChange={(e) => setSelectedAspectRatioType(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
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
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'var(--surface-1)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '550px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid var(--border-color)',
          }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Crop Post Image</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>Select the aspect ratio and frame portion of the photo you want to publish.</p>
            
            {/* Aspect Ratio select options */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <button type="button" className={`btn btn-xs ${selectedAspectRatioType === 'original' ? '' : 'btn-outline'}`} onClick={() => changeCropRatio('original', NaN)}>Original / Free</button>
              <button type="button" className={`btn btn-xs ${selectedAspectRatioType === 'square' ? '' : 'btn-outline'}`} onClick={() => changeCropRatio('square', 1)}>Square (1:1)</button>
              <button type="button" className={`btn btn-xs ${selectedAspectRatioType === 'portrait' ? '' : 'btn-outline'}`} onClick={() => changeCropRatio('portrait', 0.8)}>Portrait (4:5)</button>
              <button type="button" className={`btn btn-xs ${selectedAspectRatioType === 'landscape' ? '' : 'btn-outline'}`} onClick={() => changeCropRatio('landscape', 1.777)}>Landscape (16:9)</button>
            </div>

            <div style={{ width: '100%', maxHeight: '350px', overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
              <img ref={imageRef} src={imageSrc} alt="Source" style={{ maxWidth: '100%', display: 'block' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={handleCropCancel}>Cancel</button>
              <button type="button" className="btn" onClick={handleCropSave}>Save Crop</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
