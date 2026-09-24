'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Plus,
  ArrowLeft,
  Smile,
  Image as ImageIcon,
  Mic,
  Type,
  Upload,
  X,
  Check,
  Film,
  Paperclip
} from 'lucide-react';
import ProfilePicture from '../../components/ProfilePicture';
import ImageLightbox from '../../components/ImageLightbox';
import VoiceMessagePlayer from '../VoiceMessagePlayer';
import EmojiPickerPopover from '../EmojiPickerPopover';
import StickersPopover from '../StickersPopover';
import { sendMessage, getLatestMessages } from './actions';

interface MessageItem {
  id: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  voiceDuration?: number | null;
  senderId: string;
  receiverId: string;
  createdAt: string | Date;
  isRead?: boolean;
}

export default function ChatClient({
  initialMessages = [],
  conversationId,
  currentUserId,
  partner,
}: {
  initialMessages: MessageItem[];
  conversationId: string;
  currentUserId: string;
  partner: {
    id: string;
    name: string | null;
    username: string;
    avatarData: string | null;
    status?: string;
  };
}) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Popover toggles
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const latest = await getLatestMessages(conversationId, 60);
        if (latest && latest.length > 0) {
          setMessages((prev) => {
            if (
              latest.length !== prev.length ||
              latest[latest.length - 1].id !== prev[prev.length - 1]?.id
            ) {
              return latest as MessageItem[];
            }
            return prev;
          });
        }
      } catch {
        // silent
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // Input autosize
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  // Close popovers on click outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setShowEmojiPicker(false);
      setShowStickerPicker(false);
      setShowPlusMenu(false);
    };
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  // Handle File Selection (Photo / Video)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setFilePreviewUrl(preview);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
  };

  // Upload File Helper
  const uploadMediaFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const isVideo = file.type.startsWith('video');
      formData.append('folder', isVideo ? 'videos' : 'posts');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch (err) {
      console.error('File upload failed:', err);
      return null;
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone permission denied or not supported:', err);
      alert('Microphone access is required to record voice messages.');
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const finishAndSendVoice = async () => {
    if (!mediaRecorderRef.current) return;

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const duration = recordingTime;

    mediaRecorderRef.current.onstop = async () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });

      setIsUploading(true);
      const audioUrl = await uploadMediaFile(audioFile);
      setIsUploading(false);

      if (audioUrl) {
        const tempId = 'temp-voice-' + Date.now();
        const optimisticMsg: MessageItem = {
          id: tempId,
          content: '🎙️ Voice message',
          mediaUrl: audioUrl,
          mediaType: 'voice',
          voiceDuration: duration,
          senderId: currentUserId,
          receiverId: partner.id,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMsg]);

        try {
          const res = await sendMessage(
            conversationId,
            partner.id,
            '',
            audioUrl,
            'voice',
            duration
          );
          if (res && res.success && res.message) {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? (res.message as MessageItem) : m))
            );
          }
        } catch {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
      }

      setIsRecording(false);
      setRecordingTime(0);
      audioChunksRef.current = [];
    };

    mediaRecorderRef.current.stop();
  };

  // Main Send Action (Text / Image / Video)
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = text.trim();
    if ((!content && !selectedFile) || isSending || isUploading) return;

    setIsSending(true);

    let uploadedUrl: string | null = null;
    let uploadedType: string | null = null;

    if (selectedFile) {
      setIsUploading(true);
      uploadedUrl = await uploadMediaFile(selectedFile);
      uploadedType = selectedFile.type.startsWith('video') ? 'video' : 'image';
      setIsUploading(false);
      removeSelectedFile();
    }

    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const tempId = 'temp-' + Date.now();
    const optimisticMsg: MessageItem = {
      id: tempId,
      content: content || (uploadedType === 'video' ? '📹 Video' : '📷 Photo'),
      mediaUrl: uploadedUrl,
      mediaType: uploadedType,
      senderId: currentUserId,
      receiverId: partner.id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendMessage(
        conversationId,
        partner.id,
        content,
        uploadedUrl,
        uploadedType
      );
      if (res && res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (res.message as MessageItem) : m))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  // Send Sticker / GIF
  const handleSendSticker = async (stickerUrl: string) => {
    setShowStickerPicker(false);
    const tempId = 'temp-stk-' + Date.now();
    const optimisticMsg: MessageItem = {
      id: tempId,
      content: '🎴 Sticker',
      mediaUrl: stickerUrl,
      mediaType: 'sticker',
      senderId: currentUserId,
      receiverId: partner.id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendMessage(
        conversationId,
        partner.id,
        '',
        stickerUrl,
        'sticker'
      );
      if (res && res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (res.message as MessageItem) : m))
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const toggleFormatting = () => {
    if (!text) {
      setText('*bold text*');
    } else {
      setText((prev) => `*${prev}*`);
    }
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#16171B',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Hidden File Input for Image/Video Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Header matching Normal message 2.png */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#16171B',
          flexShrink: 0
        }}
      >
        {/* Back Arrow Button */}
        <Link
          href="/messages"
          title="Back to messages"
          style={{
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            padding: '4px',
            borderRadius: '50%',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft size={22} />
        </Link>

        {/* Partner Avatar (Circular) */}
        <Link href={`/user/${partner.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#27272A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ProfilePicture user={partner} size={42} showStatus={false} />
          </div>
        </Link>

        {/* Partner Name matching Normal message 2.png */}
        <Link
          href={`/user/${partner.id}`}
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#FFFFFF',
            textDecoration: 'none',
            letterSpacing: '-0.2px'
          }}
        >
          {partner.name || partner.username}
        </Link>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box'
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              padding: '40px 16px'
            }}
          >
            <ProfilePicture user={partner} size={64} showStatus={false} />
            <h4 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '17px', margin: '16px 0 4px 0' }}>
              {partner.name || partner.username}
            </h4>
            <p style={{ color: '#8E8E93', fontSize: '13px', maxWidth: '300px', margin: 0 }}>
              No messages here yet. Send a message to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const isSticker = msg.mediaType === 'sticker';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                {/* Sticker rendering without bubble background */}
                {isSticker && msg.mediaUrl ? (
                  <div style={{ maxWidth: '180px', maxHeight: '180px', margin: '4px 0' }}>
                    <img
                      src={msg.mediaUrl}
                      alt="Sticker"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  /* Standard / Media Message Bubble matching Normal message 2.png */
                  <div
                    style={{
                      maxWidth: '70%',
                      backgroundColor: isMe ? '#0284C7' : '#24262B',
                      color: '#FFFFFF',
                      borderRadius: isMe ? '22px 22px 4px 22px' : '22px 22px 22px 4px',
                      padding: msg.mediaUrl && !msg.voiceDuration ? '8px' : '10px 18px',
                      boxShadow: isMe ? '0 4px 16px rgba(2, 132, 199, 0.35)' : '0 4px 12px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {/* Image Attachment */}
                    {msg.mediaType === 'image' && msg.mediaUrl && (
                      <div
                        style={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          maxWidth: '300px',
                          maxHeight: '340px',
                          backgroundColor: '#000000'
                        }}
                      >
                        <ImageLightbox src={msg.mediaUrl} alt="Photo" />
                      </div>
                    )}

                    {/* Video Attachment */}
                    {msg.mediaType === 'video' && msg.mediaUrl && (
                      <div
                        style={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          maxWidth: '320px',
                          maxHeight: '360px',
                          backgroundColor: '#000000'
                        }}
                      >
                        <video
                          src={msg.mediaUrl}
                          controls
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    {/* Voice Note Player */}
                    {msg.mediaType === 'voice' && msg.mediaUrl && (
                      <VoiceMessagePlayer
                        src={msg.mediaUrl}
                        duration={msg.voiceDuration}
                        isMe={isMe}
                      />
                    )}

                    {/* Text Content */}
                    {msg.content && msg.mediaType !== 'voice' && (!msg.mediaUrl || msg.content !== '📷 Photo') && (
                      <div
                        style={{
                          fontSize: '14px',
                          lineHeight: 1.45,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          padding: msg.mediaUrl ? '4px 6px' : 0
                        }}
                      >
                        {msg.content}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Popovers */}
      {showEmojiPicker && (
        <EmojiPickerPopover
          onSelect={addEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {showStickerPicker && (
        <StickersPopover
          onSelectSticker={handleSendSticker}
          onClose={() => setShowStickerPicker(false)}
        />
      )}

      {/* Selected File Preview Strip */}
      {selectedFile && filePreviewUrl && (
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: '#1E2026',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {selectedFile.type.startsWith('video') ? (
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Film size={22} color="#FFFFFF" />
              </div>
            ) : (
              <img
                src={filePreviewUrl}
                alt="Preview"
                style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedFile.name}
              </span>
              <span style={{ fontSize: '11px', color: '#8E8E93' }}>
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={removeSelectedFile}
            title="Remove attachment"
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Chat Footer / Input Bar matching Normal message 2.png EXACTLY */}
      <div
        style={{
          padding: '16px 24px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#16171B',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}
      >
        {/* 1. Circular (+) Button on the Left */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPlusMenu(!showPlusMenu);
          }}
          title="Attachments"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#1E2026',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'transform 0.15s ease, background-color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#272932';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1E2026';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus size={20} />
        </button>

        {/* Plus Action Drawer Popup */}
        {showPlusMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '24px',
              backgroundColor: '#1E2026',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '16px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
              zIndex: 100,
              minWidth: '180px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setShowPlusMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Upload size={16} color="#38BDF8" />
              <span>Upload Photo / Video</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowStickerPicker(true);
                setShowPlusMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ImageIcon size={16} color="#F59E0B" />
              <span>Send Sticker / GIF</span>
            </button>
          </div>
        )}

        {/* 2. Middle Input Pill matching Normal message 2.png */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#1E2026',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '4px 14px 4px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxSizing: 'border-box',
            minHeight: '44px',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          {/* If Recording Voice */}
          {isRecording ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  animation: 'pulse 1s infinite'
                }}
              />
              <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600 }}>
                Recording voice... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={cancelRecording}
                  title="Cancel recording"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8E8E93',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
                <button
                  type="button"
                  onClick={finishAndSendVoice}
                  title="Send voice note"
                  style={{
                    backgroundColor: '#10B981',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          ) : (
            /* Normal Text Input */
            <>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="History is on"
                rows={1}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none',
                  padding: '9px 0',
                  lineHeight: 1.4,
                  maxHeight: '90px'
                }}
              />

              {/* Action Icons Cluster inside Pill matching Normal message 2.png */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8E8E93' }}>
                {/* 1. Format / A icon */}
                <button
                  type="button"
                  onClick={toggleFormatting}
                  title="Format text (*bold*)"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8E8E93',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
                >
                  <span style={{ fontSize: '15px', fontWeight: 700, textDecoration: 'underline' }}>A</span>
                </button>

                {/* 2. Emoji Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowStickerPicker(false);
                  }}
                  title="Add emoji"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: showEmojiPicker ? '#FFFFFF' : '#8E8E93',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => {
                    if (!showEmojiPicker) e.currentTarget.style.color = '#8E8E93';
                  }}
                >
                  <Smile size={18} />
                </button>

                {/* 3. Sticker / Giphy Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStickerPicker(!showStickerPicker);
                    setShowEmojiPicker(false);
                  }}
                  title="Stickers & GIFs"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: showStickerPicker ? '#FFFFFF' : '#8E8E93',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => {
                    if (!showStickerPicker) e.currentTarget.style.color = '#8E8E93';
                  }}
                >
                  <ImageIcon size={18} />
                </button>

                {/* 4. Upload Icon (Photo / Video) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload JPEG/Photo or Video"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: selectedFile ? '#38BDF8' : '#8E8E93',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => {
                    if (!selectedFile) e.currentTarget.style.color = '#8E8E93';
                  }}
                >
                  <Upload size={18} />
                </button>

                {/* 5. Microphone Voice Note Icon */}
                <button
                  type="button"
                  onClick={startRecording}
                  title="Record voice message"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8E8E93',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#8E8E93')}
                >
                  <Mic size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 3. Send Button on the Right matching Normal message 2.png */}
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={(!text.trim() && !selectedFile) || isSending || isUploading}
          title="Send"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: text.trim() || selectedFile ? '#0284C7' : '#1E2026',
            color: text.trim() || selectedFile ? '#FFFFFF' : '#71717A',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: text.trim() || selectedFile ? 'pointer' : 'default',
            flexShrink: 0,
            boxShadow: text.trim() || selectedFile ? '0 4px 16px rgba(2, 132, 199, 0.45)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Send size={18} style={{ transform: 'translateX(1px)' }} />
        </button>
      </div>
    </div>
  );
}