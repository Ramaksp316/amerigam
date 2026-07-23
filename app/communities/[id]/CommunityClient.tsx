'use client';

import { useState, useRef, useEffect } from 'react';
import { Users, LayoutGrid, ArrowLeft, MessageSquare, CheckSquare, Calendar, Plus, Camera, X, Check, Award } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import ProfilePicture from '../../components/ProfilePicture';
import CommunityAvatar from '../../components/CommunityAvatar';
import CustomVideoPlayer from '../../components/CustomVideoPlayer';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import { updateCommunityAvatar } from './actions';

const playSound = (type: 'send' | 'receive') => {
  if (typeof window === 'undefined') return;
  const audio = new Audio(
    type === 'send' 
      ? 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav' 
      : 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3508e330e.mp3'
  );
  audio.volume = 0.45;
  audio.play().catch(err => console.log('Audio play error:', err));
};

export default function CommunityClient({
  community,
  userId,
  activeTab,
  createPostAction,
  createTaskAction,
  updateTaskAction,
}: {
  community: any;
  userId: string;
  activeTab: string;
  createPostAction: (formData: FormData) => Promise<void>;
  createTaskAction: (formData: FormData) => Promise<void>;
  updateTaskAction: (formData: FormData) => Promise<void>;
}) {
  const [isCropping, setIsCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [communityAvatar, setCommunityAvatar] = useState(community.avatarData || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const channelRef = useRef<any>(null);

  const supabase = createClient();
  const router = useRouter();

  const isCreator = community.creatorId === userId;

  useEffect(() => {
    const channelName = `community-${community.id}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'new_post' }, () => {
        playSound('receive');
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [community.id, supabase, router]);

  const handleAvatarClick = () => {
    if (isCreator) {
      fileInputRef.current?.click();
    }
  };

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

  const handleCropSave = async () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas({
        width: 300,
        height: 300,
      });
      if (canvas) {
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setCommunityAvatar(croppedBase64);
        
        // Save to database
        const formData = new FormData();
        formData.append('communityId', community.id);
        formData.append('avatarData', croppedBase64);
        await updateCommunityAvatar(formData);
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

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      const container = document.getElementById('chat-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [activeTab, community.posts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 'var(--space-4)', 
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        marginBottom: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href="/communities" className="btn-text" style={{ padding: '4px' }} title="Back">
            <ArrowLeft size={20} />
          </Link>
          
          <div style={{ position: 'relative' }}>
            <CommunityAvatar 
              community={{ ...community, avatarData: communityAvatar }} 
              size={54} 
              onClick={isCreator ? handleAvatarClick : undefined}
            />
            {isCreator && (
              <div 
                onClick={handleAvatarClick}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: 'var(--gradient-primary)',
                  borderRadius: '50%',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid var(--surface-1)'
                }}
              >
                <Camera size={10} color="white" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{community.name}</h1>
              <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {community.type === 'FRIEND_GROUP' ? 'Private Group' : 'Public Space'}
              </span>
            </div>
            <p 
              onClick={() => setShowMembersModal(true)} 
              style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', margin: '2px 0 0 0', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}
              className="hover-underline"
            >
              <Users size={12} color="var(--accent-cyan)" /> {community.members.length} Members
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '4px', 
          borderRadius: '12px' 
        }}>
          <Link 
            href={`/communities/${community.id}?tab=chat`} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              textDecoration: 'none', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'chat' ? 'white' : 'var(--text-secondary)',
              background: activeTab === 'chat' ? 'var(--gradient-primary)' : 'transparent',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'chat' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
            }}
          >
            <MessageSquare size={14} /> Chat
          </Link>
          <Link 
            href={`/communities/${community.id}?tab=tasks`} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              textDecoration: 'none', 
              padding: '6px 14px', 
              borderRadius: '8px', 
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'tasks' ? 'white' : 'var(--text-secondary)',
              background: activeTab === 'tasks' ? 'var(--gradient-primary)' : 'transparent',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'tasks' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
            }}
          >
            <CheckSquare size={14} /> Tasks
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Tab: Chat */}
        {activeTab === 'chat' && (
          <div style={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)'
          }}>
            {/* Messages container */}
            <div 
              id="chat-container" 
              style={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                padding: 'var(--space-4)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--space-4)' 
              }}
            >
              {community.posts.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto 0', padding: 'var(--space-8)' }}>
                  <MessageSquare size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>It's quiet here. Say hello to the group!</p>
                </div>
              ) : (
                community.posts.map((post: any, index: number) => {
                  const isMe = post.authorId === userId;
                  return (
                    <div 
                      key={post.id} 
                      className={index === community.posts.length - 1 ? "message-bubble-animate" : ""}
                      style={{ 
                        display: 'flex', 
                        gap: '12px',
                        alignItems: 'flex-start',
                        flexDirection: isMe ? 'row-reverse' : 'row',
                        maxWidth: '85%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Avatar */}
                      {!isMe && (
                        <ProfilePicture user={post.author} size={32} />
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        {/* Sender name */}
                        {!isMe && (
                          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px', marginLeft: '4px' }}>
                            {post.author.name || post.author.username}
                          </span>
                        )}

                        {/* Bubble */}
                        <div style={{ 
                          padding: '10px 14px', 
                          background: isMe 
                            ? 'var(--gradient-primary)' 
                            : 'rgba(255, 255, 255, 0.03)', 
                          border: isMe
                            ? 'none'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-primary)',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                          backdropFilter: isMe ? 'none' : 'blur(5px)'
                        }}>
                          {post.content && (
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.5 }}>
                              {post.content}
                            </div>
                          )}
                          {post.mediaUrl && (
                            <div style={{ marginTop: post.content ? '8px' : '0', borderRadius: '8px', overflow: 'hidden' }}>
                              {post.mediaType === 'image' 
                                ? <img src={post.mediaUrl} style={{ maxWidth: '100%', display: 'block', borderRadius: '6px' }} /> 
                                : <CustomVideoPlayer src={post.mediaUrl} style={{ maxWidth: '100%', display: 'block', borderRadius: '6px' }} />
                              }
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                          {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <div style={{ 
              padding: 'var(--space-3)', 
              borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(10px)'
            }}>
              <form 
                action={async (formData) => {
                  playSound('send');
                  const contentInput = (document.getElementById('group-msg-input') as HTMLInputElement);
                  const content = contentInput?.value || '';
                  
                  await createPostAction(formData);
                  
                  channelRef.current?.send({
                    type: 'broadcast',
                    event: 'new_post',
                    payload: {}
                  });
                  
                  if (contentInput) contentInput.value = '';
                  router.refresh();
                }} 
                style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}
              >
                <input type="hidden" name="communityId" value={community.id} />
                
                {/* Media Attachment */}
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: '50%', alignItems: 'center' }}>
                  <input type="file" name="media" id="media-upload" accept="image/*,video/*" style={{ display: 'none' }} />
                  <label htmlFor="media-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', color: 'var(--accent-cyan)' }} title="Attach Media">
                    <Plus size={18} />
                  </label>
                </div>

                <input 
                  type="text" 
                  name="content" 
                  id="group-msg-input"
                  className="input-field" 
                  placeholder="Message group..." 
                  style={{ margin: 0, flexGrow: 1, borderRadius: '24px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }} 
                  autoComplete="off" 
                />
                
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ borderRadius: '24px', width: 'auto', padding: '10px 24px', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)' }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab: Tasks */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'auto', paddingRight: '4px', flexGrow: 1 }}>
            
            {/* Create Task Glass Form */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              padding: 'var(--space-5)'
            }}>
              <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="var(--accent-purple)" /> Create a Group Task
              </h3>
              
              <form action={createTaskAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <input type="hidden" name="communityId" value={community.id} />
                
                <input 
                  type="text" 
                  name="title" 
                  className="input-field" 
                  placeholder="Task Title (e.g. Draft landing page)" 
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }} 
                  required 
                />
                <textarea 
                  name="description" 
                  className="input-field" 
                  placeholder="Additional task details..." 
                  rows={2} 
                  style={{ resize: 'none', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                ></textarea>
                
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <select 
                    name="assigneeId" 
                    className="input-field" 
                    style={{ flexGrow: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                  >
                    <option value="" style={{ background: 'var(--surface-1)' }}>Unassigned (Open for anyone)</option>
                    {community.members.map((m: any) => (
                      <option key={m.userId} value={m.userId} style={{ background: 'var(--surface-1)' }}>
                        {m.user.name || m.user.username}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="date" 
                    name="deadline" 
                    className="input-field" 
                    style={{ flexGrow: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }} 
                  />
                </div>
                
                <button type="submit" className="btn" style={{ alignSelf: 'flex-start', width: 'auto', padding: '10px 24px', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)' }}>
                  Create Task
                </button>
              </form>
            </div>

            {/* Task list container */}
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {community.tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No tasks assigned in this space yet.</p>
                </div>
              ) : (
                community.tasks.map((task: any) => (
                  <div 
                    key={task.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: 'var(--space-4)', 
                      margin: 0,
                      background: 'rgba(255, 255, 255, 0.01)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      borderLeft: task.status === 'COMPLETED' ? '4px solid var(--success)' : '4px solid var(--accent-purple)'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none', opacity: task.status === 'COMPLETED' ? 0.5 : 1, color: 'var(--text-primary)' }}>
                        {task.title}
                      </h4>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span>Assigned: <strong>{task.assignee ? (task.assignee.name || task.assignee.username) : 'Open'}</strong></span>
                        {task.deadline && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Calendar size={11} /> {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <form action={updateTaskAction}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="communityId" value={community.id} />
                      {task.status === 'PENDING' ? (
                        <>
                          <input type="hidden" name="status" value="COMPLETED" />
                          <button type="submit" className="btn btn-small btn-outline" style={{ borderRadius: '20px' }}>Mark Done</button>
                        </>
                      ) : (
                        <>
                          <input type="hidden" name="status" value="PENDING" />
                          <button type="submit" className="btn btn-small btn-text" style={{ color: 'var(--text-secondary)' }}>Reopen</button>
                        </>
                      )}
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cropper Modal for Group Avatar */}
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
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Crop Group Image</h3>
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

      {/* Members Modal */}
      {showMembersModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 900,
          padding: '20px',
          backdropFilter: 'blur(5px)',
        }}>
          <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Group Members</h3>
              <button onClick={() => setShowMembersModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {community.members.map((member: any) => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ProfilePicture user={member.user} size={38} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {member.user.name || member.user.username || member.user.email}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      @{member.user.username || 'user'}
                    </div>
                  </div>
                  {community.creatorId === member.userId && (
                    <span style={{ fontSize: '9px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: 'var(--accent-purple)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <Award size={10} /> Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
