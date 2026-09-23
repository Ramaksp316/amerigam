'use client';

import React from 'react';

export default function EmptyStateIllustration({ onNewChat }: { onNewChat?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center select-none">
      {/* 3D Layered Speech Bubble matching Figma 17.png */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center mb-6">
        <svg
          viewBox="0 0 260 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
        >
          <defs>
            {/* Outer Olive/Gold Glow Gradient */}
            <linearGradient id="goldBubble" x1="40" y1="20" x2="220" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D4C22B" />
              <stop offset="0.6" stopColor="#B39E18" />
              <stop offset="1" stopColor="#7E6C0C" />
            </linearGradient>

            {/* Deep Blue Front Bubble Gradient */}
            <linearGradient id="blueBubble" x1="60" y1="40" x2="210" y2="210" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3263E6" />
              <stop offset="0.4" stopColor="#224EC4" />
              <stop offset="1" stopColor="#153696" />
            </linearGradient>

            {/* Bubble Shadows */}
            <filter id="shadowUnder" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="-4" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.7" />
            </filter>

            <filter id="frontShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="2" dy="8" stdDeviation="8" floodColor="#0a1a4a" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Layer 1: Background Gold/Yellow Bubble (Figma 17.png) */}
          <path
            d="M 125 35 
               C 178 35, 220 72, 220 118 
               C 220 164, 178 201, 125 201 
               C 107 201, 90 196, 75 187 
               C 52 201, 38 214, 38 214 
               C 42 195, 46 177, 42 165 
               C 34 151, 30 135, 30 118 
               C 30 72, 72 35, 125 35 Z"
            fill="url(#goldBubble)"
            filter="url(#shadowUnder)"
            transform="translate(-6, 8) scale(1.04) transform-origin-center"
          />

          {/* Layer 2: Foreground Deep Royal Blue Bubble (Figma 17.png) */}
          <path
            d="M 132 44 
               C 183 44, 222 79, 222 122 
               C 222 165, 183 200, 132 200 
               C 115 200, 99 195, 85 187 
               C 63 200, 48 212, 48 212 
               C 52 194, 56 177, 52 166 
               C 44 153, 42 138, 42 122 
               C 42 79, 81 44, 132 44 Z"
            fill="url(#blueBubble)"
            filter="url(#frontShadow)"
          />

          {/* Layer 3: Crisp White Globe Icon inside Blue Bubble */}
          <g transform="translate(132, 122)">
            {/* Outer Globe Circle */}
            <circle cx="0" cy="0" r="30" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.95" />
            
            {/* Equator & Latitude Lines */}
            <line x1="-30" y1="0" x2="30" y2="0" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
            <line x1="-25" y1="-14" x2="25" y2="-14" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
            <line x1="-25" y1="14" x2="25" y2="14" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
            
            {/* Central Prime Meridian */}
            <line x1="0" y1="-30" x2="0" y2="30" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
            
            {/* Curved Longitude Ellipses */}
            <ellipse cx="0" cy="0" rx="16" ry="30" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.85" />
          </g>
        </svg>
      </div>

      {/* Text matching Figma minimalist aesthetic */}
      <h3 className="text-xl font-bold text-white mb-2 tracking-wide font-sans">
        Amerigam Messages
      </h3>
      <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
        Select a conversation from the left to start messaging, or create a new conversation with creators and connections.
      </p>

      {onNewChat && (
        <button
          onClick={onNewChat}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white text-sm font-semibold transition-all shadow-lg hover:shadow-sky-500/20 active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Message
        </button>
      )}
    </div>
  );
}
