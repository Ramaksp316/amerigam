'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Calendar, QrCode, Award } from 'lucide-react';
import Link from 'next/link';

export default function TicketCard({ reg }: { reg: any }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="glass-card" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{reg.event.name}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <MapPin size={16} color="var(--accent-amber)" />
              {reg.event.locationType} {reg.event.venue ? `- ${reg.event.venue}` : ''}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Calendar size={16} color="var(--accent-purple)" />
              {new Date(reg.event.startDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <span style={{ 
            fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 'var(--radius-full)',
            background: reg.status === 'WINNER' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(34, 197, 94, 0.1)',
            color: reg.status === 'WINNER' ? 'var(--accent-purple)' : 'var(--success)'
          }}>
            {reg.status}
          </span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            {reg.participantType}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <button 
          className={`btn btn-small ${showQR ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setShowQR(!showQR)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <QrCode size={16} /> {showQR ? 'Hide Ticket' : 'Show Ticket'}
        </button>

        {reg.status === 'WINNER' && reg.certificates?.[0] && (
          <Link 
            href={`/verify/${reg.certificates[0].certificateId}`} 
            className="btn btn-small" 
            style={{ background: 'var(--accent-amber)', color: '#000', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Award size={16} /> View Certificate
          </Link>
        )}

        {reg.event.allowTeams && (
          <Link href={`/competitions/${reg.event.id}/team`} className="btn btn-small btn-outline">
            Manage Team
          </Link>
        )}
        {reg.event.requireSubmissions && (
          <Link href={`/competitions/${reg.event.id}/submit`} className="btn btn-small btn-outline">
            Submit Project
          </Link>
        )}
      </div>

      {showQR && (
        <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn var(--duration-fast) var(--ease-spring)' }}>
          <div style={{ padding: 'var(--space-4)', background: '#fff', borderRadius: 'var(--radius-lg)' }}>
            <QRCodeSVG value={reg.qrToken} size={200} level="H" includeMargin={true} />
          </div>
          <span style={{ marginTop: 'var(--space-3)', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'bold', background: 'var(--surface-2)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
            {reg.registrationId}
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>Scan this at the venue</p>
        </div>
      )}
    </div>
  );
}
