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
  creatorDescription = 'This creator has mastery at his own field of Editing.Design is not just what it looks like and feels like. Design is how it works.',
  badges = []
}: FigmaRankCardProps) {
  const displayRank = typeof rank === 'number' ? `#${rank}` : (rank.startsWith('#') ? rank : `#${rank}`);

  return (
    <div style={{
      width: '100%',
      maxWidth: '300px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit',
      userSelect: 'none'
    }}>
      {/* Top Body Card matching media_1790141404798.jpg */}
      <div style={{
        width: '100%',
        backgroundColor: '#18181B',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
        padding: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        position: 'relative'
      }}>
        {/* Left Green Emblem Badge */}
        <div style={{
          width: '74px',
          height: '82px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 6px 16px rgba(22, 163, 74, 0.3))'
        }}>
          <img
            src="/images/figma/badge_164_290.svg"
            alt="Emblem"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/figma/badge_164_290.png';
            }}
          />
        </div>

        {/* Right Info: Rank Title + Description */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            fontSize: '22px',
            fontFamily: 'Georgia, serif',
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

      {/* Connected Bridge Notch (media_1790141404798.jpg) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '32px',
        marginTop: '-1px',
        marginBottom: '-1px',
        zIndex: 2
      }}>
        <div style={{
          width: '28px',
          height: '8px',
          backgroundColor: '#18181B',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }} />
      </div>

      {/* Bottom Tray for Badges matching media_1790141404798.jpg */}
      <div style={{
        backgroundColor: '#141417',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Slot 1: Pink Shield Badge */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
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
            style={{ width: '30px', height: '30px', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/figma/badge_164_309.png';
            }}
          />
        </div>

        {/* Slot 2: Blue Shield Badge */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
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
            style={{ width: '30px', height: '30px', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/figma/badge_164_318.png';
            }}
          />
        </div>

        {/* Slot 3: Empty Slot */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          backgroundColor: '#0F0F12',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.7)'
        }} />

        {/* Slot 4: Empty Slot */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          backgroundColor: '#0F0F12',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.7)'
        }} />
      </div>
    </div>
  );
}
