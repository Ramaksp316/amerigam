'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Users, ChevronDown, ChevronUp } from 'lucide-react';
import ProfilePicture from './ProfilePicture';

export default function DesktopRightSidebar({
  currentUser,
  userRank = 1,
  joinedCommunities = [],
  activeFriends = []
}: {
  currentUser?: any;
  userRank?: number;
  joinedCommunities?: any[];
  activeFriends?: any[];
}) {
  const [communitiesExpanded, setCommunitiesExpanded] = useState(false);

  if (!currentUser) return null;

  // Real stats
  const ap = currentUser.amerigamPoints || 0;
  // Dynamic rating calculated proportionally from AP
  const rating = ap > 0 ? Math.min(9.9, +(5.0 + (ap / 600)).toFixed(1)) : '5.0';

  // Identity / role title
  const roleTitle = currentUser.creatorProfile?.creatorType || currentUser.personalProfile?.mainIdentity || 'Editor';

  // Communities slots logic: 4 primary slots
  const primaryCommunities = joinedCommunities.slice(0, 4);
  const remainingCommunities = joinedCommunities.slice(4);

  return (
    <aside
      className="layout-right desktop-only"
      style={{
        width: '246px',
        maxWidth: '250px',
        padding: '16px 8px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'sticky',
        top: '68px',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 75px)',
        overflowY: 'auto'
      }}
    >
      {/* ========================================================
          1. FIGMA USER STATUS CARD (226px x 196px matching Figma)
         ======================================================== */}
      <div
        style={{
          width: '226px',
          backgroundColor: '#212121',
          borderRadius: '22px',
          boxShadow: '0.3px 0.3px 1px rgba(255, 255, 255, 0.70) inset, 1px 1px 1.2px black',
          padding: '16px 14px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative'
        }}
      >
        {/* Top: Rainbow Avatar + (Role Title + 3 Stats) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar with Rainbow Ring matching Figma */}
          <Link href={`/user/${currentUser.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                padding: '2.5px',
                background: 'linear-gradient(135deg, #EC4899, #EF4444, #F59E0B, #10B981, #3B82F6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.25)'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#18181B'
                }}
              >
                <ProfilePicture user={currentUser} size={45} showStatus={false} />
              </div>
            </div>
          </Link>

          {/* User Role Title + 3 Stats Row */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link href={`/user/${currentUser.id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {roleTitle}
              </div>
            </Link>

            {/* 3 Real Stats Row */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>#{userRank}</span>{' '}
                <span style={{ fontSize: '9px', color: '#71717A' }}>Rank</span>
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{ap}</span>{' '}
                <span style={{ fontSize: '9px', color: '#71717A' }}>AP</span>
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{rating}</span>{' '}
                <span style={{ fontSize: '9px', color: '#71717A' }}>Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Separator / Your Communities Subheader */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#AEAEAE', fontWeight: 500, letterSpacing: '0.2px' }}>
              Your Communities
            </span>
            <Link
              href="/communities"
              style={{ fontSize: '10px', color: '#38BDF8', textDecoration: 'none', fontWeight: 500 }}
            >
              Explore
            </Link>
          </div>

          {/* Community Badges (33px circles) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[0, 1, 2, 3].map((slotIdx) => {
                const memberRecord = primaryCommunities[slotIdx];
                const comm = memberRecord?.community || memberRecord;

                if (comm) {
                  return (
                    <Link
                      key={comm.id || slotIdx}
                      href={`/communities/${comm.id}`}
                      title={comm.name}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        style={{
                          width: '33px',
                          height: '33px',
                          borderRadius: '50%',
                          backgroundColor: '#27272A',
                          border: '1.2px solid rgba(255, 255, 255, 0.2)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {comm.avatarData ? (
                          <img src={comm.avatarData} alt={comm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#FFF', fontSize: '11px', fontWeight: 700 }}>
                            {(comm.name || 'C')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                }

                if (slotIdx === primaryCommunities.length) {
                  return (
                    <Link
                      key="add-slot"
                      href="/communities"
                      title="Add or discover communities"
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        style={{
                          width: '33px',
                          height: '33px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(2, 132, 199, 0.12)',
                          border: '1.2px dashed rgba(2, 132, 199, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38BDF8',
                          flexShrink: 0
                        }}
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </div>
                    </Link>
                  );
                }

                return (
                  <div
                    key={`empty-${slotIdx}`}
                    style={{
                      width: '33px',
                      height: '33px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      flexShrink: 0
                    }}
                  />
                );
              })}
            </div>

            {/* Overlapping badge circles matching Figma */}
            <div style={{ position: 'relative', width: '38px', height: '33px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#A3E635',
                  position: 'absolute',
                  left: 0,
                  zIndex: 1,
                  border: '1.5px solid #212121',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: 800,
                  color: '#000'
                }}
              >
                {remainingCommunities[0]?.community?.name?.[0]?.toUpperCase() || ''}
              </div>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C7',
                  position: 'absolute',
                  left: '12px',
                  zIndex: 2,
                  border: '1.5px solid #212121',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: 800,
                  color: '#FFF'
                }}
              >
                {remainingCommunities[1]?.community?.name?.[0]?.toUpperCase() || ''}
              </div>
            </div>
          </div>

          {/* Slider line notch at bottom matching Figma (73px x 4px) */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
            <div
              style={{
                width: '73px',
                height: '4px',
                backgroundColor: '#3F3F46',
                borderRadius: '2px'
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          2. FIGMA ACTIVE FRIENDS CARD (226px x 296px)
         ======================================================== */}
      <div
        style={{
          width: '226px',
          backgroundColor: '#212121',
          borderRadius: '22px',
          boxShadow: '0.3px 0.3px 1px rgba(255, 255, 255, 0.70) inset, 1px 1px 1.2px black',
          padding: '16px 14px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
            Active Friends
          </span>
          <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>
            {activeFriends.length > 0 ? `${activeFriends.length} online` : 'Online'}
          </span>
        </div>

        {/* Friends List matching Figma */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeFriends.length > 0 ? (
            activeFriends.slice(0, 5).map((friend) => {
              const friendIdentity = friend.creatorProfile?.creatorType || friend.personalProfile?.mainIdentity || 'Creator';
              return (
                <Link
                  key={friend.id}
                  href={`/user/${friend.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    padding: '2px 0'
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <ProfilePicture user={friend} size={33} showStatus={false} />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        border: '1.5px solid #212121'
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {friend.name || friend.username}
                    </div>
                    <div style={{ fontSize: '10px', color: '#A1A1AA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {friendIdentity}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            /* Fallback Figma active friends previews */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '33px', height: '33px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700, fontSize: '12px' }}>A</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Aarav · Editor</div>
                  <div style={{ fontSize: '10px', color: '#A1A1AA' }}>Active now</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '33px', height: '33px', borderRadius: '50%', backgroundColor: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700, fontSize: '12px' }}>R</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Riya · Designer</div>
                  <div style={{ fontSize: '10px', color: '#A1A1AA' }}>Active now</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '33px', height: '33px', borderRadius: '50%', backgroundColor: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700, fontSize: '12px' }}>N</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Neel · Filmmaker</div>
                  <div style={{ fontSize: '10px', color: '#A1A1AA' }}>Active now</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Scroll Chevron at bottom */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#161616',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A1A1AA'
            }}
          >
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    </aside>
  );
}
