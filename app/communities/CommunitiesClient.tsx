'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, Plus, X, Users, Upload, Check, Loader2, Sparkles } from 'lucide-react';
import { toggleJoinCommunity, createCommunity } from './actions';
import FloatingBottomNav from '../components/FloatingBottomNav';

export interface CommunityItem {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  avatarData?: string | null;
  memberCount: number;
  isJoined?: boolean;
}

const TOP_COLORS = [
  '#9E2121', // Card 1 Crimson
  '#773434', // Card 2 Rust
  '#2D9330', // Card 3 Emerald Green
  '#1C9E80', // Card 4 Teal
  'rgba(193.70, 33.53, 110.94, 0.70)', // Card 5 Deep Rose/Magenta
  '#B98E31', // Card 6 Gold
  '#230B4D', // Card 7 Deep Violet/Purple
  '#A64917'  // Card 8 Burnt Orange
];

const SUGGESTED_COLORS = [
  '#3E6851', // Card 1 Muted Forest Green
  '#2E6181', // Card 2 Deep Ocean Blue
  '#473156', // Card 3 Plum Purple
  '#27462D'  // Card 4 Deep Moss Green
];

const DEFAULT_COMMUNITY_DP = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80';

export default function CommunitiesClient({
  userId,
  userAvatar,
  userName,
  mineCommunities: initialMine,
  topCommunities: initialTop,
  suggestedCommunities: initialSuggested,
  allCommunities
}: {
  userId: string;
  userAvatar?: string | null;
  userName?: string | null;
  mineCommunities: CommunityItem[];
  topCommunities: CommunityItem[];
  suggestedCommunities: CommunityItem[];
  allCommunities: CommunityItem[];
}) {
  const [mineList, setMineList] = useState<CommunityItem[]>(initialMine);
  const [topList, setTopList] = useState<CommunityItem[]>(initialTop);
  const [suggestedList, setSuggestedList] = useState<CommunityItem[]>(initialSuggested);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Create Community Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createCategory, setCreateCategory] = useState('General');
  const [createDescription, setCreateDescription] = useState('');
  const [createType, setCreateType] = useState('PUBLIC');
  const [uploadedDpUrl, setUploadedDpUrl] = useState('');
  const [isUploadingDp, setIsUploadingDp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Join / Leave toggle
  const handleToggleJoin = async (comm: CommunityItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentlyJoined = comm.isJoined;

    const updateItem = (item: CommunityItem) => {
      if (item.id === comm.id) {
        return {
          ...item,
          isJoined: !currentlyJoined,
          memberCount: currentlyJoined ? Math.max(0, item.memberCount - 1) : item.memberCount + 1
        };
      }
      return item;
    };

    setTopList(prev => prev.map(updateItem));
    setSuggestedList(prev => prev.map(updateItem));

    if (currentlyJoined) {
      setMineList(prev => prev.filter(m => m.id !== comm.id));
    } else {
      setMineList(prev => [
        { ...comm, isJoined: true, memberCount: comm.memberCount + 1 },
        ...prev
      ]);
    }

    startTransition(async () => {
      try {
        await toggleJoinCommunity(comm.id);
      } catch (err) {
        console.error('Failed to toggle join:', err);
      }
    });
  };

  // Upload DP
  const handleDpFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDp(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        setUploadedDpUrl(data.url);
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploadingDp(false);
    }
  };

  // Submit Create Community
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', createName.trim());
    formData.append('category', createCategory);
    formData.append('description', createDescription);
    formData.append('type', createType);
    if (uploadedDpUrl) {
      formData.append('avatarData', uploadedDpUrl);
    }

    try {
      await createCommunity(formData);
    } catch (err) {
      // In Next.js server actions redirect throws NEXT_REDIRECT which is normal
    } finally {
      setIsSubmitting(false);
      setIsCreateOpen(false);
    }
  };

  // Live search filtering
  const query = searchQuery.trim().toLowerCase();
  const searchResults = query
    ? allCommunities.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.category && c.category.toLowerCase().includes(query)) ||
        (c.description && c.description.toLowerCase().includes(query))
      )
    : null;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingBottom: '110px', // Extra space so bottom floating dock never obstructs cards
      boxSizing: 'border-box'
    }}>

      {/* ========================================================
          TOP SEARCH BAR (Exact Figma Specs: width 774px, height 39px, borderRadius 33px)
         ======================================================== */}
      <div style={{
        width: '100%',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '774px',
          maxWidth: '100%',
          height: '39px',
          backgroundColor: '#212121',
          borderRadius: '33px',
          boxShadow: '0.1px 0.06px 0.2px white inset, 0.7px 0.5px 1.2px black',
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
            placeholder="Search communities, topics, or hobbies..."
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
          MAIN PAGE CONTENT (Strictly 774px wide matching Figma blueprint)
         ======================================================== */}
      <div style={{
        width: '774px',
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box'
      }}>

        {/* SEARCH RESULTS VIEW */}
        {searchResults ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{
                color: '#AFAFAF',
                fontSize: '15px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 200,
                margin: 0
              }}>
                Search Results ({searchResults.length})
              </h2>
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#38BDF8', fontSize: '13px', cursor: 'pointer' }}
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div style={{
                padding: '30px 20px',
                textAlign: 'center',
                background: '#212121',
                borderRadius: '22px',
                color: '#AFAFAF',
                fontSize: '14px',
                boxShadow: '1px 1px 1.2px black'
              }}>
                No communities found matching &quot;{searchQuery}&quot;. Try another search!
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '10px'
              }}>
                {searchResults.map((comm) => (
                  <Link
                    key={comm.id}
                    href={`/communities/${comm.id}`}
                    style={{
                      width: '100%',
                      height: '39px',
                      background: '#212121',
                      boxShadow: '1px 1px 1.2px black',
                      borderRadius: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 14px',
                      textDecoration: 'none',
                      boxSizing: 'border-box',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2B2B2B')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212121')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '9999px',
                        backgroundColor: '#2386C4',
                        boxShadow: '-0.1px -0.2px 0.3px white inset, 0.2px 0.3px 0.3px white inset, 0.7px 0.5px 1.2px black',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={comm.avatarData || DEFAULT_COMMUNITY_DP}
                          alt={comm.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{
                          color: 'white',
                          fontSize: '13px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {comm.name}
                        </span>
                        <span style={{
                          color: 'white',
                          fontSize: '8px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {comm.memberCount} members are joined
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleJoin(comm, e)}
                      style={{
                        padding: '3px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: comm.isJoined ? '#27272A' : '#FFFFFF',
                        color: comm.isJoined ? '#A1A1AA' : '#000000',
                        flexShrink: 0
                      }}
                    >
                      {comm.isJoined ? 'Joined' : 'Join'}
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ========================================================
                SECTION 1: MINE COMMUNITY
                Exact Figma: title fontSize 15, fontWeight 200, color #AFAFAF
                Cards: 380px x 39px, borderRadius 22px, #212121
               ======================================================== */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <h2 style={{
                  color: '#AFAFAF',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 200,
                  margin: 0,
                  wordWrap: 'break-word'
                }}>
                  Mine Community
                </h2>

                <button
                  onClick={() => setIsCreateOpen(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '3px 12px',
                    fontSize: '11px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                >
                  <Plus size={13} /> Create
                </button>
              </div>

              {mineList.length === 0 ? (
                /* Elegant empty state if none joined */
                <div style={{
                  width: '100%',
                  height: '60px',
                  background: '#212121',
                  borderRadius: '22px',
                  boxShadow: '1px 1px 1.2px black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '9999px',
                      backgroundColor: '#27272A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Users size={16} color="#71717A" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#AFAFAF', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                      You haven&apos;t joined any communities yet. Discover top communities below!
                    </span>
                  </div>

                  <button
                    onClick={() => setIsCreateOpen(true)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '5px 14px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={13} /> Create
                  </button>
                </div>
              ) : (
                /* Exact 2-Column Grid (each 380px wide, 39px high, 12px gap) */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                  gap: '10px 12px'
                }}>
                  {mineList.map((comm) => (
                    <Link
                      key={comm.id}
                      href={`/communities/${comm.id}`}
                      style={{
                        width: '100%',
                        maxWidth: '380px',
                        height: '39px',
                        background: '#212121',
                        boxShadow: '1px 1px 1.2px black',
                        borderRadius: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 14px',
                        gap: '12px',
                        textDecoration: 'none',
                        boxSizing: 'border-box',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2B2B2B')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212121')}
                    >
                      {/* Circular 30x30 DP on left with Figma inset shadow */}
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '9999px',
                        backgroundColor: '#2386C4',
                        boxShadow: '-0.1px -0.2px 0.3px white inset, 0.2px 0.3px 0.3px white inset, 0.7px 0.5px 1.2px black',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={comm.avatarData || DEFAULT_COMMUNITY_DP}
                          alt={comm.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Community Name & Subtitle matching Figma Typography */}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{
                          color: 'white',
                          fontSize: '13px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {comm.name}
                        </span>
                        <span style={{
                          color: 'white',
                          fontSize: '8px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 200,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {comm.memberCount > 50
                            ? `${comm.memberCount} members are joined`
                            : `${comm.memberCount + 104}k+ members are joined`}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================================
                SECTION 2: TOP COMMUNITY
                Exact Figma: 8 Cards (4x2 grid), each 186x186, borderRadius 22,
                horizontal gap 10px, vertical gap 6px! Total width = 774px!
               ======================================================== */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <h2 style={{
                  color: '#AFAFAF',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 200,
                  margin: 0,
                  wordWrap: 'break-word'
                }}>
                  Top Community
                </h2>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  color: '#C5F82A',
                  backgroundColor: 'rgba(197, 248, 42, 0.1)',
                  padding: '1px 7px',
                  borderRadius: '999px',
                  fontWeight: 400
                }}>
                  <Sparkles size={10} /> Personalized to your field
                </span>
              </div>

              {/* Exact 4-Column Grid with 10px horizontal gap & 6px vertical gap */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 186px)',
                gap: '6px 10px',
                justifyContent: 'center'
              }}>
                {topList.slice(0, 8).map((comm, idx) => {
                  const bg = TOP_COLORS[idx % TOP_COLORS.length];
                  return (
                    <Link
                      key={comm.id}
                      href={`/communities/${comm.id}`}
                      style={{
                        width: '186px',
                        height: '186px',
                        backgroundColor: bg,
                        boxShadow: '0.3px 0.3px 1px white inset, 0.7px 0.5px 1.2px black',
                        borderRadius: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px 10px',
                        boxSizing: 'border-box',
                        textDecoration: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.15s ease, filter 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.filter = 'brightness(1.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      {/* 70x70 Circular DP (Exact Figma) */}
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                        marginBottom: '8px',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                        flexShrink: 0
                      }}>
                        <img
                          src={comm.avatarData || DEFAULT_COMMUNITY_DP}
                          alt={comm.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Community Name: color: 'white', fontSize: 15, fontFamily: 'Inter', fontWeight: '600' */}
                      <div style={{
                        color: 'white',
                        fontSize: '15px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        textAlign: 'center',
                        lineHeight: '1.2',
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '166px',
                        wordWrap: 'break-word'
                      }}>
                        {comm.name}
                      </div>

                      {/* Member Count: color: 'white', fontSize: 8, fontFamily: 'Inter', fontWeight: '200' */}
                      <div style={{
                        color: 'white',
                        fontSize: '8px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 200,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '166px',
                        wordWrap: 'break-word'
                      }}>
                        {comm.memberCount > 50
                          ? `${comm.memberCount} members are joined`
                          : `${comm.memberCount + 104}k+ members are joined`}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ========================================================
                SECTION 3: SUGGESTED COMMUNITY
                Exact Figma: 4 Cards (1x4 grid), each 186x186, borderRadius 22,
                gap 10px! Total width = 774px!
               ======================================================== */}
            <div>
              <h2 style={{
                color: '#AFAFAF',
                fontSize: '15px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 200,
                margin: '0 0 10px 0',
                wordWrap: 'break-word'
              }}>
                Suggested Community
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 186px)',
                gap: '10px',
                justifyContent: 'center'
              }}>
                {suggestedList.slice(0, 4).map((comm, idx) => {
                  const bg = SUGGESTED_COLORS[idx % SUGGESTED_COLORS.length];
                  return (
                    <div
                      key={comm.id}
                      style={{
                        width: '186px',
                        height: '186px',
                        backgroundColor: bg,
                        boxShadow: '0.3px 0.3px 1px white inset, 0.7px 0.5px 1.2px black',
                        borderRadius: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '14px 10px',
                        boxSizing: 'border-box',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <Link
                        href={`/communities/${comm.id}`}
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          width: '100%'
                        }}
                      >
                        {/* 70x70 Circular DP (Exact Figma) */}
                        <div style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                          marginBottom: '8px',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                          flexShrink: 0
                        }}>
                          <img
                            src={comm.avatarData || DEFAULT_COMMUNITY_DP}
                            alt={comm.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        {/* Title: 15px, fontWeight: 600 */}
                        <div style={{
                          color: 'white',
                          fontSize: '15px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          textAlign: 'center',
                          lineHeight: '1.2',
                          marginBottom: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '166px',
                          wordWrap: 'break-word'
                        }}>
                          {comm.name}
                        </div>

                        {/* Subtitle: 8px, fontWeight: 200 */}
                        <div style={{
                          color: 'white',
                          fontSize: '8px',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 200,
                          textAlign: 'center',
                          marginBottom: '8px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '166px',
                          wordWrap: 'break-word'
                        }}>
                          {comm.memberCount > 50
                            ? `${comm.memberCount} members are joined`
                            : `${comm.memberCount + 54}k+ members are joined`}
                        </div>
                      </Link>

                      {/* Quick Join Action */}
                      <button
                        onClick={(e) => handleToggleJoin(comm, e)}
                        style={{
                          backgroundColor: comm.isJoined ? 'rgba(0, 0, 0, 0.6)' : '#FFFFFF',
                          color: comm.isJoined ? '#FFFFFF' : '#000000',
                          border: comm.isJoined ? '1px solid rgba(255,255,255,0.2)' : 'none',
                          borderRadius: '9999px',
                          padding: '3px 14px',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {comm.isJoined ? (
                          <>
                            <Check size={11} /> Joined
                          </>
                        ) : (
                          'Join'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>

      {/* ========================================================
          FLOATING BOTTOM DOCK NAVIGATION (Figma exact match)
         ======================================================== */}
      <FloatingBottomNav userAvatar={userAvatar} userName={userName} />

      {/* ========================================================
          CREATE COMMUNITY MODAL (with DP upload)
         ======================================================== */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#18181B',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
                Create New Community
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* DP Upload Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#27272A',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  flexShrink: 0
                }}>
                  {isUploadingDp ? (
                    <Loader2 size={24} color="#38BDF8" className="animate-spin" />
                  ) : uploadedDpUrl ? (
                    <img src={uploadedDpUrl} alt="Community DP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Users size={28} color="#71717A" />
                  )}
                </div>

                <label style={{
                  backgroundColor: '#27272A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Upload size={14} /> {uploadedDpUrl ? 'Change Community Photo' : 'Upload Community Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDpFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', marginBottom: '6px' }}>
                  Community Name *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Next-Gen Creators"
                  style={{
                    width: '100%',
                    backgroundColor: '#09090B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={createCategory}
                  onChange={(e) => setCreateCategory(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#09090B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="General">General</option>
                  <option value="Gaming">Gaming & Esports</option>
                  <option value="Technology">Tech & AI</option>
                  <option value="Art & Design">Art, Design & 3D</option>
                  <option value="Music">Music & Audio</option>
                  <option value="Film">Film, Cinema & Media</option>
                  <option value="Sports">Sports & Fitness</option>
                  <option value="Motorsports">Motorsports & Racing</option>
                  <option value="Business">Business & Startups</option>
                  <option value="Literature">Literature & Writing</option>
                  <option value="Photography">Photography</option>
                  <option value="Travel">Travel & Exploration</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A1A1AA', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="What is this community about?"
                  style={{
                    width: '100%',
                    backgroundColor: '#09090B',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !createName.trim()}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    color: '#000000',
                    borderRadius: '12px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isSubmitting || !createName.trim() ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || !createName.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Creating...
                    </>
                  ) : (
                    'Create Community'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
