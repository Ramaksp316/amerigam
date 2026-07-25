'use client';
import { useEffect, useState } from 'react';
import LogoSVG from './LogoSVG';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [render, setRender] = useState(true);
  
  useEffect(() => {
    // Start fade out after 1.5 seconds
    const timer1 = setTimeout(() => setShow(false), 1500);
    // Remove from DOM after fade out completes (500ms)
    const timer2 = setTimeout(() => setRender(false), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!render) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ease-in-out ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="flex-1 flex items-center justify-center">
        <LogoSVG className="w-40 h-40 drop-shadow-2xl" />
      </div>
      <div className="pb-16">
        <h1 className="text-xl md:text-2xl font-light tracking-[0.4em] text-white/80 uppercase">
          Amerigam
        </h1>
      </div>
    </div>
  );
}
