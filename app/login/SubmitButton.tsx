'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ formAction, text, variant = 'primary' }: { formAction: any, text: string, variant?: 'primary' | 'secondary' }) {
  const { pending } = useFormStatus()
  
  const className = variant === 'primary' ? 'btn' : 'btn btn-outline'
  
  return (
    <button 
      type="submit" 
      formAction={formAction} 
      className={className}
      style={{ 
        flex: 1,
        transition: 'all var(--duration-normal) var(--ease-smooth)',
        opacity: pending ? 0.7 : 1,
        cursor: pending ? 'not-allowed' : 'pointer'
      }}
      disabled={pending}
    >
      {pending ? 'Please wait...' : text}
    </button>
  )
}
