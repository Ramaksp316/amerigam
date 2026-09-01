'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProfileChallengesClient({ isOwner, challengesSent, challengesReceived }: { isOwner: boolean, challengesSent: any[], challengesReceived: any[] }) {
  const [filter, setFilter] = useState<'INCOMING' | 'SENT' | 'ACTIVE' | 'COMPLETED'>('ACTIVE');

  // Filter logic
  let filtered = [];
  if (filter === 'INCOMING') {
    filtered = challengesReceived.filter(c => c.status === 'PENDING');
  } else if (filter === 'SENT') {
    filtered = challengesSent.filter(c => c.status === 'PENDING');
  } else if (filter === 'ACTIVE') {
    filtered = [...challengesSent, ...challengesReceived].filter(c => ['ACCEPTED', 'ACTIVE', 'SUBMITTED'].includes(c.status));
  } else if (filter === 'COMPLETED') {
    filtered = [...challengesSent, ...challengesReceived].filter(c => ['COMPLETED', 'NOT_COMPLETED', 'EXPIRED'].includes(c.status));
  }

  // Deduplicate just in case
  filtered = filtered.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
        {['INCOMING', 'SENT', 'ACTIVE', 'COMPLETED'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              border: 'none',
              background: filter === f ? 'var(--accent-pink)' : '#18181B',
              color: filter === f ? 'white' : '#A1A1AA',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#71717A', marginTop: '40px' }}>
          No challenges found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(c => {
            const isSender = challengesSent.some(s => s.id === c.id);
            const otherPerson = isSender ? c.challenged : c.challenger;
            return (
              <Link key={c.id} href={`/challenge/${c.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#18181B', border: '1px solid #27272A', borderRadius: '12px', padding: '16px', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3F3F46', overflow: 'hidden' }}>
                        {otherPerson?.avatarData && <img src={otherPerson.avatarData} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>@{otherPerson?.username || otherPerson?.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#1D9BF0', background: 'rgba(29,155,240,0.1)', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      {c.status}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>{c.title}</h3>
                  <div style={{ display: 'flex', gap: '12px', color: '#A1A1AA', fontSize: '13px' }}>
                    <span>{c.difficulty}</span>
                    <span>•</span>
                    <span>{c.category || 'General'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
