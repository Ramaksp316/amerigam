'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress on route change
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept click on any link to immediately show the loading bar
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('#') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        // If it's navigating to a different path
        if (href !== window.location.pathname) {
          setLoading(true);
          setProgress(25);
          setTimeout(() => setProgress(65), 100);
          setTimeout(() => setProgress(85), 350);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '3px',
      zIndex: 999999,
      pointerEvents: 'none',
      backgroundColor: 'transparent'
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        backgroundColor: '#0284C7',
        boxShadow: '0 0 10px #38BDF8, 0 0 5px #0284C7',
        transition: 'width 0.2s ease, opacity 0.2s ease',
        borderRadius: '0 999px 999px 0'
      }} />
    </div>
  );
}
