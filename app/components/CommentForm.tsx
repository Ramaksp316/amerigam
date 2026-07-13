'use client';

import { useRef } from 'react';
import SubmitButton from './SubmitButton';
import { addComment } from '../actions/postActions';

export default function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  const action = async (formData: FormData) => {
    const content = formData.get('content') as string;
    await addComment(postId, content);
    formRef.current?.reset();
  };

  return (
    <form ref={formRef} action={action} style={{ marginTop: '12px', display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
      <input 
        type="text" 
        name="content" 
        placeholder="Add a comment..." 
        required 
        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }} 
      />
      <SubmitButton 
        defaultText="Post" 
        pendingText="Posting..." 
        style={{ background: 'none', border: 'none', color: 'var(--btn-primary-bg)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }} 
      />
    </form>
  );
}
