'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Check, X, Upload } from 'lucide-react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';

interface AvatarCropUploadProps {
  currentImageUrl?: string;
  onImageReady: (base64: string) => void;
  size?: number;
  placeholder?: string;
  label?: string;
}

export default function AvatarCropUpload({ 
  currentImageUrl, 
  onImageReady, 
  size = 96, 
  placeholder = '📷',
  label = 'Add profile photo'
}: AvatarCropUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be less than 10MB');
        return;
      }
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
        autoCropArea: 0.85,
        responsive: true,
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
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewUrl(base64);
        onImageReady(base64);
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
    <>
      <label 
        onClick={() => fileInputRef.current?.click()}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <div style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          background: previewUrl ? 'transparent' : 'rgba(255,255,255,0.06)', 
          border: previewUrl ? '3px solid var(--accent-primary)' : '2px dashed rgba(255,255,255,0.2)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}>
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
                <Camera size={24} color="white" />
              </div>
            </>
          ) : (
            <span style={{ fontSize: size * 0.35 }}>{placeholder}</span>
          )}
        </div>
        <span style={{ fontSize: '13px', color: '#71717A' }}>
          {previewUrl ? 'Tap to change' : label}
        </span>
      </label>
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {/* Crop Modal */}
      {isCropping && imageSrc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: '#111',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '20px',
            maxWidth: '420px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Crop Profile Photo</h3>
              <button onClick={handleCropCancel} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}>
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
                alt="Crop" 
                style={{ maxWidth: '100%', display: 'block' }} 
              />
            </div>

            <p style={{ margin: 0, textAlign: 'center', fontSize: '12px', color: '#71717A' }}>
              Drag to reposition • Pinch to zoom
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={handleCropCancel} 
                style={{ 
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', color: '#9CA3AF', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                <X size={16} /> Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCropSave} 
                style={{ 
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '12px', background: '#3B82F6', border: 'none',
                  borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                <Check size={16} /> Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
