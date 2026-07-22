'use client';

import { useRef, useState } from 'react';
import SubmitButton from './SubmitButton';
import { addComment } from '../actions/postActions';

export default function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const action = async (formData: FormData) => {
    const content = formData.get('content') as string;
    if (!content.trim()) return;
    await addComment(postId, content);
    formRef.current?.reset();
    setIsFocused(false);
  };

  return (
    <form 
      ref={formRef} 
      action={action} 
      style={{ 
        marginTop: 'var(--space-3)', 
        display: 'flex', 
        alignItems: 'center', 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: 'var(--space-3)',
        gap: 'var(--space-2)'
      }}
    >
      <input 
        type="text" 
        name="content" 
        placeholder="Add a comment..." 
        required 
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.target.value) setIsFocused(false);
        }}
        style={{ 
          flex: 1, 
          border: 'none', 
          background: 'var(--surface-2)', 
          outline: 'none', 
          color: 'var(--text-primary)', 
          fontSize: 'var(--text-sm)',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-full)',
          transition: 'all var(--duration-normal) var(--ease-smooth)',
          boxShadow: isFocused ? '0 0 0 2px var(--accent-glow)' : 'none'
        }} 
      />
      
      <div style={{
        opacity: isFocused ? 1 : 0.5,
        transition: 'all var(--duration-normal) var(--ease-smooth)'
      }}>
        <SubmitButton 
          defaultText="Post" 
          pendingText="Posting..." 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--accent-purple)', 
            fontWeight: 700, 
            cursor: 'pointer', 
            fontSize: 'var(--text-sm)',
            padding: 'var(--space-2)'
          }} 
        />
      </div>
    </form>
  );
}
