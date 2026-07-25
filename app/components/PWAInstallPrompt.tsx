'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already installed, don't show
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      background: 'rgba(21, 22, 28, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#fff',
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ 
          background: 'var(--gradient-primary)', 
          padding: '10px', 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
        }}>
          <Download size={22} color="white" />
        </div>
        <div>
          <strong style={{ display: 'block', fontSize: '0.9rem' }}>Install Amerigam App</strong>
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>For a faster, better experience</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={handleInstallClick}
          style={{
            background: 'var(--gradient-primary)',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          Install
        </button>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            color: '#fff',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
