'use client';

import React from 'react';

export default function EmptyStateIllustration({ onNewChat }: { onNewChat?: () => void }) {
  return (
    <div
      className="messages-empty-state-view"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* 3D Layered Double Speech Bubble matching Normal messagar.png EXACTLY */}
      <div
        style={{
          position: 'relative',
          width: '320px',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 32px 64px rgba(0, 0, 0, 0.9)) drop-shadow(0 16px 32px rgba(0, 0, 0, 0.8))'
        }}
      >
        <svg
          viewBox="0 0 340 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible'
          }}
        >
          <defs>
            {/* Deep Royal Blue Back Bubble Gradient */}
            <linearGradient id="blueBubbleGrad" x1="60" y1="30" x2="260" y2="250" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="35%" stopColor="#2563EB" />
              <stop offset="80%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#173EAB" />
            </linearGradient>

            {/* Front Olive/Golden Yellow Bubble Gradient */}
            <linearGradient id="goldBubbleGrad" x1="90" y1="50" x2="270" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D8C328" />
              <stop offset="30%" stopColor="#C4AF1F" />
              <stop offset="70%" stopColor="#A89415" />
              <stop offset="100%" stopColor="#81710C" />
            </linearGradient>

            {/* Ambient Deep Shadow under the Back Bubble */}
            <filter id="bubbleFloorShadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="-8" dy="24" stdDeviation="16" floodColor="#000000" floodOpacity="0.85" />
            </filter>

            {/* Inter-bubble Inner Depth Shadow */}
            <filter id="goldOverBlueShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-4" dy="8" stdDeviation="8" floodColor="#071233" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* LAYER 1: Deep Royal Blue Speech Bubble (BACK LAYER) */}
          <g filter="url(#bubbleFloorShadow)">
            <path
              d="M 165 42
                 C 232 42, 286 86, 286 140
                 C 286 194, 232 238, 165 238
                 C 142 238, 120 232, 102 221
                 C 72 238, 54 254, 54 254
                 C 59 232, 64 210, 60 196
                 C 49 180, 44 161, 44 140
                 C 44 86, 98 42, 165 42 Z"
              fill="url(#blueBubbleGrad)"
            />
          </g>

          {/* LAYER 2: Rich Olive / Gold-Yellow Speech Bubble (FRONT LAYER, offset down-right) */}
          <g filter="url(#goldOverBlueShadow)">
            <path
              d="M 178 58
                 C 238 58, 286 98, 286 146
                 C 286 194, 238 234, 178 234
                 C 158 234, 138 228, 122 218
                 C 96 234, 80 248, 80 248
                 C 84 228, 89 208, 85 196
                 C 76 182, 70 165, 70 146
                 C 70 98, 118 58, 178 58 Z"
              fill="url(#goldBubbleGrad)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
