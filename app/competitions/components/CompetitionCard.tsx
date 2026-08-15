'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, ChevronRight, CheckSquare } from 'lucide-react';

export type CardLayout = 'horizontal-split' | 'vertical-split' | 'vertical-overlay';

export default function CompetitionCard({ event, layout = 'vertical-split', isRegistered = false }: { event: any, layout?: CardLayout, isRegistered?: boolean }) {
  const isOngoing = new Date() >= new Date(event.startDate) && new Date() <= new Date(event.endDate);
  
  // Calculate end date text
  const endDate = new Date(event.endDate);
  const startDate = new Date(event.startDate);
  const now = new Date();
  
  const formattedStart = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formattedEnd = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endText = `${formattedStart} - ${formattedEnd}`;

  const renderParticipateButton = (style: React.CSSProperties, textStyle?: React.CSSProperties) => (
    <Link href={isRegistered ? `/competitions/${event.id}/manage` : `/competitions/${event.id}/apply`} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 16px',
      backgroundColor: 'transparent',
      color: isRegistered ? '#10B981' : '#3B82F6',
      border: isRegistered ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
      textDecoration: 'none',
      ...style
    }}>
      <span style={textStyle}>{isRegistered ? 'Registered' : 'Participate'}</span>
    </Link>
  );

  // 1. HORIZONTAL SPLIT (Used in "Following")
  if (layout === 'horizontal-split') {
    return (
      <div style={{
        display: 'flex',
        backgroundColor: '#0A0A0A',
        borderRadius: '16px',
        border: '1px solid #1F1F22',
        overflow: 'hidden',
        height: '130px',
        position: 'relative'
      }}>
        {/* Left Image Area */}
        <div style={{ width: '110px', height: '100%', position: 'relative', flexShrink: 0 }}>
          {event.coverImage ? (
            <Image src={event.coverImage} alt={event.name} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' }} />
          )}
        </div>

        {/* Right Content Area */}
        <div style={{ padding: '16px 16px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: '#FFFFFF', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {event.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A1A1AA', fontSize: '12px' }}>
              <Calendar size={12} />
              <span>{endText}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {renderParticipateButton({})}
            <ChevronRight size={16} color="#A1A1AA" />
          </div>
        </div>
        
        {/* Link Overlay */}
        <Link href={`/competitions/${event.id}`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
      </div>
    );
  }

  // 2. VERTICAL SPLIT (Used in "Suggested")
  if (layout === 'vertical-split') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0F1014',
        borderRadius: '16px',
        border: '1px solid #1F1F22',
        overflow: 'hidden',
        width: '220px',
        minWidth: '220px',
        position: 'relative'
      }}>
        {/* Top Image Area */}
        <div style={{ width: '100%', height: '120px', position: 'relative' }}>
          {event.coverImage ? (
            <Image src={event.coverImage} alt={event.name} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' }} />
          )}
        </div>

        {/* Bottom Content Area */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 600, color: '#FFFFFF', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
              {event.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8BA3A6', fontSize: '12px' }}>
                <CheckSquare size={14} />
                <span>{endText}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8BA3A6', fontSize: '12px' }}>
                <MapPin size={14} />
                <span>{event.locationType === 'ONLINE' ? 'Virtual / Online' : event.venue || 'Multiple Locations'}</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
            {renderParticipateButton({ width: '100%', borderColor: '#4ADE80', color: '#4ADE80' }, { fontWeight: 600, letterSpacing: '0.2px' })}
          </div>
        </div>

        {/* Link Overlay */}
        <Link href={`/competitions/${event.id}`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
      </div>
    );
  }

  // 3. VERTICAL OVERLAY (Used in "Top Competitions")
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '16px',
      border: '1px solid #1F1F22',
      overflow: 'hidden',
      width: '180px',
      minWidth: '180px',
      height: '240px',
      position: 'relative'
    }}>
      {event.coverImage ? (
        <Image src={event.coverImage} alt={event.name} fill style={{ objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)' }} />
      )}
      
      {/* Dark gradient overlay at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '140px',
        background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(5,5,5,0.8) 40%, rgba(5,5,5,0) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Content at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', zIndex: 2 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#FFFFFF', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>
          {event.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A1A1AA', fontSize: '11px' }}>
          <CheckSquare size={12} />
          <span>{endText}</span>
        </div>
        <div style={{ marginTop: '12px' }}>
           {renderParticipateButton({ padding: '4px 12px', fontSize: '11px', borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' })}
        </div>
      </div>

      <Link href={`/competitions/${event.id}`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3 }} />
    </div>
  );
}
