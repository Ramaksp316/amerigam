'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

export default function ChatClient({ 
  myId, 
  partnerId, 
  sendMessageAction 
}: { 
  myId: string, 
  partnerId: string,
  sendMessageAction: (formData: FormData) => Promise<void>
}) {
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [hasText, setHasText] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channelName = `chat-${[myId, partnerId].sort().join('-')}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === partnerId) {
          setPartnerTyping(payload.payload.isTyping);
        }
      })
      .on('broadcast', { event: 'new_message' }, () => {
        router.refresh();
      })
      .subscribe();

    const container = document.getElementById('chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [myId, partnerId, supabase, router]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasText(e.target.value.trim().length > 0);

    if (!channelRef.current) return;

    if (!isTyping) {
      setIsTyping(true);
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: myId, isTyping: true }
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: myId, isTyping: false }
      });
    }, 2000);
  };

  return (
    <div style={{ 
      padding: 'var(--space-3) var(--space-4)', 
      borderTop: '1px solid var(--border-color)', 
      background: 'var(--surface-1)',
      position: 'relative'
    }}>
      
      {partnerTyping && (
        <div style={{ 
          position: 'absolute', top: '-36px', left: 'var(--space-4)',
          background: 'var(--surface-2)', padding: '4px 12px',
          borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)', fontWeight: 600,
          border: '1px solid var(--border-color)'
        }}>
          Typing...
        </div>
      )}

      <form action={async (formData) => {
        setIsTyping(false);
        setHasText(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        channelRef.current?.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: myId, isTyping: false }
        });
        
        await sendMessageAction(formData);
        
        channelRef.current?.send({
          type: 'broadcast',
          event: 'new_message',
          payload: {}
        });

        router.refresh();

        const form = document.getElementById('chat-form') as HTMLFormElement;
        if (form) form.reset();
        
        setTimeout(() => {
          const container = document.getElementById('chat-container');
          if (container) container.scrollTop = container.scrollHeight;
        }, 100);

      }} id="chat-form" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <input type="hidden" name="receiverId" value={partnerId} />
        <input 
          type="text" 
          name="content" 
          className="input-field"
          placeholder="Type a message..." 
          required 
          onChange={handleTyping}
          autoComplete="off"
          style={{ 
            margin: 0, 
            flexGrow: 1, 
            borderRadius: 'var(--radius-full)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--surface-2)'
          }} 
        />
        
        <button 
          type="submit"
          className="btn"
          style={{
            width: '38px', height: '38px', padding: 0,
            borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hasText ? 1 : 0.6,
            flexShrink: 0
          }}
        >
          <Send size={16} style={{ marginLeft: '-1px' }} />
        </button>
      </form>
    </div>
  );
}
