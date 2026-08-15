'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const geoTabs = ['International', 'National', 'State', 'District'];

export default function TopPeopleSection({ topPeople }: { topPeople: any[] }) {
  const [activeGeo, setActiveGeo] = useState('International');

  return (
    <div style={{ marginTop: '32px', marginBottom: '24px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#FFFFFF' }}>Top 10 people in your field</h2>
        <span style={{ fontSize: '14px', color: '#A1A1AA' }}>View all &gt;</span>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', width: '100%' }}>
        {geoTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveGeo(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 0 8px 0',
              color: activeGeo === tab ? '#FFFFFF' : '#A1A1AA',
              borderBottom: activeGeo === tab ? '2px solid #3B82F6' : '2px solid transparent',
              fontSize: '14px',
              fontWeight: activeGeo === tab ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
        {topPeople.slice(0, 4).map((person, index) => (
          <div key={person.id} style={{
            flexShrink: 0,
            width: '140px',
            backgroundColor: 'var(--surface-1)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '12px', left: '12px', color: index === 0 ? '#EAB308' : '#A1A1AA', fontWeight: 700 }}>
              #{index + 1}
            </div>
            {index === 0 && (
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                👑
              </div>
            )}
            
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#333', marginBottom: '12px', marginTop: '16px', flexShrink: 0 }}>
              {person.avatarData ? (
                <Image src={person.avatarData} alt={person.name || 'User'} width={60} height={60} style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>
                  {(person.name || 'U').charAt(0)}
                </div>
              )}
            </div>

            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {person.name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: '#A1A1AA', textAlign: 'center', marginBottom: '12px', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {person.personalProfile?.mainIdentity || 'Creator'}
            </div>

            <div style={{ padding: '4px 12px', border: '1px solid #3B82F6', borderRadius: '20px', color: '#3B82F6', fontSize: '12px', fontWeight: 600 }}>
              {Math.floor(10000 / (index + 1))} Points
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
