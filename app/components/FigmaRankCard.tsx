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
  rank = 1,
  creatorTitle = 'Editing',
  creatorDescription,
  badges = []
}: FigmaRankCardProps) {
  const displayRank = rank == null
    ? '#1'
    : typeof rank === 'number'
      ? `#${rank}`
      : (rank.startsWith('#') ? rank : `#${rank}`);

  const desc = creatorDescription || `This creator has mastery in his own field of ${creatorTitle || 'Editing'}. Design is not just what it looks like and feels like. Design is how it works.`;

  return (
    <Link href="/ranking" style={{ textDecoration: 'none', color: 'inherit', display: 'block', userSelect: 'none' }}>
      {/* Outer Figma Card (222px x 233px) */}
      <div
        style={{
          width: '222px',
          height: '233px',
          backgroundColor: '#212121',
          borderRadius: '22px',
          boxShadow: '0.3px 0.3px 1px rgba(255, 255, 255, 0.70) inset, 1px 1px 1.2px black',
          padding: '12px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          cursor: 'pointer',
          transition: 'transform 0.18s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {/* Top Header: Green Emblem + Rank text & info */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          {/* Green Emblem Badge Box (73px x 81px) */}
          <div
            style={{
              width: '73px',
              height: '81px',
              backgroundColor: '#1C1C1C',
              borderRadius: '22px',
              boxShadow: '0.3px 0.3px 0.6px #595656 inset, 0.6px 0.6px 1.2px rgba(0, 0, 0, 0.70)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '4px',
              boxSizing: 'border-box'
            }}
          >
            <img
              src="/images/figma/badge_164_290.svg"
              alt="Rank Emblem"
              style={{ width: '67px', height: '75px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/figma/badge_164_290.png';
              }}
            />
          </div>

          {/* Right Info: Rank Title + Number + Mini Description */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingTop: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span
                style={{
                  color: '#FFFFFF',
                  fontSize: '22px',
                  fontFamily: 'Inria Serif, Georgia, serif',
                  fontWeight: 700,
                  lineHeight: 1
                }}
              >
                Rank
              </span>
              <span
                style={{
                  color: '#FFFFFF',
                  fontSize: '22px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  lineHeight: 1
                }}
              >
                {displayRank}
              </span>
            </div>

            <p
              style={{
                margin: '5px 0 0 0',
                color: '#FFFFFF',
                fontSize: '7.5px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 300,
                lineHeight: 1.35,
                wordWrap: 'break-word',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {desc}
            </p>
          </div>
        </div>

        {/* Middle: Groove Bar (153px x 15px) */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '4px 0' }}>
          <div
            style={{
              width: '153px',
              height: '14px',
              backgroundColor: '#0A0A0A',
              boxShadow: '3px 4px 4px rgba(0, 0, 0, 0.51) inset',
              borderRadius: '16px'
            }}
          />
        </div>

        {/* Bottom: 4 Badge Slots (43px x 43px each) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Slot 1: Pink Emblem Badge */}
          <div
            style={{
              width: '43px',
              height: '43px',
              backgroundColor: '#101010',
              borderRadius: '14px',
              boxShadow: '0.1px 0.1px 0.6px white inset, 0.5px 0.5px 1.9px black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src="/images/figma/badge_164_309.svg"
              alt="Pink Badge"
              style={{ width: '31px', height: '28px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/figma/badge_164_309.png';
              }}
            />
          </div>

          {/* Slot 2: Blue Emblem Badge */}
          <div
            style={{
              width: '43px',
              height: '43px',
              backgroundColor: '#101010',
              borderRadius: '14px',
              boxShadow: '0.1px 0.1px 0.6px white inset, 0.5px 0.5px 1.9px black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src="/images/figma/badge_164_318.svg"
              alt="Blue Badge"
              style={{ width: '31px', height: '28px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/figma/badge_164_318.png';
              }}
            />
          </div>

          {/* Slot 3: Available/Empty Badge Slot */}
          <div
            style={{
              width: '43px',
              height: '43px',
              backgroundColor: '#0F0F0F',
              borderRadius: '14px',
              boxShadow: '0.1px 0.1px 0.6px white inset, 0.5px 0.5px 1.9px black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {badges[2]?.icon ? (
              <img src={badges[2].icon} alt="Badge" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            ) : (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#262626' }} />
            )}
          </div>

          {/* Slot 4: Available/Empty Badge Slot */}
          <div
            style={{
              width: '43px',
              height: '43px',
              backgroundColor: '#0F0F0F',
              borderRadius: '14px',
              boxShadow: '0.1px 0.1px 0.6px white inset, 0.5px 0.5px 1.9px black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {badges[3]?.icon ? (
              <img src={badges[3].icon} alt="Badge" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            ) : (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#262626' }} />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
