'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, SlidersHorizontal } from 'lucide-react';
import CompetitionCard from './components/CompetitionCard';
import TopPeopleSection from './components/TopPeopleSection';

type TabType = 'Following' | 'Suggested' | 'Top Competitions';

export default function CompetitionsClient({ 
  followingEvents, 
  suggestedEvents, 
  topEvents, 
  topPeople,
  currentUser,
  registeredEventIds
}: { 
  followingEvents: any[], 
  suggestedEvents: any[], 
  topEvents: any[], 
  topPeople: any[],
  currentUser: any,
  registeredEventIds: string[]
}) {
  const [activeTab, setActiveTab] = useState<TabType>('Following');
  const [activeGeo, setActiveGeo] = useState('International');

  const geoTabs = ['International', 'National', 'State', 'City', 'District'];

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <Image src="/amerigam-logo-transparent.png" alt="Amerigam" width={32} height={14} style={{ mixBlendMode: 'screen' }} />
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Competitions</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Search size={22} color="#FFFFFF" />
          <SlidersHorizontal size={22} color="#FFFFFF" />
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #27272A', padding: '0 20px', marginBottom: '24px', width: '100%' }}>
        {['Following', 'Suggested', 'Top Competitions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: '12px 0',
              color: activeTab === tab ? '#FFFFFF' : '#A1A1AA',
              borderBottom: activeTab === tab ? '2px solid #FFFFFF' : '2px solid transparent',
              fontSize: '15px',
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'Top Competitions' ? 'Top 10' : tab}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', padding: '0 20px' }}>
        {/* FOLLOWING TAB */}
        {activeTab === 'Following' && (
          <div style={{ animation: 'fadeIn 0.3s', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#FFFFFF' }}>From organizations you follow</h2>
              <span style={{ fontSize: '14px', color: '#3B82F6' }}>View all &gt;</span>
            </div>
            
            {followingEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                {followingEvents.map(event => (
                  <CompetitionCard key={event.id} event={event} layout="horizontal-split" isRegistered={registeredEventIds.includes(event.id)} />
                ))}
              </div>
            ) : (
              <div style={{ color: '#A1A1AA', padding: '32px 0', textAlign: 'center', width: '100%' }}>
                Follow more Competition Organizations to see their events here.
              </div>
            )}

            <TopPeopleSection topPeople={topPeople} />
          </div>
        )}

        {/* SUGGESTED TAB */}
        {activeTab === 'Suggested' && (
          <div style={{ animation: 'fadeIn 0.3s', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#FFFFFF' }}>Suggested competitions</h2>
              <span style={{ fontSize: '14px', color: '#A1A1AA' }}>View all &gt;</span>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
              {suggestedEvents.slice(0, 5).map(event => (
                <div key={event.id} style={{ flexShrink: 0 }}>
                  <CompetitionCard event={event} layout="vertical-split" isRegistered={registeredEventIds.includes(event.id)} />
                </div>
              ))}
            </div>

            <TopPeopleSection topPeople={topPeople} />
          </div>
        )}

        {/* TOP COMPETITIONS TAB */}
        {activeTab === 'Top Competitions' && (
          <div style={{ animation: 'fadeIn 0.3s', width: '100%' }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#FFFFFF' }}>From organizations you follow</h2>
              <span style={{ fontSize: '14px', color: '#3B82F6' }}>View all &gt;</span>
            </div>
            {/* Horizontal Scroll Carousel */}
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
              {followingEvents.slice(0, 2).map(event => (
                <div key={event.id} style={{ flexShrink: 0 }}>
                  <CompetitionCard event={event} layout="vertical-overlay" isRegistered={registeredEventIds.includes(event.id)} />
                </div>
              ))}
              {followingEvents.length === 0 && topEvents.slice(0, 2).map(event => (
                 <div key={event.id} style={{ flexShrink: 0 }}>
                   <CompetitionCard event={event} layout="vertical-overlay" isRegistered={registeredEventIds.includes(event.id)} />
                 </div>
              ))}
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', color: '#FFFFFF' }}>Top Competitions</h2>
            
            {/* Horizontal Scroll Carousel for Geo Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
              {geoTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveGeo(tab)}
                  style={{
                    background: activeGeo === tab ? '#3B82F6' : '#18181B',
                    border: '1px solid #27272A',
                    padding: '8px 16px',
                    color: activeGeo === tab ? '#FFFFFF' : '#A1A1AA',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Horizontal Scroll Carousel for Events */}
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
              {topEvents.filter(e => e.eventLevel.toUpperCase() === activeGeo.toUpperCase()).slice(0, 5).map(event => (
                <div key={event.id} style={{ flexShrink: 0 }}>
                  <CompetitionCard event={event} layout="vertical-overlay" isRegistered={registeredEventIds.includes(event.id)} />
                </div>
              ))}
              {/* Fallback if no matching geo */}
              {topEvents.filter(e => e.eventLevel.toUpperCase() === activeGeo.toUpperCase()).length === 0 && (
                <div style={{ color: '#A1A1AA', padding: '20px 0', width: '100%', textAlign: 'center' }}>No top competitions found for {activeGeo}.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Hide scrollbar for webkit */
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
