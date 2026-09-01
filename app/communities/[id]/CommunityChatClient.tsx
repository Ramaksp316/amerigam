
'use client';

import { useState, useRef, useEffect } from 'react';
import { sendCommunityMessage } from './actions';
import { Send, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CommunityChatClient({ initialMessages, communityId, currentUserId }: { initialMessages: any[], communityId: string, currentUserId: string }) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const tempId = 'temp-' + Date.now();
    const tempMsg = {
      id: tempId,
      content: inputText,
      senderId: currentUserId,
      createdAt: new Date(),
      sender: {
        id: currentUserId,
        name: 'You',
        username: 'you',
        profilePictureUrl: null
      }
    };

    setMessages(prev => [...prev, tempMsg]);
    setInputText('');
    setIsSending(true);

    try {
      await sendCommunityMessage(communityId, tempMsg.content);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#000' }}>
      <div 
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#71717A', margin: 'auto' }}>
            No messages yet. Be the first to say hi!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', maxWidth: '85%', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  {!isMe && (
                    <Link href={`/user/${msg.sender.id}`} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#27272A', overflow: 'hidden', flexShrink: 0 }}>
                      {msg.sender.profilePictureUrl ? (
                        <img src={msg.sender.profilePictureUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                      ) : (
                        <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#71717A', fontSize: '12px'}}><Users size={14}/></div>
                      )}
                    </Link>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    {!isMe && (
                      <span style={{ fontSize: '11px', color: '#71717A', marginLeft: '4px', marginBottom: '2px' }}>{msg.sender.name}</span>
                    )}
                    <div style={{
                      backgroundColor: isMe ? '#1D9BF0' : '#27272A',
                      color: 'white',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderBottomRightRadius: isMe ? '4px' : '16px',
                      borderBottomLeftRadius: !isMe ? '4px' : '16px',
                      fontSize: '15px',
                      lineHeight: '1.4',
                      wordBreak: 'break-word'
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
      <div style={{ padding: '12px 16px', backgroundColor: '#000', borderTop: '1px solid #27272A' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message the community..."
            style={{
              flex: 1,
              backgroundColor: '#18181B',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 16px',
              color: 'white',
              fontSize: '15px',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || isSending}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: inputText.trim() ? '#1D9BF0' : '#27272A',
              color: inputText.trim() ? 'white' : '#71717A',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              transition: 'background-color 0.2s'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
