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
  const displayRank = rank != null && rank !== ''
    ? (typeof rank === 'number' ? `#${rank}` : (String(rank).startsWith('#') ? rank : `#${rank}`))
    : '#1';

  const desc = creatorDescription || `This creator has mastery in his own field of ${creatorTitle || 'Editing'}. Design is not just what it looks like and feels like. Design is how it works.`;

  return (
    <Link href="/ranking" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      {/* Outer Container matching Figma Shape in media_1791179359910.png */}
      <div
        style={{
          width: '226px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          transition: 'transform 0.18s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {/* Top Main Rank Card */}
        <div
          style={{
            width: '100%',
            height: '142px',
            backgroundColor: '#212121',
            borderRadius: '22px',
            boxShadow: '0.3px 0.3px 1px rgba(255, 255, 255, 0.70) inset, 1px 1px 1.2px black',
            padding: '12px 14px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          {/* Top Header: Green Emblem + Rank Title & Number + Mini Bio */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            {/* Green Emblem Badge Box */}
            <div
              style={{
                width: '64px',
                height: '70px',
                backgroundColor: '#1C1C1C',
                borderRadius: '18px',
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
                style={{ width: '58px', height: '64px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/figma/badge_164_290.png';
                }}
              />
            </div>

            {/* Right Info: Rank Header + Number + Description */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingTop: '1px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    color: '#FFFFFF',
                    fontSize: '20px',
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
                    fontSize: '20px',
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
                  margin: '6px 0 0 0',
                  color: '#C4C4C4',
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

          {/* Bottom subtle groove notch line */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div
              style={{
                width: '130px',
                height: '5px',
                backgroundColor: '#0A0A0A',
                borderRadius: '8px',
                boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.8) inset'
              }}
            />
          </div>
        </div>

        {/* Small connector notch */}
        <div
          style={{
            width: '18px',
            height: '4px',
            backgroundColor: '#181818',
            borderRadius: '2px',
            marginTop: '-4px',
            marginBottom: '-4px',
            zIndex: 1
          }}
        />

        {/* Bottom Badge Dock Pill matching Figma (226px x 52px) */}
        <div
          style={{
            width: '100%',
            height: '52px',
            backgroundColor: '#212121',
            borderRadius: '18px',
            boxShadow: '0.3px 0.3px 1px rgba(255, 255, 255, 0.70) inset, 1px 1px 1.2px black',
            padding: '5px 10px',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Slot 1: Pink Emblem Badge */}
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#101010',
              borderRadius: '12px',
              boxShadow: '0.1px 0.1px 0.6px rgba(255,255,255,0.4) inset, 0.5px 0.5px 1.5px black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src="/images/figma/badge_164_309.svg"
              alt="Pink Badge"
              style={{ width: '28px', height: '26px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/figma/badge_164_309.png';
              }}
            />
          </div>

          {/* Slot 2: Blue Emblem Badge */}
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#101010',
              borderRadius: '12px',
              boxShadow: '0.1px 0.1px 0.6px rgba(255,255,255,0.4) inset, 0.5px 0.5px 1.5px black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src="/images/figma/badge_164_318.svg"
              alt="Blue Badge"
              style={{ width: '28px', height: '26px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/figma/badge_164_318.png';
              }}
            />
          </div>

          {/* Slot 3: Empty / Slot */}
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#141414',
              borderRadius: '12px',
              border: '1px solid #2A2A2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {badges[2]?.icon ? (
              <img src={badges[2].icon} alt="Badge" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            ) : null}
          </div>

          {/* Slot 4: Empty / Slot */}
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#141414',
              borderRadius: '12px',
              border: '1px solid #2A2A2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {badges[3]?.icon ? (
              <img src={badges[3].icon} alt="Badge" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
