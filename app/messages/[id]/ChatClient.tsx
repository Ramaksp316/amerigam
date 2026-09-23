'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Plus,
  ChevronLeft,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Type,
  LayoutGrid,
} from 'lucide-react';
import ProfilePicture from '../../components/ProfilePicture';
import { sendMessage, getLatestMessages } from './actions';

interface MessageItem {
  id: string;
  content: string;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  // Real-time polling every 4 seconds
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
      } catch (err) {
        // silent
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        100
      )}px`;
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = text.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const tempId = 'temp-' + Date.now();
    const optimisticMsg: MessageItem = {
      id: tempId,
      content,
      senderId: currentUserId,
      receiverId: partner.id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendMessage(conversationId, partner.id, content);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div
      className="messages-card-shell"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#16171B',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Header matching Figma 16.png */}
      <div
        className="messages-chat-header"
        style={{
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(22, 23, 27, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}
      >
        <div
          className="messages-header-user-group"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}
        >
          {/* Mobile Back Button */}
          <Link
            href="/messages"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              textDecoration: 'none',
              marginRight: '2px',
              flexShrink: 0
            }}
          >
            <ChevronLeft size={20} />
          </Link>

          {/* Red Status Dot matching Figma 16.png */}
          <div
            className="messages-red-status-dot"
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
              flexShrink: 0
            }}
          />

          {/* Partner Avatar */}
          <Link href={`/user/${partner.id}`} style={{ flexShrink: 0 }}>
            <ProfilePicture user={partner} size={40} showStatus={false} />
          </Link>

          {/* Partner Name & Handle */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Link
              href={`/user/${partner.id}`}
              className="messages-chat-title"
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#FFFFFF',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'inherit'
              }}
            >
              {partner.name || partner.username}
            </Link>
            <span
              className="messages-chat-handle"
              style={{ fontSize: '12px', color: '#8E8E93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              @{partner.username}
            </span>
          </div>
        </div>

        {/* View Profile Action */}
        <Link
          href={`/user/${partner.id}`}
          style={{
            fontSize: '12px',
            color: '#1D9BF0',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(29, 155, 240, 0.1)',
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          Profile
        </Link>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="messages-chat-body"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
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
            <ProfilePicture user={partner} size={56} showStatus={false} />
            <h4 style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '16px', margin: '14px 0 4px 0' }}>
              Say hello to {partner.name || partner.username}!
            </h4>
            <p style={{ color: '#8E8E93', fontSize: '13px', maxWidth: '300px', margin: 0 }}>
              This is the beginning of your direct conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

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
                {!isMe ? (
                  /* Incoming Message (Partner) matching Figma 16.png */
                  <div
                    className="messages-bubble-incoming-row"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      maxWidth: '75%'
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      <ProfilePicture user={partner} size={32} showStatus={false} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        className="messages-bubble-incoming-content"
                        style={{
                          backgroundColor: '#24262B',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '20px',
                          padding: '10px 16px',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <div
                          className="messages-bubble-handle-tag"
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#38BDF8',
                            marginBottom: '2px'
                          }}
                        >
                          @{partner.username}
                        </div>
                        <div
                          className="messages-bubble-text"
                          style={{
                            fontSize: '14px',
                            lineHeight: 1.5,
                            color: '#F4F4F5',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                      <span
                        className="messages-bubble-timestamp"
                        style={{
                          fontSize: '10px',
                          color: '#71717A',
                          marginTop: '4px',
                          marginLeft: '8px'
                        }}
                      >
                        {timeStr}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Outgoing Message (Current User) matching Figma 16.png */
                  <div
                    className="messages-bubble-outgoing-row"
                    style={{
                      alignSelf: 'flex-end',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      maxWidth: '75%'
                    }}
                  >
                    <div
                      className="messages-bubble-outgoing-content"
                      style={{
                        backgroundColor: '#0284C7',
                        borderRadius: '20px',
                        padding: '10px 16px',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)'
                      }}
                    >
                      <div
                        className="messages-bubble-text"
                        style={{
                          fontSize: '14px',
                          lineHeight: 1.5,
                          color: '#FFFFFF',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                    <span
                      className="messages-bubble-timestamp"
                      style={{
                        fontSize: '10px',
                        color: '#71717A',
                        marginTop: '4px',
                        marginRight: '8px'
                      }}
                    >
                      {timeStr}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#202227',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto'
          }}
        >
          {['👋', '🔥', '👏', '🚀', '❤️', '😂', '👍', '✨', '🎯', '💯', '🙌'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              style={{
                fontSize: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat Footer / Input Bar matching Figma 16.png */}
      <div
        className="messages-chat-input-bar"
        style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#16171B',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}
      >
        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%'
          }}
        >
          {/* Green circular apps button matching Figma 16 */}
          <button
            type="button"
            title="Apps & Tools"
            className="messages-action-green-btn"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              color: '#000000',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }}
          >
            <LayoutGrid size={17} strokeWidth={2.4} />
          </button>

          {/* Plus (+) circle button matching Figma 16 */}
          <button
            type="button"
            title="Attach Media"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="messages-plus-circle-btn"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Plus size={18} strokeWidth={2.2} />
          </button>

          {/* Pill Input Container matching Figma 16 */}
          <div
            className="messages-input-pill"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#202227',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              padding: '4px 14px 4px 18px',
              gap: '10px',
              boxSizing: 'border-box'
            }}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="messages-input-field"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                padding: '7px 0',
                lineHeight: 1.4,
                maxHeight: '100px'
              }}
            />

            {/* Utility action icons cluster matching Figma 16 */}
            <div
              className="messages-input-icons-group"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#8E8E93'
              }}
            >
              <button
                type="button"
                title="Formatting"
                className="messages-input-icon-btn"
                style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
              >
                <Type size={16} />
              </button>
              <button
                type="button"
                title="Emoji"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="messages-input-icon-btn"
                style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
              >
                <Smile size={16} />
              </button>
              <button
                type="button"
                title="Stickers"
                className="messages-input-icon-btn"
                style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
              >
                <ImageIcon size={16} />
              </button>
              <button
                type="button"
                title="Attach file"
                className="messages-input-icon-btn"
                style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
              >
                <Paperclip size={16} />
              </button>
              <button
                type="button"
                title="Voice note"
                className="messages-input-icon-btn"
                style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}
              >
                <Mic size={16} />
              </button>
            </div>
          </div>

          {/* Send Button matching Figma 16 (Paper plane circle) */}
          <button
            type="submit"
            disabled={!text.trim() || isSending}
            title="Send"
            className={`messages-send-circle-btn ${text.trim() ? 'active' : ''}`}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: text.trim() ? 'pointer' : 'default',
              flexShrink: 0,
              backgroundColor: text.trim() ? '#0284C7' : '#24262B',
              color: text.trim() ? '#FFFFFF' : '#71717A',
              boxShadow: text.trim() ? '0 4px 16px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={18} style={{ transform: 'translateX(1px)' }} />
          </button>
        </form>
      </div>
    </div>
  );
}