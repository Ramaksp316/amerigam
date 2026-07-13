'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ formAction, text, variant = 'primary' }: { formAction: any, text: string, variant?: 'primary' | 'secondary' }) {
  const { pending } = useFormStatus()
  
  const baseStyle = { flex: 1, opacity: pending ? 0.7 : 1, cursor: pending ? 'not-allowed' : 'pointer' }
  const className = variant === 'primary' ? 'btn' : 'btn btn-text'
  
  return (
    <button 
      type="submit" 
      formAction={formAction} 
      className={className}
      style={variant === 'secondary' ? { ...baseStyle, border: '1px solid var(--border-color)' } : baseStyle}
      disabled={pending}
    >
      {pending ? '...' : text}
    </button>
  )
}
