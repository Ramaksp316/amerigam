'use client';
import React from 'react';

export default function DesktopFeedTop() {
  return (
    <div className="desktop-only" style={{ padding: '24px', paddingBottom: '0' }}>
      {/* 3 Stories Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        
        {/* Story 1 */}
        <div style={{ aspectRatio: '9/16', backgroundColor: '#1D78B4', borderRadius: '16px' }}></div>
        
        {/* Story 2 (Active/Creator) */}
        <div style={{ aspectRatio: '9/16', backgroundColor: '#1D78B4', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF4D4D, #F9CB28, #4DFF4D, #4D4DFF)' }}></div>
            <span style={{ color: '#FFF', fontSize: '13px', fontWeight: 'bold' }}>@creator</span>
          </div>
        </div>

        {/* Story 3 */}
        <div style={{ aspectRatio: '9/16', backgroundColor: '#1D78B4', borderRadius: '16px' }}></div>
      </div>
    </div>
  );
}
