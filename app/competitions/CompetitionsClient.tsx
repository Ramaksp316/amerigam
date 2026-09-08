'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import CompetitionCard from './components/CompetitionCard';

type TabType = 'Following' | 'Top Competitions';

export default function CompetitionsClient({ 
  followingEvents, 
  suggestedEvents, 
  topEvents, 
  searchResults,
  initialSearchQuery,
  rankingData,
  currentUser,
  registeredEventIds
}: { 
  followingEvents: any[], 
  suggestedEvents: any[], 
  topEvents: any[], 
  searchResults?: any[],
  initialSearchQuery?: string,
  rankingData: any,
  currentUser: any,
  registeredEventIds: string[]
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Following');
  const [activeGeo, setActiveGeo] = useState('International');
  
  const [isSearching, setIsSearching] = useState(!!initialSearchQuery);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterCost, setFilterCost] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');

  const geoTabs = ['International', 'National', 'State', 'City', 'District'];

  // Handle search input changes with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== initialSearchQuery) {
        if (searchQuery) {
          router.push(`/competitions?q=${encodeURIComponent(searchQuery)}`);
        } else {
          router.push(`/competitions`);
        }
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, initialSearchQuery, router]);

  // If server provided search results, use them, otherwise combine loaded events for client-side fallback
  const sourceEvents = searchResults && searchResults.length > 0 
    ? searchResults 
    : Array.from(new Map([...followingEvents, ...suggestedEvents, ...topEvents].map(item => [item.id, item])).values());

  const filteredSearchEvents = sourceEvents.filter(ev => {
    let matches = true;
    if (filterCost === 'FREE') matches = matches && (ev.entryFee === 0 || ev.entryFee === null);
    if (filterCost === 'PAID') matches = matches && (ev.entryFee !== null && ev.entryFee > 0);
    if (filterMode === 'ONLINE') matches = matches && ev.locationType === 'ONLINE';
    if (filterMode === 'OFFLINE') matches = matches && ev.locationType === 'OFFLINE';
    return matches;
  });

  const isSearchActive = isSearching || isFiltering || searchQuery.trim() !== '' || filterCost !== 'ALL' || filterMode !== 'ALL';

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
        <Image src="/amerigam-logo-transparent.png" alt="Amerigam" width={32} height={14} style={{ mixBlendMode: 'screen' }} />
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', margin: 0, letterSpacing: '-0.3px' }}>Competitions</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Search size={22} color={isSearching ? "#1D9BF0" : "#FFFFFF"} cursor="pointer" onClick={() => setIsSearching(!isSearching)} />
          <SlidersHorizontal size={22} color={isFiltering ? "#1D9BF0" : "#FFFFFF"} cursor="pointer" onClick={() => setIsFiltering(!isFiltering)} />
        </div>
      </div>

      {isSearching && (
        <div style={{ padding: '0 20px 16px', animation: 'fadeIn 0.2s' }}>
          <input
            type="text"
            autoFocus
            placeholder="Search competitions by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #27272A', background: '#18181B', color: 'white', outline: 'none' }}
          />
        </div>
      )}

      {isFiltering && (
        <div style={{ padding: '0 20px 16px', animation: 'fadeIn 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'FREE', 'PAID'].map(cost => (
              <button key={cost} onClick={() => setFilterCost(cost as any)} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: filterCost === cost ? '#1D9BF0' : '#18181B', border: '1px solid #27272A', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>{cost}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'ONLINE', 'OFFLINE'].map(mode => (
              <button key={mode} onClick={() => setFilterMode(mode as any)} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: filterMode === mode ? '#1D9BF0' : '#18181B', border: '1px solid #27272A', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>{mode}</button>
            ))}
          </div>
        </div>
      )}

      {isSearchActive ? (
        <div style={{ width: '100%', padding: '0 20px' }}>
          <h2 style={{ fontSize: '16px', color: '#A1A1AA', marginBottom: '16px' }}>Search Results ({filteredSearchEvents.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredSearchEvents.map(event => (
              <CompetitionCard key={event.id} event={event} layout="horizontal-split" isRegistered={registeredEventIds.includes(event.id)} />
            ))}
          </div>
          {filteredSearchEvents.length === 0 && (
            <div style={{ color: '#A1A1AA', padding: '12px 0 16px', textAlign: 'center', width: '100%', fontSize: '14px' }}>
              No competitions found matching your search and filters.
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Main Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #1F1F22', padding: '0 20px', marginBottom: '24px', width: '100%' }}>
        {['Following', 'Top Competitions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: '14px 0',
              color: activeTab === tab ? '#FFFFFF' : '#71717A',
              borderBottom: activeTab === tab ? '2px solid #FFFFFF' : '2px solid transparent',
              fontSize: '15px',
              fontWeight: activeTab === tab ? 700 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.2px'
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
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>From organizations you follow</h2>
              {followingEvents.length > 0 && (
                <Link href="/competitions/following" style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                  View all &gt;
                </Link>
              )}
            </div>
            
            {followingEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                {followingEvents.slice(0, 2).map(event => (
                  <CompetitionCard key={event.id} event={event} layout="horizontal-split" isRegistered={registeredEventIds.includes(event.id)} />
                ))}
              </div>
            ) : (
              <div style={{ color: '#A1A1AA', padding: '12px 0 16px', textAlign: 'left', width: '100%', fontSize: '14px' }}>
                No competitions from followed organizations yet.
              </div>
            )}
            {/* Added Suggested into Following per C3/C4 */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>Suggested competitions</h2>
                <Link href="/competitions/suggested" style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                  View all &gt;
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
                {suggestedEvents.slice(0, 5).map(event => (
                  <div key={event.id} style={{ flexShrink: 0 }}>
                    <CompetitionCard event={event} layout="vertical-split" isRegistered={registeredEventIds.includes(event.id)} />
                  </div>
                ))}
              </div>
            </div>

            
          </div>
        )}

        {/* TOP COMPETITIONS TAB */}
        {activeTab === 'Top Competitions' && (
          <div style={{ animation: 'fadeIn 0.3s', width: '100%' }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>From organizations you follow</h2>
              <Link href="/competitions/following" style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                View all &gt;
              </Link>
            </div>
            {/* Horizontal Scroll Carousel */}
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
              {followingEvents.length > 0 ? (
                followingEvents.slice(0, 2).map(event => (
                  <div key={event.id} style={{ flexShrink: 0 }}>
                    <CompetitionCard event={event} layout="vertical-overlay" isRegistered={registeredEventIds.includes(event.id)} />
                  </div>
                ))
              ) : (
                <div style={{ color: '#A1A1AA', fontSize: '14px', width: '100%' }}>
                  No competitions from followed organizations yet.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>Top Competitions</h2>
              <Link href={`/competitions/top?scope=${activeGeo}`} style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                View all &gt;
              </Link>
            </div>
            
            {/* Horizontal Scroll Carousel for Geo Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
              {geoTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveGeo(tab)}
                  style={{
                    background: activeGeo === tab ? '#2563EB' : '#111111',
                    border: activeGeo === tab ? '1px solid #3B82F6' : '1px solid #1F1F22',
                    padding: '8px 16px',
                    color: activeGeo === tab ? '#FFFFFF' : '#A1A1AA',
                    borderRadius: '24px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: activeGeo === tab ? '0 2px 8px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Horizontal Scroll Carousel for Events */}
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', msOverflowStyle: 'none', scrollbarWidth: 'none', width: '100%' }}>
              {topEvents.filter(e => e.eventLevel.toUpperCase() === activeGeo.toUpperCase()).slice(0, 10).map(event => (
                <div key={event.id} style={{ flexShrink: 0 }}>
                  <CompetitionCard event={event} layout="vertical-overlay" isRegistered={registeredEventIds.includes(event.id)} />
                </div>
              ))}
              {/* Fallback if no matching geo */}
              {topEvents.filter(e => e.eventLevel.toUpperCase() === activeGeo.toUpperCase()).length === 0 && (
                <div style={{ color: '#A1A1AA', padding: '20px 0', width: '100%', textAlign: 'center', fontSize: '14px' }}>No top competitions found for {activeGeo}.</div>
              )}
            </div>
          </div>
        )}
      </div>
      </>
      )}

      <style jsx global>{`
        /* Hide scrollbar for webkit */
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
