'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '../../utils/supabase/client';
import SubmitButton from './SubmitButton';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    // Create a unique channel name based on both IDs sorted to ensure both users join the same channel
    const channelName = `chat-${[myId, partnerId].sort().join('-')}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Subscribe to broadcast events for typing and new messages
    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === partnerId) {
          setPartnerTyping(payload.payload.isTyping);
        }
      })
      .on('broadcast', { event: 'new_message' }, () => {
        // Refresh the page data when a new message is received
        router.refresh();
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
        <div style={{
          display: 'inline-block',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '4px 16px',
          marginBottom: '8px',
          color: 'var(--text-secondary)',
          fontWeight: 'bold',
          letterSpacing: '4px',
          fontSize: '1.2rem',
          animation: 'pulse 1.5s infinite'
        }}>
          ...
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
        
        // Broadcast new message event to the partner so they refresh
        channelRef.current?.send({
          type: 'broadcast',
          event: 'new_message',
          payload: {}
        });

        // Refresh our own page to show the new message
        router.refresh();

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
