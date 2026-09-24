'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  // Communities slots logic: 4 primary slots
  const primaryCommunities = joinedCommunities.slice(0, 4);
  const remainingCommunities = joinedCommunities.slice(4);

  return (
    <div
      className="layout-right desktop-only"
      style={{
        width: '265px',
        maxWidth: '270px',
        padding: '16px 12px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* ========================================================
          1. REAL PROFILE HIGHLIGHTS & COMMUNITIES BOARD
         ======================================================== */}
      <div
        style={{
          backgroundColor: '#16181C',
          borderRadius: '20px',
          padding: '18px 16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          position: 'relative'
        }}
      >
        {/* Top: High-Clarity Profile Picture + Real Username + Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* HD Profile Picture (No glow, crisp clean border) */}
          <Link href={`/user/${currentUser.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: '1.5px solid rgba(255, 255, 255, 0.22)',
                backgroundColor: '#1E1E22',
                overflow: 'hidden',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
              }}
            >
              {currentUser.avatarData ? (
                <img
                  src={currentUser.avatarData}
                  alt={currentUser.name || currentUser.username || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ProfilePicture user={currentUser} size={52} showStatus={false} />
              )}
            </div>
          </Link>

          {/* User Info & 3 Real Stats */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/user/${currentUser.id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                @{currentUser.username || 'user'}
              </div>
            </Link>
            {currentUser.name && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#A1A1AA',
                  marginTop: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentUser.name}
              </div>
            )}

            {/* 3 Real Stats: Rank, AP, Rating */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: '1' }}>
                  #{userRank}
                </div>
                <div style={{ fontSize: '10px', color: '#71717A', marginTop: '2px', fontWeight: 500 }}>
                  Rank
                </div>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: '1' }}>
                  {ap}
                </div>
                <div style={{ fontSize: '10px', color: '#71717A', marginTop: '2px', fontWeight: 500 }}>
                  AP
                </div>
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: '1' }}>
                  {rating}
                </div>
                <div style={{ fontSize: '10px', color: '#71717A', marginTop: '2px', fontWeight: 500 }}>
                  Rating
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '18px 0 14px 0' }} />

        {/* "Your Communities" Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.2px' }}>
            Your Communities
          </span>
          <Link
            href="/communities"
            style={{ fontSize: '11px', color: '#1D9BF0', textDecoration: 'none', fontWeight: 500 }}
          >
            Explore
          </Link>
        </div>

        {/* Communities Circular Dots Row matching Figma */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Primary circles (up to 4) */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#27272A',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'transform 0.15s ease'
                      }}
                      className="community-bubble-hover"
                    >
                      {comm.avatarData ? (
                        <img src={comm.avatarData} alt={comm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#FFF', fontSize: '12px', fontWeight: 700 }}>
                          {(comm.name || 'C')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              }

              // If slot is the one right after joined communities: show Plus Add button
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
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(29, 155, 240, 0.12)',
                        border: '1.5px dashed rgba(29, 155, 240, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1D9BF0',
                        flexShrink: 0
                      }}
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </div>
                  </Link>
                );
              }

              // Empty slot placeholder
              return (
                <div
                  key={`empty-${slotIdx}`}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    flexShrink: 0
                  }}
                />
              );
            })}
          </div>

          {/* 3 Overlapping colorful circles from Figma */}
          <div style={{ position: 'relative', width: '56px', height: '34px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#A3E635',
                position: 'absolute',
                left: 0,
                zIndex: 1,
                border: '1.5px solid #16181C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 800,
                color: '#000'
              }}
            >
              {remainingCommunities[0]?.community?.name?.[0]?.toUpperCase() || ''}
            </div>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#16A34A',
                position: 'absolute',
                left: '12px',
                zIndex: 2,
                border: '1.5px solid #16181C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 800,
                color: '#FFF'
              }}
            >
              {remainingCommunities[1]?.community?.name?.[0]?.toUpperCase() || ''}
            </div>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#1D4ED8',
                position: 'absolute',
                left: '24px',
                zIndex: 3,
                border: '1.5px solid #16181C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 800,
                color: '#FFF'
              }}
            >
              {remainingCommunities[2]?.community?.name?.[0]?.toUpperCase() || ''}
            </div>
          </div>
        </div>

        {/* Expandable Communities Vertical Drawer */}
        {communitiesExpanded && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {joinedCommunities.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#71717A', textAlign: 'center', padding: '10px 0' }}>
                You haven&apos;t joined any communities yet.{' '}
                <Link href="/communities" style={{ color: '#1D9BF0', textDecoration: 'none' }}>
                  Explore communities
                </Link>
              </div>
            ) : (
              joinedCommunities.map((item, idx) => {
                const comm = item.community || item;
                return (
                  <Link
                    key={comm.id || idx}
                    href={`/communities/${comm.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      textDecoration: 'none',
                      padding: '6px 8px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      transition: 'background 0.15s ease'
                    }}
                    className="menu-item-hover"
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#27272A',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {comm.avatarData ? (
                        <img src={comm.avatarData} alt={comm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '11px', fontWeight: 700 }}>
                          {(comm.name || 'C')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comm.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#71717A' }}>
                        {comm._count?.members || 1} members
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* Interactive Expand Handle Line at bottom of board */}
        <button
          onClick={() => setCommunitiesExpanded(!communitiesExpanded)}
          title={communitiesExpanded ? 'Collapse communities' : 'Click to expand communities list'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            margin: '18px auto 0 auto',
            padding: '4px 12px',
            color: '#71717A',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
        >
          <div
            style={{
              width: '48px',
              height: '4px',
              backgroundColor: communitiesExpanded ? '#1D9BF0' : '#3F3F46',
              borderRadius: '2px',
              transition: 'background 0.2s ease'
            }}
          />
          {communitiesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ========================================================
          2. ACTIVE FRIENDS BOARD (Real online/active users)
         ======================================================== */}
      <div
        style={{
          backgroundColor: '#16181C',
          borderRadius: '24px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header with Green Pulse Dot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px #10B981'
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
              Active Friends
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#71717A', fontWeight: 600 }}>
            {activeFriends.length} online
          </span>
        </div>

        {/* Active Friends List or Clean Empty State */}
        {activeFriends.length === 0 ? (
          <div
            style={{
              padding: '18px 12px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}
          >
            <Users size={24} style={{ color: '#71717A', marginBottom: '6px' }} />
            <div style={{ fontSize: '13px', color: '#A1A1AA', fontWeight: 500 }}>
              No friends currently active
            </div>
            <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>
              When friends come online, they appear here
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeFriends.map((friend) => (
              <Link
                key={friend.id}
                href={`/user/${friend.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  padding: '6px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  transition: 'background 0.15s ease'
                }}
                className="menu-item-hover"
              >
                {/* Avatar with Green Dot */}
                <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: '#27272A',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    {friend.avatarData ? (
                      <img src={friend.avatarData} alt={friend.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '13px', fontWeight: 700 }}>
                        {(friend.name || friend.username || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      border: '2px solid #16181C'
                    }}
                  />
                </div>

                {/* Name & Username */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {friend.name || friend.username}
                  </div>
                  <div style={{ fontSize: '11px', color: '#71717A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{friend.username}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
