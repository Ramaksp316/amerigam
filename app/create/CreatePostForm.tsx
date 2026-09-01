'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { createPost } from './actions';
import { UploadCloud, X, Play, Pause, Image as ImageIcon, Video, Hash } from 'lucide-react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import { useRouter } from 'next/navigation';

export default function CreatePostForm({ currentUser, isReel = false, isStory = false }: { currentUser: any, isReel?: boolean, isStory?: boolean }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasMedia, setHasMedia] = useState(false);
  const [mediaName, setMediaName] = useState('');
  
  // Cropping & Media States
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | typeof NaN>(isReel ? 0.5625 : NaN); // 9:16 for Reels
  const [selectedAspectRatioType, setSelectedAspectRatioType] = useState<string>(isReel ? '9:16' : 'original');

  // Tags & Category
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [category, setCategory] = useState(isReel ? 'Reel' : (isStory ? 'Story' : 'General'));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const supabase = createClient();

  const handleBack = () => {
    if (content.length > 0 || hasMedia) {
      if (confirm('Discard ' + (isStory ? 'story' : (isReel ? 'reel' : 'post')) + '?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaName(file.name);
      if (file.type.startsWith('image/')) {
        setVideoSrc(null);
        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result as string);
          setIsCropping(true);
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMsg('Please upload a valid image file.');
        clearMedia();
      }
    } else {
      clearMedia();
    }
  };

  const clearMedia = () => {
    setHasMedia(false);
    setMediaName('');
    setCroppedBlob(null);
    setCroppedPreview(null);
    setImageSrc(null);
    setVideoSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (isCropping && imageSrc && imageRef.current) {
      if (cropperRef.current) cropperRef.current.destroy();
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
    if (cropperRef.current) cropperRef.current.setAspectRatio(ratioValue);
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
    clearMedia();
  };

  const addTag = () => {
    const tag = currentTag.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setCurrentTag('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');

    if (isReel) {
      setErrorMsg('Reels are disabled currently.');
      setIsUploading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const originalFile = formData.get('media') as File | null;
    
    let mediaFile: File | Blob | null = originalFile;
    if (croppedBlob && mediaName) {
      mediaFile = new File([croppedBlob], mediaName, { type: 'image/jpeg' });
    }
    
    let mediaUrl = '';
    let mediaType = '';

    if (mediaFile && mediaFile.size > 0) {
      if (mediaFile.size > 50 * 1024 * 1024) {
        setErrorMsg('File size must be less than 50MB.');
        setIsUploading(false);
        return;
      }

      const fileName = `${Date.now()}-${mediaName.replace(/[^a-zA-Z0-9.\-_]/g, '') || 'upload'}`;
      
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
    actionData.append('type', 'post');
    actionData.append('content', content);
    actionData.append('aspectRatio', isReel ? '9:16' : selectedAspectRatioType);
    actionData.append('category', category);
    actionData.append('tags', JSON.stringify(tags));
    
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <button type="button" onClick={handleBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
          Cancel
        </button>
        <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>{isReel ? 'Create Reel' : 'Create Post'}</h2>
        <button type="submit" disabled={isUploading || (!content.trim() && !hasMedia)} style={{ 
          background: isUploading || (!content.trim() && !hasMedia) ? 'var(--surface-2)' : 'var(--accent-pink)', 
          color: isUploading || (!content.trim() && !hasMedia) ? 'var(--text-secondary)' : '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '20px',
          fontWeight: 600,
          cursor: isUploading || (!content.trim() && !hasMedia) ? 'not-allowed' : 'pointer'
        }}>
          Publish
        </button>
      </div>

      {/* Account Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {currentUser.profileImage ? <img src={currentUser.profileImage} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{width:'100%', height:'100%', background:'var(--accent-blue)'}}></div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.name}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>@{currentUser.username} • {currentUser.accountType}</span>
        </div>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid #dc2626' }}>
          {errorMsg}
        </div>
      )}

      <div>
        <textarea 
          name="content" 
          className="input-field" 
          placeholder={isReel ? "Write a caption for your reel..." : "What's on your mind?"} 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ resize: 'vertical', minHeight: '100px', fontSize: 'var(--text-md)', border: 'none', background: 'transparent', padding: '0', marginBottom: '16px', boxShadow: 'none' }}
        />
      </div>

      {/* Media Upload / Preview Area */}
      <div>
        {hasMedia ? (
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center' }}>
            {croppedPreview && <img src={croppedPreview} style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }} />}
            {videoSrc && (
              <video src={videoSrc} controls style={{ maxHeight: isReel ? '600px' : '400px', maxWidth: '100%', objectFit: 'contain' }} playsInline preload="metadata" />
            )}
            <button type="button" onClick={clearMedia} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 10 }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative', padding: 'var(--space-6)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', backgroundColor: 'var(--surface-1)', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
              <ImageIcon size={24} color="var(--accent-blue)" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Add a Photo
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              name="media" 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Tags & Category */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          {tags.map(tag => (
            <span key={tag} style={{ background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              #{tag} <X size={12} cursor="pointer" onClick={() => removeTag(tag)} />
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-1)', borderRadius: '8px', padding: '8px 12px', border: '1px solid var(--border-color)' }}>
          <Hash size={18} color="var(--text-secondary)" />
          <input 
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tags (press Enter)" 
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '14px' }}
          />
        </div>
      </div>

      {isUploading && (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
          Uploading... Please wait.
        </div>
      )}

      {/* Cropping Modal */}
      {isCropping && imageSrc && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--surface-1)', borderRadius: '16px', padding: '24px', maxWidth: '550px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Crop Photo</h3>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <button type="button" className={`btn btn-xs ${selectedAspectRatioType === 'original' ? '' : 'btn-outline'}`} onClick={() => changeCropRatio('original', NaN)}>Free</button>
              <button type="button" className={`btn btn-xs ${selectedAspectRatioType === 'square' ? '' : 'btn-outline'}`} onClick={() => changeCropRatio('square', 1)}>1:1</button>
              <button type="button" className={`btn btn-xs ${selectedAspectRatioType === 'portrait' ? '' : 'btn-outline'}`} onClick={() => changeCropRatio('portrait', 0.8)}>4:5</button>
              <button type="button" className={`btn btn-xs ${selectedAspectRatioType === 'landscape' ? '' : 'btn-outline'}`} onClick={() => changeCropRatio('landscape', 1.777)}>16:9</button>
            </div>

            <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
              <img ref={imageRef} src={imageSrc} alt="Source" style={{ maxWidth: '100%', display: 'block' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={handleCropCancel}>Cancel</button>
              <button type="button" className="btn" onClick={handleCropSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
