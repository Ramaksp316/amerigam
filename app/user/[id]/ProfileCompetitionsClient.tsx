'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfileCompetitionsClient({ 
  accountType, 
  eventRegistrations, 
  createdEvents, 
  apTransactions = [],
  isOwner 
}: { 
  accountType: string, 
  eventRegistrations: any[], 
  createdEvents: any[], 
  apTransactions?: any[],
  isOwner: boolean 
}) {
  const [filter, setFilter] = useState('All');

  // Personal Account View
  if (accountType === 'PERSONAL' || !isOwner) {
    const filters = ['All', 'Pending', 'Accepted', 'Qualified', 'Rejected', 'Completed'];
    
    const filteredRegs = eventRegistrations.filter(reg => {
      if (filter === 'All') return true;
      
      const now = new Date();
      const compEnd = new Date(reg.event.endDate);
      const isCompleted = now > compEnd;

      if (filter === 'Completed' && isCompleted) return true;
      if (isCompleted) return false;

      if (filter === 'Pending' && reg.status === 'PENDING') return true;
      if (filter === 'Accepted' && reg.status === 'APPROVED' && reg.qualificationStatus !== 'QUALIFIED') return true;
      if (filter === 'Rejected' && reg.status === 'REJECTED') return true;
      if (filter === 'Qualified' && reg.qualificationStatus === 'QUALIFIED') return true;

      return false;
    });

    return (
      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: filter === f ? '1px solid #1D9BF0' : '1px solid #3F3F46',
                backgroundColor: filter === f ? 'rgba(29, 155, 240, 0.1)' : 'transparent',
                color: filter === f ? '#1D9BF0' : '#A1A1AA',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredRegs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#71717A', fontSize: '15px' }}>
            <p>No competitions found for this filter.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRegs.map(reg => {
              const compStart = new Date(reg.event.startDate);
              const compEnd = new Date(reg.event.endDate);
              const now = new Date();
              const isCompleted = now > compEnd;
              
              let displayStatus = 'Pending Review';
              let statusColor = '#F59E0B';
              let earnedAP = 0;
              
              const apTx = apTransactions.find(tx => tx.sourceId === reg.event.id && tx.status === 'AWARDED');
              if (apTx) {
                earnedAP = apTx.amount;
              }

              if (reg.event.resultStatus === 'PUBLISHED') {
                const userResult = reg.event.results?.find((r: any) => r.userId === reg.userId);
                if (userResult) {
                  displayStatus = userResult.rank === 1 ? 'Winner' : userResult.rank === 2 ? 'Runner-up' : userResult.rank === 3 ? '3rd Place' : `Top 10 - #${userResult.rank}`;
                  statusColor = userResult.rank === 1 ? '#F59E0B' : userResult.rank === 2 ? '#94A3B8' : userResult.rank === 3 ? '#B45309' : '#3B82F6';
                } else {
                  displayStatus = 'Participated';
                  statusColor = '#6B7280';
                }
              } else if (isCompleted) {
                displayStatus = 'Completed';
                statusColor = '#6B7280';
              } else if (reg.status === 'REJECTED') {
                displayStatus = 'Rejected';
                statusColor = '#EF4444';
              } else if (reg.status === 'APPROVED') {
                if (reg.qualificationStatus === 'QUALIFIED') {
                  displayStatus = 'Qualified';
                  statusColor = '#3B82F6';
                } else if (reg.qualificationStatus === 'NON_QUALIFIED') {
                  displayStatus = 'Non-qualified';
                  statusColor = '#6B7280';
                } else {
                  displayStatus = 'Accepted';
                  statusColor = '#10B981';
                }
              }

              let paymentStatus = null;
              if (reg.event.entryFee > 0) {
                if (reg.payment?.status === 'SUCCESS') paymentStatus = 'Paid';
                else if (reg.payment?.status === 'PENDING') paymentStatus = 'Payment Pending';
                else paymentStatus = 'Payment Failed';
              } else {
                paymentStatus = 'Free';
              }

              return (
                <div key={reg.id} style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1F1F22', position: 'relative', flexShrink: 0 }}>
                      {reg.event.coverImage && <Image src={reg.event.coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Link href={`/competitions/${reg.event.id}`} style={{ color: 'white', textDecoration: 'none' }}>
                        <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>{reg.event.name}</strong>
                      </Link>
                      <div style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '8px' }}>
                        {compStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#D4D4D8' }}>
                          {paymentStatus}
                        </span>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: `${statusColor}20`, color: statusColor, fontWeight: 600 }}>
                          {displayStatus}
                        </span>
                        {earnedAP > 0 && (
                          <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(29, 155, 240, 0.1)', color: '#1D9BF0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🌟 +{earnedAP} AP
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                      <Link href={`/competitions/${reg.event.id}/manage`} style={{ flex: 1, textAlign: 'center', padding: '10px 0', backgroundColor: '#1F1F22', color: '#FFF', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                        {reg.status === 'APPROVED' ? 'View Ticket' : 'Registration Details'}
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Organizer Account View
  const filtersOrg = ['All', 'Registration Open', 'Upcoming', 'Live', 'Completed'];
  
  const filteredEvents = createdEvents.filter(ev => {
    if (filter === 'All') return true;
    
    const now = new Date();
    const compStart = new Date(ev.startDate);
    const compEnd = new Date(ev.endDate);
    const regStart = ev.registrationStart ? new Date(ev.registrationStart) : null;
    const regEnd = ev.registrationEnd ? new Date(ev.registrationEnd) : null;

    const isRegistrationOpen = regStart && regEnd && now >= regStart && now <= regEnd;
    const isCompleted = now > compEnd;
    const isLive = now >= compStart && now <= compEnd;
    const isUpcoming = now < compStart && !isLive;

    if (filter === 'Registration Open' && isRegistrationOpen) return true;
    if (filter === 'Upcoming' && isUpcoming) return true;
    if (filter === 'Live' && isLive) return true;
    if (filter === 'Completed' && isCompleted) return true;

    return false;
  });

  return (
    <div style={{ padding: '24px 20px' }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {filtersOrg.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: filter === f ? '1px solid #1D9BF0' : '1px solid #3F3F46',
              backgroundColor: filter === f ? 'rgba(29, 155, 240, 0.1)' : 'transparent',
              color: filter === f ? '#1D9BF0' : '#A1A1AA',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#71717A', fontSize: '15px' }}>
          <p>No created competitions found for this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEvents.map(ev => {
            const compStart = new Date(ev.startDate);
            const compEnd = new Date(ev.endDate);
            const now = new Date();
            
            let statusText = 'Upcoming';
            let statusColor = '#F59E0B';
            if (ev.resultStatus === 'PUBLISHED') {
              statusText = 'Results Published';
              statusColor = '#10B981';
            } else if (now > compEnd) {
              statusText = 'Completed';
              statusColor = '#6B7280';
            } else if (now >= compStart && now <= compEnd) {
              statusText = 'Live';
              statusColor = '#10B981';
            }

            return (
              <div key={ev.id} style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1F1F22', position: 'relative', flexShrink: 0 }}>
                    {ev.coverImage && <Image src={ev.coverImage} alt="Cover" fill style={{ objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link href={`/competitions/${ev.id}`} style={{ color: 'white', textDecoration: 'none' }}>
                      <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>{ev.name}</strong>
                    </Link>
                    <div style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '8px' }}>
                      {compStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#D4D4D8' }}>
                        {ev.entryFee > 0 ? 'Paid' : 'Free'}
                      </span>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: `${statusColor}20`, color: statusColor, fontWeight: 600 }}>
                        {statusText}
                      </span>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#D4D4D8' }}>
                        {ev._count?.registrations || 0} Participants
                      </span>
                    </div>
                  </div>
                </div>
                
                {isOwner && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                      <Link href={`/competitions/manage-participants/${ev.id}`} style={{ flex: 1, textAlign: 'center', padding: '10px 0', backgroundColor: '#1F1F22', color: '#FFF', border: '1px solid #3F3F46', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                        Manage Participants
                      </Link>
                      {(now > compEnd || ev.resultStatus === 'PUBLISHED') && (
                        <Link href={`/competitions/${ev.id}/results/manage`} style={{ flex: 1, textAlign: 'center', padding: '10px 0', backgroundColor: ev.resultStatus === 'PUBLISHED' ? '#10B981' : '#1D9BF0', color: '#FFF', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
                          {ev.resultStatus === 'PUBLISHED' ? 'View Results' : 'Manage Results'}
                        </Link>
                      )}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}