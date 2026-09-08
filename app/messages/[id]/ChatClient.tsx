'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Plus } from 'lucide-react';
import { sendMessage } from './actions';

export default function ChatClient({ initialMessages, conversationId, currentUserId, partnerId }: any) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isSending) return;
    
    setIsSending(true);
    const content = text;
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Optimistic UI
    const tempId = Date.now().toString();
    setMessages((prev: any) => [...prev, { id: tempId, content, senderId: currentUserId, receiverId: partnerId, createdAt: new Date() }]);

    const res = await sendMessage(conversationId, partnerId, content);
    if (res && res.success) {
      setMessages((prev: any) => prev.map((m: any) => m.id === tempId ? res.message : m));
    } else {
      setMessages((prev: any) => prev.filter((m: any) => m.id !== tempId));
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .msg-bubble {
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      <div ref={scrollRef} style={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {messages.map((msg: any, index: number) => {
          const isMe = msg.senderId === currentUserId;
          const prevMsg = messages[index - 1];
          const nextMsg = messages[index + 1];
          
          const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId || (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60000);
          const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || (new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime() > 5 * 60000);
          
          const showTime = isFirstInGroup;

          return (
            <div key={msg.id} className="msg-bubble" style={{ display: 'flex', flexDirection: 'column', marginTop: isFirstInGroup ? '12px' : '0' }}>
              {showTime && (
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#71717A', margin: '8px 0 12px 0', fontFamily: 'var(--font-sans), sans-serif' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: isMe 
                    ? `18px ${isFirstInGroup ? '18px' : '4px'} ${isLastInGroup ? '18px' : '4px'} 18px` 
                    : `${isFirstInGroup ? '18px' : '4px'} 18px 18px ${isLastInGroup ? '18px' : '4px'}`,
                  backgroundColor: isMe ? '#1D9BF0' : '#27272A',
                  color: 'white',
                  fontSize: '15px',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  fontFamily: 'var(--font-sans), sans-serif'
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '10px 12px', borderTop: '1px solid #18181B', backgroundColor: '#000000', flexShrink: 0 }}>
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <button type="button" style={{ background: 'none', border: 'none', color: '#1D9BF0', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={24} />
          </button>
          
          <div style={{ flexGrow: 1, backgroundColor: '#18181B', borderRadius: '20px', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message..." 
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={true}
              rows={1}
              style={{ 
                width: '100%', 
                backgroundColor: 'transparent', 
                border: 'none', 
                color: 'white', 
                fontSize: '15px', 
                outline: 'none',
                resize: 'none',
                maxHeight: '120px',
                fontFamily: 'var(--font-sans), sans-serif',
                padding: 0,
                margin: 0
              }}
            />
          </div>

          <button type="submit" disabled={!text.trim() || isSending} style={{ background: 'none', border: 'none', color: text.trim() ? '#1D9BF0' : '#71717A', padding: '8px', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={24} />
          </button>
        </form>
      </div>
    </>
  );
}