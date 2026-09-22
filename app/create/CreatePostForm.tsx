'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { createPost } from './actions';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Grid,
  PlaySquare,
  FileText,
  Plus,
  Pencil,
  User,
  MapPin,
  UserPlus,
  Smile,
  X,
  Search,
  Activity,
  Globe,
  Bell,
  Settings,
  Check
} from 'lucide-react';

export default function CreatePostForm({
  currentUser,
  isReel: initialIsReel = false,
  isStory: initialIsStory = false,
  communityId
}: {
  currentUser: any;
  isReel?: boolean;
  isStory?: boolean;
  communityId?: string;
}) {
  const router = useRouter();

  // Mode: 'post' | 'reel' | 'blog'
  const [postMode, setPostMode] = useState<'post' | 'reel' | 'blog'>(
    initialIsReel ? 'reel' : 'post'
  );
  const [showDropdown, setShowDropdown] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [collaborators, setCollaborators] = useState('');
  const [showCollabInput, setShowCollabInput] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);

  // Advance Setup Toggles
  const [aiLabel, setAiLabel] = useState(false);
  const [hideCounts, setHideCounts] = useState(false);

  // Media States
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg('File size must be under 50MB.');
        return;
      }
      setMediaFile(file);
      if (file.type.startsWith('image/')) {
        setMediaType('image');
        const reader = new FileReader();
        reader.onload = () => setMediaPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
        setMediaPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleClearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter(item => item !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() && !description.trim() && !mediaFile && postMode !== 'blog') {
      setErrorMsg('Please add a title, description, or media.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    let uploadedUrl = '';
    let uploadedType = mediaType || '';

    // Upload media to Supabase storage if file is present
    if (mediaFile) {
      try {
        const fileExt = mediaFile.name.split('.').pop() || 'file';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        setUploadProgress(40);
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
          uploadedUrl = publicUrlData.publicUrl;
        }
      } catch (err: any) {
        setErrorMsg('Media upload failed: ' + (err.message || 'Unknown error'));
        setIsUploading(false);
        return;
      }
    }

    setUploadProgress(75);

    // Build the combined content
    let finalContent = '';
    if (title.trim()) {
      finalContent += `${title.trim()}\n\n`;
    }
    if (description.trim()) {
      finalContent += description.trim();
    }
    if (location.trim()) {
      finalContent += `\n\n📍 ${location.trim()}`;
    }
    if (collaborators.trim()) {
      finalContent += `\n👥 With ${collaborators.trim()}`;
    }

    const actionData = new FormData();
    actionData.append('type', postMode);
    actionData.append('content', finalContent.trim());
    actionData.append('aspectRatio', postMode === 'reel' ? '9:16' : 'original');
    actionData.append('category', postMode === 'reel' ? 'Reel' : (postMode === 'blog' ? 'Blog' : 'Post'));
    actionData.append('tags', JSON.stringify(tags));

    if (uploadedUrl) {
      actionData.append('mediaUrl', uploadedUrl);
      actionData.append('mediaType', uploadedType);
    }

    if (communityId) {
      actionData.append('communityId', communityId);
    }

    try {
      setUploadProgress(100);
      await createPost(actionData);
    } catch (err) {
      // Next.js redirect thrown is normal
    }
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      
      {/* ========================================================
          1. TOP NAVBAR (matching media_1789993907233.png)
         ======================================================== */}
      <header style={{
        height: '60px',
        padding: '0 32px',
        borderBottom: '1px solid #1A1A1E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#000000',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Left: Amerigam Logo */}
        <Link href="/home" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/amerigam-logo-transparent.png"
            alt="Amerigam"
            width={110}
            height={26}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>

        {/* Center: Search pill bar */}
        <div style={{
          width: '420px',
          height: '38px',
          borderRadius: '999px',
          backgroundColor: '#1E1E22',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Search"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              width: '100%',
              outline: 'none'
            }}
          />
          <Search size={16} color="#71717A" />
        </div>

        {/* Right: 4 Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/ranking" style={{ color: '#A1A1AA', display: 'flex' }} title="Activity">
            <Activity size={20} />
          </Link>
          <Link href="/search" style={{ color: '#A1A1AA', display: 'flex' }} title="Explore">
            <Globe size={20} />
          </Link>
          <Link href="/notifications" style={{ color: '#A1A1AA', display: 'flex' }} title="Notifications">
            <Bell size={20} />
          </Link>
          <Link href="/settings" style={{ color: '#A1A1AA', display: 'flex' }} title="Settings">
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* ========================================================
          2. MAIN CONTENT AREA
         ======================================================== */}
      <main style={{
        flex: 1,
        maxWidth: '880px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px 100px 20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#FFFFFF',
          margin: '0 0 16px 0',
          letterSpacing: '-0.4px'
        }}>
          Create
        </h1>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            padding: '10px 16px',
            color: '#F87171',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <div style={{ width: '100%', height: '4px', backgroundColor: '#27272A', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#3B82F6', transition: 'width 0.3s ease' }} />
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          
          {/* Central Modal Card */}
          <div style={{
            backgroundColor: '#161618',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
            overflow: 'hidden'
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {/* Back Arrow Button */}
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  borderRadius: '8px'
                }}
                title="Back"
              >
                <ArrowLeft size={22} strokeWidth={2} />
              </button>

              {/* Right Side: Mode Dropdown + Submit Circular Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                
                {/* Mode Selector Dropdown Button */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      padding: '7px 14px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    {postMode === 'post' && (
                      <>
                        <Grid size={16} />
                        <span>Post</span>
                      </>
                    )}
                    {postMode === 'reel' && (
                      <>
                        <PlaySquare size={16} />
                        <span>Reel</span>
                      </>
                    )}
                    {postMode === 'blog' && (
                      <>
                        <FileText size={16} />
                        <span>Blog</span>
                      </>
                    )}
                    <ChevronDown size={14} color="#9CA3AF" />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '42px',
                      right: 0,
                      backgroundColor: '#202024',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '14px',
                      padding: '6px',
                      minWidth: '140px',
                      zIndex: 100,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
                    }}>
                      <button
                        type="button"
                        onClick={() => { setPostMode('post'); setShowDropdown(false); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: postMode === 'post' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        <Grid size={16} color={postMode === 'post' ? '#3B82F6' : '#9CA3AF'} />
                        <span>Post</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPostMode('reel'); setShowDropdown(false); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: postMode === 'reel' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        <PlaySquare size={16} color={postMode === 'reel' ? '#3B82F6' : '#9CA3AF'} />
                        <span>Reel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setPostMode('blog'); setShowDropdown(false); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: postMode === 'blog' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        <FileText size={16} color={postMode === 'blog' ? '#3B82F6' : '#9CA3AF'} />
                        <span>Blog</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Blue Circular Submit Button with chevron */}
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1D4ED8',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(29, 78, 216, 0.45)',
                    transition: 'transform 0.15s ease'
                  }}
                  title="Share / Next"
                >
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Modal Body: 2 Columns */}
            <div style={{
              padding: '24px',
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start'
            }}>
              
              {/* ========================================================
                  LEFT COLUMN: Media Preview / Dropzone
                 ======================================================== */}
              <div style={{
                flex: '0 0 45%',
                height: '520px',
                backgroundColor: '#1C1C20',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={postMode === 'reel' ? 'video/*' : 'image/*,video/*'}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {/* Top-Right Pencil Edit Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  title="Edit or Change media"
                >
                  <Pencil size={15} color="#D4D4D8" />
                </div>

                {/* Media Content Display */}
                {postMode === 'blog' ? (
                  /* BLOG: Prohibited circle slash icon matching media_1789993906588.png */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                  </div>
                ) : mediaPreview ? (
                  /* Uploaded Media Preview */
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {mediaType === 'video' ? (
                      <video
                        src={mediaPreview}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    {/* Clear Button */}
                    <button
                      type="button"
                      onClick={handleClearMedia}
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                      title="Remove media"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  /* Empty state: Large + and "Select post from computer" */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '24px',
                      textAlign: 'center'
                    }}
                  >
                    <Plus size={52} color="#71717A" strokeWidth={1.2} />
                    <span style={{
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#A1A1AA',
                      fontWeight: 500
                    }}>
                      {postMode === 'reel' ? 'Select reel from computer' : 'Select post from computer'}
                    </span>
                  </div>
                )}

                {/* Bottom-Left: "Tag People" Pill Button */}
                <button
                  type="button"
                  onClick={() => setShowTagModal(!showTagModal)}
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#E4E4E7',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >
                  <User size={14} />
                  <span>Tag People</span>
                </button>

                {/* Tag Modal / Popover */}
                {showTagModal && (
                  <div style={{
                    position: 'absolute',
                    bottom: '54px',
                    left: '16px',
                    backgroundColor: '#202024',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '14px',
                    padding: '12px',
                    width: '260px',
                    zIndex: 20,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.7)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFF' }}>Tag People</span>
                      <X size={14} color="#71717A" style={{ cursor: 'pointer' }} onClick={() => setShowTagModal(false)} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                        style={{
                          flex: 1,
                          background: '#141416',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#FFF',
                          fontSize: '12px',
                          padding: '6px 10px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        style={{
                          background: '#3B82F6',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFF',
                          padding: '6px 10px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    {tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                        {tags.map(t => (
                          <span key={t} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            #{t}
                            <X size={10} style={{ cursor: 'pointer' }} onClick={() => removeTag(t)} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ========================================================
                  RIGHT COLUMN: Details & Advance Setup
                 ======================================================== */}
              <div style={{
                flex: '1',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}>
                
                {/* Details Section Heading */}
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                  Details
                </div>

                {/* Title Box */}
                <div style={{
                  backgroundColor: '#222226',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '10px 16px'
                }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>
                    Title (required)
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value.slice(0, 100))}
                    placeholder="Concert 1"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 600,
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                  <div style={{ fontSize: '10px', color: '#71717A', textAlign: 'right', marginTop: '2px' }}>
                    {title.length}/100
                  </div>
                </div>

                {/* Description Box */}
                <div style={{
                  backgroundColor: '#222226',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '10px 16px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>
                    Description
                  </div>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value.slice(0, 2000))}
                    placeholder={
                      postMode === 'reel'
                        ? 'Share information about Reels to Audiences'
                        : postMode === 'blog'
                        ? 'Share your thoughts, story, or article...'
                        : 'Share information about Reels to Audiences'
                    }
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      minHeight: '130px',
                      outline: 'none',
                      resize: 'none',
                      marginTop: '6px',
                      lineHeight: '1.5'
                    }}
                  />
                  
                  {/* Bottom bar of description */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '6px'
                  }}>
                    <Smile
                      size={18}
                      color="#9CA3AF"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setDescription(prev => prev + ' 😊')}
                      title="Add emoji"
                    />
                    <span style={{ fontSize: '10px', color: '#71717A' }}>
                      {description.length}/2000
                    </span>
                  </div>
                </div>

                {/* Advance Setup Section Heading */}
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                  Advance setup
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* 1. Add Location */}
                  <div>
                    <div
                      onClick={() => setShowLocationInput(!showLocationInput)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '2px 0'
                      }}
                    >
                      <span style={{ fontSize: '13px', color: location ? '#3B82F6' : '#E4E4E7' }}>
                        {location ? `📍 ${location}` : 'Add location'}
                      </span>
                      <MapPin size={16} color="#A1A1AA" />
                    </div>
                    {showLocationInput && (
                      <input
                        type="text"
                        placeholder="Enter location name..."
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#222226',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#FFF',
                          fontSize: '12px',
                          padding: '6px 10px',
                          marginTop: '6px',
                          outline: 'none'
                        }}
                      />
                    )}
                  </div>

                  {/* 2. Add Collaborators */}
                  <div>
                    <div
                      onClick={() => setShowCollabInput(!showCollabInput)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '2px 0'
                      }}
                    >
                      <span style={{ fontSize: '13px', color: collaborators ? '#3B82F6' : '#E4E4E7' }}>
                        {collaborators ? `👥 ${collaborators}` : 'Add collaborators'}
                      </span>
                      <UserPlus size={16} color="#A1A1AA" />
                    </div>
                    {showCollabInput && (
                      <input
                        type="text"
                        placeholder="Add usernames (e.g. @alex, @rahul)..."
                        value={collaborators}
                        onChange={e => setCollaborators(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#222226',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#FFF',
                          fontSize: '12px',
                          padding: '6px 10px',
                          marginTop: '6px',
                          outline: 'none'
                        }}
                      />
                    )}
                  </div>

                  {/* 3. Add AI Label */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '13px', color: '#E4E4E7', fontWeight: 500 }}>
                        Add AI label
                      </span>
                      {/* iOS Toggle */}
                      <div
                        onClick={() => setAiLabel(!aiLabel)}
                        style={{
                          width: '36px',
                          height: '20px',
                          borderRadius: '999px',
                          backgroundColor: aiLabel ? '#3B82F6' : '#3F3F46',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: '2px',
                          left: aiLabel ? '18px' : '2px',
                          transition: 'left 0.2s'
                        }} />
                      </div>
                    </div>
                    <p style={{
                      fontSize: '10.5px',
                      color: '#71717A',
                      lineHeight: '1.4',
                      margin: '3px 0 0 0'
                    }}>
                      We require you to label certain realistic content that's made with AI.
                    </p>
                  </div>

                  {/* 4. Hide Like and View Counts */}
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '13px', color: '#E4E4E7', fontWeight: 500 }}>
                        Hide like and view counts on this post
                      </span>
                      {/* iOS Toggle */}
                      <div
                        onClick={() => setHideCounts(!hideCounts)}
                        style={{
                          width: '36px',
                          height: '20px',
                          borderRadius: '999px',
                          backgroundColor: hideCounts ? '#3B82F6' : '#3F3F46',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: '2px',
                          left: hideCounts ? '18px' : '2px',
                          transition: 'left 0.2s'
                        }} />
                      </div>
                    </div>
                    <p style={{
                      fontSize: '10.5px',
                      color: '#71717A',
                      lineHeight: '1.4',
                      margin: '3px 0 0 0'
                    }}>
                      Only you will see the total number of likes and views on this post. You can change this later by going to the ··· menu at the top of the post. To hide like counts on other people's posts, go to your account settings.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </form>

      </main>

    </div>
  );
}
