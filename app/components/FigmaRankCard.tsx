import React from 'react';

interface FigmaRankCardProps {
  rank?: number | string;
  creatorTitle?: string;
  creatorDescription?: string;
  badges?: Array<{
    id: string;
    icon: string;
    label?: string;
  }>;
}

export default function FigmaRankCard({
  rank = '#1',
  creatorTitle = 'Editing',
  creatorDescription = 'This creator has mastery in his own field of Editing. Design is not just what it looks like and feels like. Design is how it works.',
  badges = []
}: FigmaRankCardProps) {
  const displayRank = typeof rank === 'number' ? `#${rank}` : (rank.startsWith('#') ? rank : `#${rank}`);

  return (
    <div style={{
      width: '100%',
      maxWidth: '300px',
      backgroundColor: '#18181B',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit'
    }}>
      {/* Top Body */}
      <div style={{
        padding: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        {/* Left Green Emblem Badge */}
        <div style={{
          width: '74px',
          height: '82px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 4px 12px rgba(22, 163, 74, 0.25))'
        }}>
          <img
            src="/images/figma/badge_164_290.svg"
            alt="Emblem"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              // fallback to png if svg render fails
              (e.target as HTMLImageElement).src = '/images/figma/badge_164_290.png';
            }}
          />
        </div>

        {/* Right Info: Rank Title + Description */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            fontSize: '22px',
            fontFamily: 'serif',
            color: '#FFFFFF',
            lineHeight: '1.1',
            letterSpacing: '-0.2px'
          }}>
            Rank
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: '1.1',
            letterSpacing: '-0.5px',
            marginBottom: '8px'
          }}>
            {displayRank}
          </div>
          <p style={{
            margin: 0,
            fontSize: '11px',
            lineHeight: '1.45',
            color: '#D4D4D8',
            fontWeight: 400
          }}>
            {creatorDescription}
          </p>
        </div>
      </div>

      {/* Bottom Notch Container for Badges */}
      <div style={{
        backgroundColor: '#0F0F12',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        {/* Slot 1: Pink Shield Badge */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: '#1C1C20',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
          transition: 'transform 0.15s ease'
        }}>
          <img
            src="/images/figma/badge_164_309.svg"
            alt="Pink Badge"
            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/figma/badge_164_309.png';
            }}
          />
        </div>

        {/* Slot 2: Blue Shield Badge */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: '#1C1C20',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
          transition: 'transform 0.15s ease'
        }}>
          <img
            src="/images/figma/badge_164_318.svg"
            alt="Blue Badge"
            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/figma/badge_164_318.png';
            }}
          />
        </div>

        {/* Slot 3: Empty Slot */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: '#141416',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
        }} />

        {/* Slot 4: Empty Slot */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: '#141416',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)'
        }} />
      </div>
    </div>
  );
}
