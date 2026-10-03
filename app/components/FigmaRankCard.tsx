import React from 'react';
import Link from 'next/link';

interface FigmaRankCardProps {
  rank?: number | string | null;
  creatorTitle?: string;
  creatorDescription?: string;
  badges?: Array<{
    id: string;
    icon: string;
    label?: string;
  }>;
}

export default function FigmaRankCard({
  rank = null,
  creatorTitle = 'Editing',
  creatorDescription = 'This creator has mastery at his own field of Editing.Design is not just what it looks like and feels like. Design is how it works.',
  badges = []
}: FigmaRankCardProps) {
  const displayRank = rank == null
    ? 'Unranked'
    : typeof rank === 'number'
      ? `#${rank}`
      : (rank.startsWith('#') ? rank : `#${rank}`);

  return (
    <div style={{
      width: '100%',
      maxWidth: '300px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit',
      userSelect: 'none'
    }}>
      {/* Top Body Card matching media_1790141404798.jpg - Clickable link to /ranking */}
      <Link href="/ranking" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
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
      </Link>

      {badges.length > 0 && <>
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

      {/* Only earned badges are shown in the tray. */}
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
        {badges.map((badge) => {
          const isImage = /^(https?:\/\/|\/|data:image\/)/i.test(badge.icon);
          return (
            <div
              key={badge.id}
              title={badge.label}
              aria-label={badge.label || 'Achievement badge'}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: '#1C1C20',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                flexShrink: 0
              }}
            >
              {isImage ? (
                <img src={badge.icon} alt={badge.label || 'Achievement badge'} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '24px', lineHeight: 1 }}>{badge.icon}</span>
              )}
            </div>
          );
        })}
      </div>
      </>}
    </div>
  );
}
