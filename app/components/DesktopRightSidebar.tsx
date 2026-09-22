'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function DesktopRightSidebar({
  currentUser,
  joinedCommunities,
  networkUsers,
  hideExtras = false
}: {
  currentUser?: any;
  joinedCommunities?: any[];
  networkUsers?: any[];
  hideExtras?: boolean;
}) {
  if (!currentUser) return null;

  return (
    <div className="layout-right desktop-only" style={{ width: '310px', padding: '24px 16px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ========================================================
          1. EXACT RANK #1 CARD (matching media_1789975856763.png)
         ======================================================== */}
      <div style={{
        backgroundColor: '#171719',
        borderRadius: '26px',
        padding: '22px 20px 16px 20px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Top: Emblem Badge + Rank #1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Green Shield Emblem Badge matching image */}
          <div style={{ position: 'relative', width: '70px', height: '74px', flexShrink: 0 }}>
            <svg width="70" height="74" viewBox="0 0 72 76" fill="none">
              {/* Green Crest Body with ears and curved bottom */}
              <path d="M12 10 C18 4, 30 14, 36 6 C42 14, 54 4, 60 10 C66 16, 68 28, 66 40 C63 56, 48 68, 36 74 C24 68, 9 56, 6 40 C4 28, 6 16, 12 10 Z" fill="#10B981" />
              
              {/* Subtle inner highlight border */}
              <path d="M14 13 C19 8, 29 16, 36 9 C43 16, 53 8, 58 13 C63 18, 64 28, 62 38 C60 51, 46 62, 36 67 C26 62, 12 51, 10 38 C8 28, 9 18, 14 13 Z" stroke="#34D399" strokeWidth="1.5" fill="none" opacity="0.65" />
              
              {/* Dark Inverted Triangle on chest */}
              <polygon points="15 19 57 19 36 49" fill="#042F2C" />
              
              {/* White Amerigam Logo inside triangle */}
              <g transform="translate(25, 22) scale(0.48)">
                <path d="M5 25 C10 10, 30 5, 42 15 C30 18, 18 24, 14 35 C25 22, 38 24, 45 28 C35 32, 25 36, 15 42" fill="#FFFFFF" />
              </g>
              
              {/* Elliptical Orbit Ring passing through shield */}
              <ellipse cx="36" cy="34" rx="27" ry="7" stroke="#042F2C" strokeWidth="2.5" fill="none" transform="rotate(-6 36 34)" />
            </svg>
          </div>

          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1.1' }}>
              Rank
            </div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#FFFFFF', lineHeight: '1.1', letterSpacing: '-0.5px' }}>
              #1
            </div>
          </div>
        </div>

        {/* Quote text */}
        <p style={{
          fontSize: '11.5px',
          color: '#9CA3AF',
          lineHeight: '1.5',
          margin: '14px 0 16px 0',
          fontWeight: 400
        }}>
          This creator has mastery at his own field of Editing.Design is not just what it looks like and feels like. Design is how it works.
        </p>

        {/* Notch separator bar */}
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#0D0D0F',
          borderRadius: '999px',
          marginBottom: '10px'
        }} />

        {/* Bottom Tray with 4 Badge Slots */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'space-between'
        }}>
          {/* Badge 1: Pink Shield Badge */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #BE185D, #831843)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(244, 114, 182, 0.4)',
            boxShadow: '0 4px 14px rgba(190, 24, 93, 0.35)',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V6l-8-4z" fill="#9D174D" stroke="#F472B6" strokeWidth="1.2" />
              <path d="M8 11l4-4 4 4M12 7v10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Badge 2: Blue Amerigam Badge */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #2563EB, #1D4ED8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(96, 165, 250, 0.4)',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            flexShrink: 0
          }}>
            <Image 
              src="/amerigam-logo-transparent.png" 
              alt="Amerigam" 
              width={24} 
              height={12} 
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
            />
          </div>

          {/* Badge 3: Empty Dark Slot */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#0D0D0F',
            border: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0
          }} />

          {/* Badge 4: Empty Dark Slot */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            backgroundColor: '#0D0D0F',
            border: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0
          }} />
        </div>
      </div>

      {/* ========================================================
          2. EXACT EDITOR CARD (matching media_1789975850149.jpg)
         ======================================================== */}
      <div style={{
        backgroundColor: '#18181A',
        borderRadius: '24px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Top Header: Colorful splash avatar + Editor stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Colorful paint splash / art avatar circle */}
          <div style={{
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            background: 'conic-gradient(from 180deg at 50% 50%, #D946EF 0deg, #8B5CF6 75deg, #06B6D4 150deg, #FACC15 240deg, #F97316 300deg, #EC4899 360deg)',
            boxShadow: '0 6px 20px rgba(217, 70, 239, 0.4)',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {currentUser?.avatarData ? (
              <img src={currentUser.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
            ) : null}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', lineHeight: '1.2' }}>
              Editor
            </div>

            {/* 3 Stats: Rank, AP, Rating */}
            <div style={{ display: 'flex', gap: '18px', marginTop: '6px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1' }}>11</div>
                <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>Rank</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1' }}>1001</div>
                <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>AP</div>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1' }}>9.3</div>
                <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* "Your Communities" label */}
        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '20px', marginBottom: '12px', fontWeight: 500 }}>
          Your Communities
        </div>

        {/* Communities dots: 4 gray circles + 3 overlapping colored circles */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* 4 Gray circles */}
          <div style={{ display: 'flex', gap: '8px', marginRight: '8px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#D4D4D8',
                flexShrink: 0
              }} />
            ))}
          </div>

          {/* 3 Overlapping colored circles (Yellow-green, Green, Blue) */}
          <div style={{ position: 'relative', width: '56px', height: '32px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {/* Circle 1: Yellow-green */}
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#A3E635',
              position: 'absolute',
              left: 0,
              zIndex: 1
            }} />
            {/* Circle 2: Emerald Green */}
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#16A34A',
              position: 'absolute',
              left: '12px',
              zIndex: 2
            }} />
            {/* Circle 3: Deep Blue */}
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#1D4ED8',
              position: 'absolute',
              left: '24px',
              zIndex: 3
            }} />
          </div>
        </div>

        {/* Home indicator pill at bottom */}
        <div style={{
          width: '80px',
          height: '3px',
          backgroundColor: '#3F3F46',
          borderRadius: '2px',
          margin: '22px auto 0 auto'
        }} />
      </div>

    </div>
  );
}
