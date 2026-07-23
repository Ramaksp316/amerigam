'use client';

import { useState, useEffect, useRef } from 'react';
import LocalTime from './LocalTime';
import { Pencil, Trash2, X, Check } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  isEdited: boolean;
};

export default function MessageList({
  messages,
  myId,
  partnerId,
  deleteAction,
  editAction,
}: {
  messages: Message[];
  myId: string;
  partnerId: string;
  deleteAction: (formData: FormData) => Promise<void>;
  editAction: (formData: FormData) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const now = new Date().getTime();
  const THREE_HOURS = 3 * 60 * 60 * 1000;

  if (messages.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'var(--space-8)', fontSize: 'var(--text-sm)' }}>
        No messages yet. Say hi!
      </p>
    );
  }

  return (
    <>
      {messages.map((msg) => {
        const isMe = msg.senderId === myId;
        const msgTime = new Date(msg.createdAt).getTime();
        const canEditDelete = isMe && (now - msgTime < THREE_HOURS);
        const isEditing = editingId === msg.id;

        return (
          <div key={msg.id} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: isMe ? 'flex-end' : 'flex-start',
            position: 'relative'
          }} className="message-item-container">
            
            {isEditing ? (
              <form action={async (formData) => {
                await editAction(formData);
                setEditingId(null);
              }} style={{ width: '100%', maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <input type="hidden" name="messageId" value={msg.id} />
                <textarea 
                  name="content" 
                  value={editContent} 
                  onChange={(e) => setEditContent(e.target.value)} 
                  className="input-field" 
                  style={{ minHeight: '60px', padding: 'var(--space-2)' }} 
                  autoFocus 
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                  <button type="button" onClick={() => setEditingId(null)} className="btn btn-outline btn-small" style={{ padding: '4px 8px' }}>
                    <X size={14} /> Cancel
                  </button>
                  <button type="submit" className="btn btn-small" style={{ padding: '4px 8px' }}>
                    <Check size={14} /> Save
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', maxWidth: '100%', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <div style={{ 
                  maxWidth: '75vw',
                  padding: msg.content.includes('giphy.com/media') ? '0' : 'var(--space-2) var(--space-4)', 
                  background: msg.content.includes('giphy.com/media') ? 'transparent' : (isMe ? 'var(--gradient-primary)' : 'var(--surface-2)'), 
                  color: isMe ? '#FFFFFF' : 'var(--text-primary)',
                  borderRadius: msg.content.includes('giphy.com/media') ? '8px' : (isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'),
                  fontSize: 'var(--text-sm)',
                  lineHeight: '1.4',
                  boxShadow: (isMe && !msg.content.includes('giphy.com/media')) ? 'var(--shadow-sm)' : 'none',
                  wordBreak: 'break-word',
                  overflow: 'hidden'
                }}>
                  {msg.content.includes('giphy.com/media') ? (
                    <img src={msg.content} alt="GIF" style={{ maxWidth: '250px', borderRadius: '8px' }} />
                  ) : (
                    msg.content
                  )}
                </div>

                {canEditDelete && (
                  <div style={{ display: 'flex', gap: '4px', opacity: 0.7 }} className="message-actions">
                    <button 
                      onClick={() => { setEditingId(msg.id); setEditContent(msg.content); }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      title="Edit Message"
                    >
                      <Pencil size={14} />
                    </button>
                    <form action={deleteAction} style={{ margin: 0, padding: 0 }}>
                      <input type="hidden" name="messageId" value={msg.id} />
                      <button 
                        type="submit" 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                        title="Delete Message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
            
            {!isEditing && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px', padding: '0 4px', display: 'flex', gap: '4px' }}>
                <LocalTime date={msg.createdAt} format="time" />
                {msg.isEdited && <span>(edited)</span>}
              </div>
            )}
          </div>
        );
      })}
      
      <div ref={endOfMessagesRef} />

      <style dangerouslySetInnerHTML={{__html: `
        .message-actions { opacity: 0; transition: opacity 0.2s; }
        .message-item-container:hover .message-actions { opacity: 1; }
      `}} />
    </>
  );
}
