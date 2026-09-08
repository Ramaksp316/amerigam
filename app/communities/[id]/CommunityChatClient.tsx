
'use client';

import { useState, useRef, useEffect } from 'react';
import { sendCommunityMessage } from './actions';
import { Send, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CommunityChatClient({ initialMessages, communityId, currentUserId }: { initialMessages: any[], communityId: string, currentUserId: string }) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    setIsSending(true);

    const tempId = 'temp-' + Date.now();
    const tempMsg = {
      id: tempId,
      content,
      senderId: currentUserId,
      createdAt: new Date(),
      sender: {
        id: currentUserId,
        name: 'You',
        username: 'you',
        avatarData: null
      }
    };

    setMessages(prev => [...prev, tempMsg]);

    try {
      await sendCommunityMessage(communityId, content);
      router.refresh();
    } catch (err) {
      console.error(err);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000' }}>
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .msg-bubble {
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      <div 
        ref={scrollRef}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#71717A', margin: 'auto', fontFamily: 'var(--font-sans), sans-serif' }}>
            No messages yet. Be the first to say hi!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];
            
            const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId || (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60000);
            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || (new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime() > 5 * 60000);
            
            const showTime = isFirstInGroup && index !== 0 && (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 15 * 60000);

            return (
              <div key={msg.id} className="msg-bubble" style={{ display: 'flex', flexDirection: 'column', marginTop: isFirstInGroup ? '12px' : '0' }}>
                {showTime && (
                  <div style={{ textAlign: 'center', fontSize: '11px', color: '#71717A', margin: '8px 0 12px 0', fontFamily: 'var(--font-sans), sans-serif' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isMe && (
                    <div style={{ width: '28px', flexShrink: 0 }}>
                      {isLastInGroup && (
                        <Link href={`/user/${msg.sender.id}`} style={{ display: 'block', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden' }}>
                          {msg.sender.avatarData ? (
                            <img src={msg.sender.avatarData} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                          ) : (
                            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#71717A', fontSize: '12px'}}><Users size={14}/></div>
                          )}
                        </Link>
                      )}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    {!isMe && isFirstInGroup && (
                      <span style={{ fontSize: '12px', color: '#A1A1AA', marginLeft: '4px', marginBottom: '2px', fontWeight: 500, fontFamily: 'var(--font-sans), sans-serif' }}>{msg.sender.name}</span>
                    )}
                    <div style={{
                      backgroundColor: isMe ? '#1D9BF0' : '#27272A',
                      color: 'white',
                      padding: '10px 14px',
                      borderRadius: isMe 
                        ? `18px ${isFirstInGroup ? '18px' : '4px'} ${isLastInGroup ? '18px' : '4px'} 18px` 
                        : `${isFirstInGroup ? '18px' : '4px'} 18px 18px ${isLastInGroup ? '18px' : '4px'}`,
                      fontSize: '15px',
                      lineHeight: '1.4',
                      wordBreak: 'break-word',
                      fontFamily: 'var(--font-sans), sans-serif'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div style={{ padding: '10px 12px', backgroundColor: '#000', borderTop: '1px solid #18181B', flexShrink: 0 }}>
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <button type="button" style={{ background: 'none', border: 'none', color: '#1D9BF0', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={24} />
          </button>
          
          <div style={{ flexGrow: 1, backgroundColor: '#18181B', borderRadius: '20px', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
            <textarea
              ref={textareaRef}
              value={inputText}
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
          
          <button 
            type="submit" 
            disabled={!inputText.trim() || isSending}
            style={{
              background: 'none',
              border: 'none',
              color: inputText.trim() ? '#1D9BF0' : '#71717A',
              padding: '8px',
              cursor: inputText.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}
