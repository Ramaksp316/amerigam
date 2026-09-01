'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton({ fallback = '/competitions' }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push(fallback);
        }
      }} 
      style={{ 
        width: '36px', 
        height: '36px', 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        borderRadius: '50%', 
        border: 'none',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#FFF',
        cursor: 'pointer'
      }}
    >
      <ChevronLeft size={20} />
    </button>
  );
}
