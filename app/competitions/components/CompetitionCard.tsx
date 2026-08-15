'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users } from 'lucide-react';

export default function CompetitionCard({ event, layout = 'vertical', isRegistered = false }: { event: any, layout?: 'vertical' | 'horizontal', isRegistered?: boolean }) {
  const isOngoing = new Date() >= new Date(event.startDate) && new Date() <= new Date(event.endDate);
  
  // Calculate end date text
  const endDate = new Date(event.endDate);
  const now = new Date();
  const diffTime = Math.abs(endDate.getTime() - now.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  const endText = isOngoing 
    ? `Ends in ${diffDays}d ${diffHours}h` 
    : now > endDate ? 'Completed' : `${new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'horizontal' ? 'row' : 'column',
    backgroundColor: 'var(--surface-1)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    position: 'relative',
    width: layout === 'horizontal' ? '100%' : '260px',
    minWidth: layout === 'horizontal' ? 'unset' : '260px',
    textDecoration: 'none',
    color: 'inherit'
  };

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: layout === 'horizontal' ? '140px' : '100%',
    height: layout === 'horizontal' ? '140px' : '140px',
    flexShrink: 0
  };

  const contentStyle: React.CSSProperties = {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
    gap: '12px'
  };

  return (
    <div style={cardStyle}>
      <Link href={`/competitions/${event.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: layout === 'horizontal' ? 'row' : 'column', flex: 1 }}>
        <div style={imageContainerStyle}>
          {event.coverImage ? (
            <Image src={event.coverImage} alt={event.name} fill style={{ objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e1e24 0%, #0b0c10 100%)' }} />
          )}
          
          {/* Organization Mini Badge */}
          {layout === 'vertical' && event.creator && (
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <Image src="/amerigam-logo-transparent.png" alt="Amerigam" width={16} height={16} style={{ mixBlendMode: 'screen' }} />
            </div>
          )}
        </div>

        <div style={contentStyle}>
          <div>
            {isOngoing && (
              <div style={{ color: '#60A5FA', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                LIVE NOW
              </div>
            )}
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#FFFFFF', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {event.name}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A1A1AA', fontSize: '13px' }}>
                <Calendar size={14} />
                <span>{endText}</span>
              </div>
              {layout === 'vertical' && event.participantLimit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A1A1AA', fontSize: '13px' }}>
                  <Users size={14} />
                  <span>{event.participantLimit} Participants</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      <div style={{ padding: '0 16px 16px 16px', width: '100%' }}>
        <Link href={isRegistered ? `/competitions/${event.id}/manage` : `/competitions/${event.id}/apply`} style={{
          display: 'block',
          width: '100%',
          padding: '8px 0',
          textAlign: 'center',
          backgroundColor: isRegistered ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
          color: isRegistered ? '#10B981' : '#3B82F6',
          border: isRegistered ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none'
        }}>
          {isRegistered ? 'Registered' : 'Participate'}
        </Link>
      </div>
    </div>
  );
}
