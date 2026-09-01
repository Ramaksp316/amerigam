'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const geoTabs = ['International', 'National', 'State', 'District'];

export default function TopPeopleSection({ rankingData }: { rankingData: any }) {
  const [activeGeo, setActiveGeo] = useState('International');

  const displayedPeople = rankingData[activeGeo] || [];

  return (
    <div style={{ marginTop: '32px', marginBottom: '24px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>Top 10 people in your field</h2>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', width: '100%', borderBottom: '1px solid #1F1F22' }}>
        {geoTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveGeo(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 0 10px 0',
              color: activeGeo === tab ? '#EAB308' : '#A1A1AA',
              borderBottom: activeGeo === tab ? '2px solid #EAB308' : '2px solid transparent',
              fontSize: '14px',
              fontWeight: activeGeo === tab ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
        {displayedPeople.length === 0 && (
          <div style={{ color: '#71717A', fontSize: '14px', padding: '12px 0' }}>No ranked users for this region yet.</div>
        )}
        {displayedPeople.map((person: any, index: number) => {
          const rank = person.rank ?? (index + 1);
          return (
            <Link key={`${person.id}-${activeGeo}`} href={`/user/${person.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                flexShrink: 0,
                width: '130px',
                backgroundColor: '#0F1014',
                borderRadius: '16px',
                border: '1px solid #1F1F22',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', color: rank === 1 ? '#EAB308' : rank === 2 ? '#94A3B8' : rank === 3 ? '#B45309' : '#A1A1AA', fontWeight: 700, fontSize: '13px' }}>
                  #{rank}
                </div>
                {rank === 1 && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    🏆
                  </div>
                )}
                
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#27272A', marginBottom: '12px', marginTop: '16px', flexShrink: 0 }}>
                  {person.avatarData ? (
                    <Image src={person.avatarData} alt={person.name || 'User'} width={56} height={56} style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                      {(person.name || 'U').charAt(0)}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {person.name || 'User'}
                </div>
                <div style={{ fontSize: '11px', color: '#8BA3A6', textAlign: 'center', marginBottom: '12px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {person.personalProfile?.mainIdentity || 'Personal'}
                </div>

                <div style={{ padding: '4px 10px', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', color: '#10B981', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                  {person.amerigamPoints.toLocaleString()} AP
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
