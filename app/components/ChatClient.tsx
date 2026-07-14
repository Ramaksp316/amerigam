'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '../../utils/supabase/client';
import SubmitButton from './SubmitButton';

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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Create a unique channel name based on both IDs sorted to ensure both users join the same channel
    const channelName = `chat-${[myId, partnerId].sort().join('-')}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Subscribe to broadcast events for typing
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === partnerId) {
          setPartnerTyping(payload.payload.isTyping);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [myId, partnerId, supabase]);

  const handleTyping = () => {
    if (!channelRef.current) return;

    if (!isTyping) {
      setIsTyping(true);
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: myId, isTyping: true }
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
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
    <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
      {partnerTyping && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontStyle: 'italic' }}>
          User is typing...
        </div>
      )}
      <form action={async (formData) => {
        // Immediately clear typing state when sent
        setIsTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        channelRef.current?.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: myId, isTyping: false }
        });
        
        await sendMessageAction(formData);
        
        // Reset the form manually since it's a client form with action
        const form = document.getElementById('chat-form') as HTMLFormElement;
        if (form) form.reset();
      }} id="chat-form" style={{ display: 'flex', gap: '10px' }}>
        <input type="hidden" name="receiverId" value={partnerId} />
        <input 
          type="text" 
          name="content" 
          className="input-field"
          placeholder="Type a message..." 
          required 
          onChange={handleTyping}
          style={{ margin: 0, flexGrow: 1 }} 
        />
        <SubmitButton defaultText="Send" pendingText="Sending..." style={{ width: 'auto', padding: '0 30px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }} />
      </form>
    </div>
  );
}
