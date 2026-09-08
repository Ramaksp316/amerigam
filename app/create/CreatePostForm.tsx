'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { createPost } from './actions';
import { X, Image as ImageIcon, Video, Hash } from 'lucide-react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import { useRouter } from 'next/navigation';

export default function CreatePostForm({ currentUser, isReel = false, isStory = false, communityId }: { currentUser: any, isReel?: boolean, isStory?: boolean, communityId?: string }) {
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
  const [aspectRatio, setAspectRatio] = useState<number | typeof NaN>(isReel ? 0.5625 : NaN);
  const [selectedAspectRatioType, setSelectedAspectRatioType] = useState<string>(isReel ? '9:16' : 'original');
  const [showRatioMenu, setShowRatioMenu] = useState(false);

  // Tags & Category
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [category] = useState(isReel ? 'Reel' : (isStory ? 'Story' : 'General'));

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const supabase = createClient();

  const handleBack = () => {
    if (content.length > 0 || hasMedia) {
      if (confirm('Discard post?')) {
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
      } else if (file.type.startsWith('video/')) {
        setImageSrc(null);
        const url = URL.createObjectURL(file);
        setVideoSrc(url);
        setHasMedia(true);
        setCroppedBlob(null);
        setCroppedPreview(null);
      } else {
        setErrorMsg('Please upload a valid image or video file.');
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
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  useEffect(() => {
    if (isCropping && imageSrc && imageRef.current) {
      if (cropperRef.current) cropperRef.current.destroy();
      cropperRef.current = new Cropper(imageRef.current, {
        aspectRatio: aspectRatio,
        viewMode: 1, // Restrict the crop box to not exceed the size of the canvas
        dragMode: 'move',
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        background: false,
        autoCropArea: 1,
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

  const addTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || currentTag).trim().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setCurrentTag('');
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

    let mediaFile: File | Blob | null = null;
    
    if (hasMedia) {
       if (croppedBlob && mediaName) {
         mediaFile = new File([croppedBlob], mediaName, { type: 'image/jpeg' });
       } else if (videoSrc && videoInputRef.current?.files?.[0]) {
         mediaFile = videoInputRef.current.files[0];
       }
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
        setErrorMsg('Failed to upload media. Please try again.');
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
    actionData.append('aspectRatio', selectedAspectRatioType);
    actionData.append('category', category);
    actionData.append('tags', JSON.stringify(tags));
    
    if (mediaUrl) {
      actionData.append('mediaUrl', mediaUrl);
      actionData.append('mediaType', mediaType);
    }

    if (communityId) {
      actionData.append('communityId', communityId);
    }

    try {
      await createPost(actionData);
    } catch (error) {
      // Handled by Next.js redirect
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#000000', color: '#FFFFFF', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ===== HEADER ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button type="button" onClick={handleBack} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '15px', fontWeight: 500, padding: '4px 0' }}>
          Cancel
        </button>
        <h2 style={{ fontSize: '16px', margin: 0, fontWeight: 600 }}>New Post</h2>
        <button type="submit" disabled={isUploading || (!content.trim() && !hasMedia)} style={{ 
          background: isUploading || (!content.trim() && !hasMedia) ? '#1F2937' : '#3B82F6', 
          color: isUploading || (!content.trim() && !hasMedia) ? '#9CA3AF' : '#FFFFFF',
          border: 'none',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: isUploading || (!content.trim() && !hasMedia) ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s'
        }}>
          {isUploading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {/* ===== ACCOUNT IDENTITY ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#27272A', overflow: 'hidden', flexShrink: 0 }}>
          {currentUser.profileImage ? (
             <img src={currentUser.profileImage} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Profile" />
          ) : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1.2 }}>{currentUser.name}</span>
          <span style={{ fontSize: '13px', color: '#71717A', marginTop: '2px' }}>@{currentUser.username}</span>
        </div>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}

      {/* ===== MAIN COMPOSER AREA ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea 
          ref={textareaRef}
          name="content" 
          placeholder="What's on your mind?" 
          value={content}
          onChange={handleTextareaInput}
          style={{ 
            width: '100%', 
            minHeight: '80px', 
            fontSize: '16px', 
            lineHeight: 1.5,
            border: 'none', 
            background: 'transparent', 
            color: '#FFFFFF',
            padding: '0', 
            marginBottom: '16px', 
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit'
          }}
          autoFocus
        />

        {/* Media Preview */}
        {hasMedia && (
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#0A0A0A', border: '1px solid #1A1A1A', marginBottom: '16px' }}>
            {croppedPreview && <img src={croppedPreview} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} alt="Preview" />}
            {videoSrc && (
              <video src={videoSrc} controls style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} playsInline preload="metadata" />
            )}
            <button type="button" onClick={clearMedia} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Selected Topics */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {tags.map(tag => (
              <span key={tag} style={{ background: '#1A1A1A', color: '#3B82F6', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                #{tag} <X size={14} cursor="pointer" onClick={() => removeTag(tag)} style={{ color: '#71717A' }} />
              </span>
            ))}
          </div>
        )}
        
        {/* Inline Topic Selector */}
        {showTagInput && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#0A0A0A', borderRadius: '12px', border: '1px solid #1A1A1A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Hash size={16} color="#71717A" />
              <input 
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a topic..." 
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF', width: '100%', fontSize: '14px' }}
                autoFocus
              />
              <button type="button" onClick={() => setShowTagInput(false)} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>
            
            {/* Suggested topics */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Startup', 'Design', 'Engineering', 'Photography', 'Business', 'AI', 'Coding', 'Football'].map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  style={{ background: '#1A1A1A', border: 'none', color: '#A1A1AA', padding: '6px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}
                >
                  +{suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== CREATION TOOLBAR ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '12px 0', borderTop: '1px solid #1A1A1A', marginTop: 'auto' }}>
        <input 
          type="file" 
          ref={imageInputRef}
          accept="image/*" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input 
          type="file" 
          ref={videoInputRef}
          accept="video/*" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button type="button" onClick={() => imageInputRef.current?.click()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#A1A1AA' }}>
          <ImageIcon size={24} />
        </button>
        <button type="button" onClick={() => videoInputRef.current?.click()} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#A1A1AA' }}>
          <Video size={24} />
        </button>
        <button type="button" onClick={() => setShowTagInput(!showTagInput)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: showTagInput ? '#3B82F6' : '#A1A1AA' }}>
          <Hash size={24} />
        </button>
      </div>

      {/* ===== CROPPING MODAL ===== */}
      {isCropping && imageSrc && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000000', display: 'flex', flexDirection: 'column', zIndex: 99999, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <button type="button" onClick={handleCropCancel} style={{ fontFamily: 'inherit', background: 'none', border: 'none', color: '#FFFFFF', fontSize: '15px', padding: 0 }}>Cancel</button>
            
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                onClick={() => setShowRatioMenu(!showRatioMenu)} 
                style={{ fontFamily: 'inherit', background: 'none', border: 'none', color: '#FFFFFF', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                {selectedAspectRatioType === 'original' ? 'Free (Custom)' : selectedAspectRatioType}
                <span style={{ fontSize: '10px' }}>▼</span>
              </button>

              {showRatioMenu && (
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', background: '#1A1A1A', border: '1px solid #27272A', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: '140px', zIndex: 100, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
                  <button type="button" onClick={() => { changeCropRatio('original', NaN); setShowRatioMenu(false); }} style={{ fontFamily: 'inherit', background: selectedAspectRatioType === 'original' ? '#27272A' : 'transparent', color: '#FFF', border: 'none', padding: '12px 16px', fontSize: '14px', textAlign: 'center', borderBottom: '1px solid #27272A' }}>Free (Custom)</button>
                  <button type="button" onClick={() => { changeCropRatio('1:1', 1); setShowRatioMenu(false); }} style={{ fontFamily: 'inherit', background: selectedAspectRatioType === '1:1' ? '#27272A' : 'transparent', color: '#FFF', border: 'none', padding: '12px 16px', fontSize: '14px', textAlign: 'center', borderBottom: '1px solid #27272A' }}>1:1</button>
                  <button type="button" onClick={() => { changeCropRatio('4:5', 0.8); setShowRatioMenu(false); }} style={{ fontFamily: 'inherit', background: selectedAspectRatioType === '4:5' ? '#27272A' : 'transparent', color: '#FFF', border: 'none', padding: '12px 16px', fontSize: '14px', textAlign: 'center', borderBottom: '1px solid #27272A' }}>4:5</button>
                  <button type="button" onClick={() => { changeCropRatio('9:16', 0.5625); setShowRatioMenu(false); }} style={{ fontFamily: 'inherit', background: selectedAspectRatioType === '9:16' ? '#27272A' : 'transparent', color: '#FFF', border: 'none', padding: '12px 16px', fontSize: '14px', textAlign: 'center', borderBottom: '1px solid #27272A' }}>9:16</button>
                  <button type="button" onClick={() => { changeCropRatio('16:9', 1.777); setShowRatioMenu(false); }} style={{ fontFamily: 'inherit', background: selectedAspectRatioType === '16:9' ? '#27272A' : 'transparent', color: '#FFF', border: 'none', padding: '12px 16px', fontSize: '14px', textAlign: 'center' }}>16:9</button>
                </div>
              )}
            </div>

            <button type="button" onClick={handleCropSave} style={{ fontFamily: 'inherit', background: 'none', border: 'none', color: '#3B82F6', fontSize: '15px', fontWeight: 600, padding: 0 }}>Done</button>
          </div>
          
          <div style={{ flex: 1, position: 'relative', background: '#000', overflow: 'hidden', paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
            <div style={{ position: 'absolute', top: 16, bottom: 40, left: 16, right: 16 }}>
              <img ref={imageRef} src={imageSrc} alt="Source" style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
