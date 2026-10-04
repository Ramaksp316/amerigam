'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, MapPin, X, ChevronDown } from 'lucide-react';
import { CompetitionCardData } from './page';

export default function CompetitionsClient({
  forYouCompetitions = [],
  otherCompetitions = [],
  allCompetitions = [],
  userId
}: {
  forYouCompetitions: CompetitionCardData[];
  otherCompetitions: CompetitionCardData[];
  allCompetitions: CompetitionCardData[];
  userId: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleForYouLines, setVisibleForYouLines] = useState(1); // 1 line = 4 cards
  const [visibleOtherLines, setVisibleOtherLines] = useState(1);   // 1 line = 4 cards

  // Search filtering
  const query = searchQuery.trim().toLowerCase();
  const searchResults = query
    ? allCompetitions.filter(c =>
        c.title.toLowerCase().includes(query) ||
        (c.category && c.category.toLowerCase().includes(query)) ||
        c.location.toLowerCase().includes(query)
      )
    : null;

  // Sliced items according to visible lines
  const displayedForYou = forYouCompetitions.slice(0, visibleForYouLines * 4);
  const displayedOther = otherCompetitions.slice(0, visibleOtherLines * 4);

  const renderCard = (comp: CompetitionCardData) => (
    <Link
      key={comp.id}
      href={`/competitions/${comp.id}`}
      style={{
        width: '176px',
        height: '321px',
        backgroundColor: '#212121',
        borderRadius: '22px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: '0.3px 0.3px 1px rgba(255, 255, 255, 0.3) inset, 0.7px 0.5px 1.2px black',
        transition: 'transform 0.15s ease, filter 0.15s ease',
        flexShrink: 0
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.filter = 'brightness(1.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
    >
      {/* Poster Image 176x234 matching exact Figma dimensions */}
      <div style={{
        width: '176px',
        height: '234px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#161616',
        flexShrink: 0
      }}>
        <img
          src={comp.poster}
          alt={comp.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Top-Right Watermark Logo */}
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
            style={{ width: '18px', height: '10px', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Bottom Meta Content (Exact Figma Typography & Colors) */}
      <div style={{
        padding: '10px 10px 12px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        boxSizing: 'border-box'
      }}>
        {/* Row 1: Date & Location */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Calendar size={9} color="#D2FE0F" />
            <span style={{
              color: '#D2FE0F',
              fontSize: '8px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              whiteSpace: 'nowrap'
            }}>
              {comp.date}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <MapPin size={8} color="#CDCDCD" />
            <span style={{
              color: '#CDCDCD',
              fontSize: '6px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              whiteSpace: 'nowrap',
              textTransform: 'uppercase'
            }}>
              {comp.location}
            </span>
          </div>
        </div>

        {/* Row 2: Title */}
        <div style={{
          color: '#FFFFFF',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          lineHeight: '1.25',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: '4px'
        }}>
          {comp.title}
        </div>

        {/* Row 3: AP Prize */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <span style={{
            color: '#D2FE0F',
            fontSize: '8px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700
          }}>
            {comp.prize}
          </span>
          <span style={{
            color: '#CDCDCD',
            fontSize: '6px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400
          }}>
            /winner price
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingBottom: '40px',
      boxSizing: 'border-box'
    }}>

      {/* ========================================================
          TOP SEARCH BAR (Exact Figma: width 772px, height 38px, borderRadius 33px)
         ======================================================== */}
      <div style={{
        width: '100%',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '772px',
          maxWidth: '100%',
          height: '38px',
          backgroundColor: '#212121',
          borderRadius: '33px',
          boxShadow: '0.1px 0.03px 0.2px white inset, 0.7px 0.5px 1.2px black',
          outline: '1px #454545 solid',
          outlineOffset: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: '12px',
          boxSizing: 'border-box'
        }}>
          <Search size={15} color="#CDCDCD" style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search competitions, venues, or categories..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              width: '100%',
              outline: 'none',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#AFAFAF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          MAIN CONTENT AREA (Strictly 772px wide matching Figma blueprint)
         ======================================================== */}
      <div style={{
        width: '772px',
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>

        {/* SEARCH RESULTS VIEW */}
        {searchResults ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{
                color: 'white',
                fontSize: '15px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 200,
                margin: 0
              }}>
                Search Results ({searchResults.length})
              </h2>
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#D2FE0F', fontSize: '12px', cursor: 'pointer' }}
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: '#212121',
                borderRadius: '22px',
                color: '#AFAFAF',
                fontSize: '14px'
              }}>
                No competitions found matching &quot;{searchQuery}&quot;. Try another search!
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 176px)',
                gap: '16px 22px',
                justifyContent: 'center'
              }}>
                {searchResults.map(renderCard)}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ========================================================
                SECTION 1: "Competition for you" (Matching Profession)
                Exact Figma: fontSize 15, fontWeight 200, color white
                Grid: 4 Columns x 176px, gap 16px vertical, 22px horizontal
               ======================================================== */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 200,
                  margin: 0,
                  wordWrap: 'break-word'
                }}>
                  Competition for you
                </h2>

                {forYouCompetitions.length > displayedForYou.length && (
                  <button
                    onClick={() => setVisibleForYouLines(prev => prev + 3)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '3px 12px',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                  >
                    More <ChevronDown size={12} />
                  </button>
                )}
              </div>

              {displayedForYou.length === 0 ? (
                <div style={{
                  padding: '30px',
                  textAlign: 'center',
                  background: '#212121',
                  borderRadius: '22px',
                  color: '#AFAFAF',
                  fontSize: '13px'
                }}>
                  No profession-matched competitions at the moment. Explore other competitions below!
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 176px)',
                  gap: '16px 22px',
                  justifyContent: 'center'
                }}>
                  {displayedForYou.map(renderCard)}
                </div>
              )}
            </div>

            {/* ========================================================
                SECTION 2: "Other Competition" (Matching Hobbies & General)
                Exact Figma: fontSize 15, fontWeight 200, color white
                Grid: 4 Columns x 176px, gap 16px vertical, 22px horizontal
               ======================================================== */}
            <div style={{ marginTop: '28px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 200,
                  margin: 0,
                  wordWrap: 'break-word'
                }}>
                  Other Competition
                </h2>

                {otherCompetitions.length > displayedOther.length && (
                  <button
                    onClick={() => setVisibleOtherLines(prev => prev + 3)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '3px 12px',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                  >
                    More <ChevronDown size={12} />
                  </button>
                )}
              </div>

              {displayedOther.length === 0 ? (
                <div style={{
                  padding: '30px',
                  textAlign: 'center',
                  background: '#212121',
                  borderRadius: '22px',
                  color: '#AFAFAF',
                  fontSize: '13px'
                }}>
                  No other competitions available currently.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 176px)',
                  gap: '16px 22px',
                  justifyContent: 'center'
                }}>
                  {displayedOther.map(renderCard)}
                </div>
              )}

              {/* Bottom "More" Button that expands by 3 lines (12 cards) */}
              {otherCompetitions.length > displayedOther.length && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => setVisibleOtherLines(prev => prev + 3)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '8px 28px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background 0.2s ease, transform 0.1s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                  >
                    More Competitions <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
