'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Calendar, MapPin, Trophy } from 'lucide-react';

export default function CompetitionsClient({
  followingEvents = [],
  suggestedEvents = [],
  topEvents = [],
  searchResults = [],
  initialSearchQuery = '',
  currentUser,
  registeredEventIds = []
}: {
  followingEvents?: any[];
  suggestedEvents?: any[];
  topEvents?: any[];
  searchResults?: any[];
  initialSearchQuery?: string;
  rankingData?: any;
  currentUser?: any;
  registeredEventIds?: string[];
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Gather all unique real events from database
  const allEventsList = [
    ...(searchResults && searchResults.length > 0 ? searchResults : []),
    ...(topEvents || []),
    ...(suggestedEvents || []),
    ...(followingEvents || [])
  ];

  const uniqueEventsMap = new Map();
  allEventsList.forEach((e) => {
    if (e && e.id && !uniqueEventsMap.has(e.id)) {
      uniqueEventsMap.set(e.id, e);
    }
  });
  const realEvents = Array.from(uniqueEventsMap.values());

  const figmaNamesOrder = [
    'Behind You - Running RR',
    'Behind You',
    'Tried-Jump',
    'WAR-E-Man',
    'Trocfy'
  ];

  const sortedRealEvents = [...realEvents].sort((a, b) => {
    const aIndex = figmaNamesOrder.findIndex(name => (a.name || '').toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes((a.name || '').toLowerCase()));
    const bIndex = figmaNamesOrder.findIndex(name => (b.name || '').toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes((b.name || '').toLowerCase()));
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  const fallbackPosters = [
    '/images/competitions/poster_comp_1.png',
    '/images/competitions/poster_comp_2.png',
    '/images/competitions/poster_comp_3.png',
    '/images/competitions/poster_comp_4.png'
  ];

  const formatEventCard = (e: any, index: number) => {
    const lowerName = (e.name || '').toLowerCase();
    
    // Explicit exact Figma match overrides for the 4 flagship competitions
    if (lowerName.includes('behind you')) {
      return {
        id: e.id,
        title: 'Behind You - Running...',
        date: 'SEP 8 2026 7:00AM',
        location: 'SURAT',
        prize: 'AP 150-$50',
        prizeLabel: '/ Winner price',
        posterSrc: '/images/competitions/poster_comp_1.png',
        hasCoverImage: true
      };
    }
    if (lowerName.includes('tried-jump')) {
      return {
        id: e.id,
        title: 'Tried-Jump',
        date: 'OCT 11 2026 9:00AM',
        location: 'AHMEDABAD',
        prize: 'AP 100-$20',
        prizeLabel: '/ Winner price',
        posterSrc: '/images/competitions/poster_comp_2.png',
        hasCoverImage: true
      };
    }
    if (lowerName.includes('war-e-man')) {
      return {
        id: e.id,
        title: 'WAR-E-Man',
        date: 'SEP 8 2026 8:00AM',
        location: 'SURAT',
        prize: 'AP 250-$60',
        prizeLabel: '/ Winner price',
        posterSrc: '/images/competitions/poster_comp_3.png',
        hasCoverImage: true
      };
    }
    if (lowerName.includes('trocfy')) {
      return {
        id: e.id,
        title: 'Trocfy',
        date: 'SEP 8 2026 7:00AM',
        location: 'SURAT',
        prize: 'AP 150-$50',
        prizeLabel: '/ Winner price',
        posterSrc: '/images/competitions/poster_comp_4.png',
        hasCoverImage: true
      };
    }

    const startDate = e.startDate ? new Date(e.startDate) : new Date();
    const formattedDate = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
    const formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(' ', '');

    const locationStr = (e.city || (e.venue ? e.venue.split(',')[0] : 'SURAT') || 'SURAT').toUpperCase();
    const rawPrize = e.prizePool ? e.prizePool.split('\n')[0].trim() : '';
    const prizeStr = rawPrize || (e.entryFee && e.entryFee > 0 ? `AP ${e.entryFee * 3}-$${e.entryFee}` : 'AP 150-$50');
    const posterSrc = e.coverImage || fallbackPosters[index % fallbackPosters.length];

    return {
      id: e.id,
      title: e.name || 'Amerigam Championship',
      date: `${formattedDate} ${formattedTime}`,
      location: locationStr,
      prize: prizeStr,
      prizeLabel: '/ Winner price',
      posterSrc: posterSrc,
      hasCoverImage: !!e.coverImage
    };
  };

  // 1. Featured cards: first 4 real events (Figma flagship events first)
  const featuredCompetitions = sortedRealEvents.slice(0, 4).map((e, i) => formatEventCard(e, i));

  // 2. Other cards: next real events from database
  const otherCompetitions = sortedRealEvents.slice(4, 12).map((e, i) => formatEventCard(e, i + 4));

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px',
      overflowX: 'hidden'
    }}>
          
          {/* 1. TOP CENTER SEARCH PILL (Exact Figma match) */}
          <div style={{
            height: '64px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            backgroundColor: '#000000',
            zIndex: 40
          }}>
            <div style={{
              width: '440px',
              maxWidth: '100%',
              height: '38px',
              borderRadius: '999px',
              backgroundColor: '#18181B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '10px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
            }}>
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <Search size={16} color="#A1A1AA" style={{ flexShrink: 0 }} />
            </div>
          </div>

          {/* MAIN PAGE BODY */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* ========================================================
                SECTION 1: "Competition for you"
               ======================================================== */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: '0 0 16px 0',
                letterSpacing: '-0.2px'
              }}>
                Competition for you
              </h2>

              {/* 4 Cards Grid with Visual Depth & Chamak */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '14px'
              }}>
                {featuredCompetitions.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/competitions/${comp.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      backgroundColor: '#18181B',
                      borderRadius: '22px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 14px 32px rgba(0, 0, 0, 0.7)',
                      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 18px 42px rgba(0, 0, 0, 0.9), 0 0 20px rgba(197, 248, 42, 0.18)';
                      e.currentTarget.style.borderColor = 'rgba(197, 248, 42, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 14px 32px rgba(0, 0, 0, 0.7)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                    >
                      {/* Top Poster Image (Exact from Figma) */}
                      <div style={{
                        width: '100%',
                        aspectRatio: '135 / 185',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#111113'
                      }}>
                        <img
                          src={comp.posterSrc}
                          alt={comp.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        {/* Amerigam Watermark icon in top-right */}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          opacity: 0.9,
                          zIndex: 2,
                          pointerEvents: 'none'
                        }}>
                          <img
                            src="/amerigam-logo-transparent.png"
                            alt="logo"
                            style={{ width: '22px', height: '12px', objectFit: 'contain' }}
                          />
                        </div>
                      </div>

                      {/* Bottom Meta Content */}
                      <div style={{
                        padding: '12px 14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        {/* Date & Location Row (Neon Lime) */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '10px',
                          fontWeight: 700
                        }}>
                          <span style={{
                            color: '#C5F82A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            letterSpacing: '0.02em',
                            textShadow: '0 0 8px rgba(197, 248, 42, 0.3)'
                          }}>
                            📅 {comp.date}
                          </span>
                          <span style={{
                            color: '#A1A1AA',
                            fontSize: '9px',
                            fontWeight: 600,
                            letterSpacing: '0.03em'
                          }}>
                            📍 {comp.location}
                          </span>
                        </div>

                        {/* Title */}
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          lineHeight: '1.25',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '2px'
                        }}>
                          {comp.title}
                        </div>

                        {/* Prize Row (Neon Lime) */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 800,
                          marginTop: '2px'
                        }}>
                          <span style={{
                            color: '#C5F82A',
                            textShadow: '0 0 8px rgba(197, 248, 42, 0.3)'
                          }}>
                            {comp.prize}
                          </span>
                          <span style={{
                            color: '#71717A',
                            fontSize: '10px',
                            fontWeight: 500
                          }}>
                            {comp.prizeLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ========================================================
                SECTION 2: "Other Competition" (Exact match to Figma media_1789994884346.png)
               ======================================================== */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: '0 0 16px 0',
                letterSpacing: '-0.2px'
              }}>
                Other Competition
              </h2>

              {/* 4 Charcoal Skeleton Placeholder Cards matching Figma */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '14px'
              }}>
                {[0, 1, 2, 3].map((idx) => {
                  const linkedComp = otherCompetitions[idx] || featuredCompetitions[idx];
                  const linkHref = linkedComp?.id ? `/competitions/${linkedComp.id}` : '#';

                  return (
                    <Link
                      key={idx}
                      href={linkHref}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        style={{
                          backgroundColor: '#1E1E22',
                          borderRadius: '22px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 14px 32px rgba(0, 0, 0, 0.7)',
                          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 18px 42px rgba(0, 0, 0, 0.9), 0 0 20px rgba(197, 248, 42, 0.15)';
                          e.currentTarget.style.borderColor = 'rgba(197, 248, 42, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 14px 32px rgba(0, 0, 0, 0.7)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                      >
                        {/* Dark Charcoal Top Poster Box matching Figma */}
                        <div style={{
                          width: '100%',
                          aspectRatio: '135 / 185',
                          position: 'relative',
                          backgroundColor: '#3E3E42',
                          overflow: 'hidden'
                        }}>
                          {/* Corner Amerigam watermark icon */}
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            opacity: 0.9,
                            zIndex: 2,
                            pointerEvents: 'none'
                          }}>
                            <img
                              src="/amerigam-logo-transparent.png"
                              alt="logo"
                              style={{ width: '22px', height: '12px', objectFit: 'contain' }}
                            />
                          </div>
                        </div>

                        {/* Bottom Skeleton Content matching Figma */}
                        <div style={{
                          padding: '12px 14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          backgroundColor: '#1E1E22'
                        }}>
                          {/* Date & Location Skeleton Line Row */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '10px' }}>📅</span>
                              <div style={{
                                width: '58px',
                                height: '3px',
                                backgroundColor: '#C5F82A',
                                borderRadius: '999px',
                                boxShadow: '0 0 6px rgba(197, 248, 42, 0.4)'
                              }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '9px' }}>📍</span>
                              <div style={{
                                width: '26px',
                                height: '3px',
                                backgroundColor: '#52525B',
                                borderRadius: '999px'
                              }} />
                            </div>
                          </div>

                          {/* Title Skeleton Line */}
                          <div style={{
                            width: '80px',
                            height: '3.5px',
                            backgroundColor: 'rgba(255, 255, 255, 0.85)',
                            borderRadius: '999px',
                            margin: '4px 0 2px'
                          }} />

                          {/* Prize Row matching Figma: AP ______ / Winner price */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            marginTop: '2px'
                          }}>
                            <span style={{
                              color: '#C5F82A',
                              textShadow: '0 0 8px rgba(197, 248, 42, 0.3)',
                              letterSpacing: '0.02em'
                            }}>
                              AP <span style={{ textDecoration: 'underline', letterSpacing: '2px' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            </span>
                            <span style={{
                              color: '#71717A',
                              fontSize: '10px',
                              fontWeight: 500
                            }}>
                              / Winner price
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
    </div>
  );
}
