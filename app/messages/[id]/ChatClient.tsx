'use client';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { sendMessage } from './actions';

export default function ChatClient({ initialMessages, conversationId, currentUserId, partnerId }: any) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;
    
    setIsSending(true);
    const content = text;
    setText('');
    
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

  return (
    <>
      <div ref={scrollRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((msg: any) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                backgroundColor: isMe ? '#1D9BF0' : '#27272A',
                color: 'white',
                fontSize: '15px',
                lineHeight: 1.4,
                wordBreak: 'break-word'
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #27272A', backgroundColor: '#18181B' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message..." 
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={true}
            style={{ flexGrow: 1, backgroundColor: '#27272A', border: 'none', borderRadius: '24px', padding: '12px 16px', color: 'white', fontSize: '15px', outline: 'none' }}
          />
          <button type="submit" disabled={!text.trim() || isSending} style={{ background: 'transparent', border: 'none', color: text.trim() ? '#1D9BF0' : '#71717A', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={24} />
          </button>
        </form>
      </div>
    </>
  );
}