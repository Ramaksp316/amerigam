'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ 
  defaultText = 'Submit', 
  pendingText = 'Submitting...', 
  style = {} 
}: { 
  defaultText?: string, 
  pendingText?: string,
  style?: React.CSSProperties
}) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending} 
      style={{ ...style, opacity: pending ? 0.7 : 1 }}
    >
      {pending ? pendingText : defaultText}
    </button>
  );
}
