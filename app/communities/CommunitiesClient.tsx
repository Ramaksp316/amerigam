'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, Plus, X, Users, Upload, Check, Loader2, Sparkles } from 'lucide-react';
import { toggleJoinCommunity, createCommunity } from './actions';
import AppRightSidebar from '../components/AppRightSidebar';

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
  '#9E2121', // Welcome Gamers Crimson
  '#773434', // Racers Rust
  '#2D9330', // Athletes Green
  '#1C9E80', // Chill Word Teal
  'rgba(194, 34, 111, 0.75)', // Creative Arts Deep Magenta
  '#B98E31', // Entrepreneurs Gold
  '#230B4D', // Tech & AI Deep Indigo/Purple
  '#A64917'  // Music & Beats Burnt Orange
];

const SUGGESTED_COLORS = [
  '#3E6851', // Nature Explorers Forest Green
  '#2E6181', // Indie Developers Ocean Blue
  '#473156', // Book Enthusiasts Plum
  '#27462D'  // Film & Media Deep Moss Green
];

// Fallback high-res thematic DPs if none set
const DEFAULT_COMMUNITY_DP = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80';

export default function CommunitiesClient({
  userId,
  mineCommunities: initialMine,
  topCommunities: initialTop,
  suggestedCommunities: initialSuggested,
  allCommunities
}: {
  userId: string;
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

    // Optimistic UI updates
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
    } catch (err: any) {
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
      backgroundColor: '#0A0A0A',
      color: '#FFFFFF',
      display: 'flex',
      justifyContent: 'flex-start',
      overflowX: 'hidden'
    }}>
      {/* 3-COLUMN WRAPPER (Fluid, zero horizontal overflow) */}
      <div style={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        minHeight: '100vh',
        overflowX: 'hidden'
      }}>
        {/* Center Main Content Area */}
        <div style={{
          flex: 1,
          minWidth: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '80px',
          overflowX: 'hidden'
        }}>

          {/* ========================================================
              TOP SEARCH BAR (Pill shape, Figma styled)
             ======================================================== */}
          <div style={{
            height: '60px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(16px)',
            zIndex: 40
          }}>
            <div style={{
              width: '100%',
              maxWidth: '774px',
              height: '39px',
              backgroundColor: '#212121',
              borderRadius: '33px',
              boxShadow: '0.1px 0.06px 0.2px rgba(255,255,255,0.4) inset, 0.7px 0.5px 1.2px black',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              gap: '12px'
            }}>
              <Search size={16} color="#AFAFAF" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search communities, topics, or hobbies..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
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

          {/* MAIN PAGE BODY */}
          <div style={{
            maxWidth: '960px',
            width: '100%',
            margin: '0 auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '36px'
          }}>

            {/* SEARCH RESULTS VIEW (when typing in search bar) */}
            {searchResults ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '15px', color: '#AFAFAF', fontWeight: 200, fontFamily: 'Inter', margin: 0 }}>
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
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: '#18181B',
                    borderRadius: '22px',
                    color: '#AFAFAF',
                    fontSize: '14px'
                  }}>
                    No communities found matching &quot;{searchQuery}&quot;. Try another search or create one below!
                  </div>
                ) : (
                  <div className="communities-mine-responsive-grid">
                    {searchResults.map((comm) => (
                      <Link
                        key={comm.id}
                        href={`/communities/${comm.id}`}
                        style={{
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#212121',
                          borderRadius: '22px',
                          boxShadow: '1px 1px 1.2px black',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          padding: '6px 16px',
                          minHeight: '44px',
                          transition: 'transform 0.15s ease, background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2A2A2A')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#212121')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '9999px',
                            backgroundColor: '#2386C4',
                            overflow: 'hidden',
                            flexShrink: 0,
                            boxShadow: '-0.1px -0.2px 0.3px white inset, 0.2px 0.3px 0.3px white inset, 0.7px 0.5px 1.2px black'
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
                              fontSize: '14px',
                              fontWeight: 600,
                              fontFamily: 'Inter',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {comm.name}
                            </span>
                            <span style={{ color: '#AFAFAF', fontSize: '11px', fontWeight: 300, fontFamily: 'Inter' }}>
                              {comm.memberCount} members {comm.category ? `• ${comm.category}` : ''}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleToggleJoin(comm, e)}
                          style={{
                            padding: '4px 12px',
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
                    SECTION 1: MINE COMMUNITY (Figma capsule pills)
                   ======================================================== */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px'
                  }}>
                    <h2 style={{
                      color: '#AFAFAF',
                      fontSize: '15px',
                      fontFamily: 'Inter',
                      fontWeight: 200,
                      margin: 0,
                      letterSpacing: '0.2px'
                    }}>
                      Mine Community
                    </h2>

                    <button
                      onClick={() => setIsCreateOpen(true)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                    >
                      <Plus size={14} /> Create Community
                    </button>
                  </div>

                  {mineList.length === 0 ? (
                    /* Elegant empty state if user hasn't joined any communities */
                    <div style={{
                      backgroundColor: '#18181B',
                      borderRadius: '22px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '24px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      boxShadow: '1px 1px 1.2px black'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: '#27272A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Users size={20} color="#71717A" />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                            You haven&apos;t joined any communities yet
                          </div>
                          <div style={{ fontSize: '12px', color: '#A1A1AA' }}>
                            Join popular communities below matching your field and hobby, or start your own!
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsCreateOpen(true)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#000000',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={14} /> Start Community
                      </button>
                    </div>
                  ) : (
                    /* 2-Column Capsule Pills matching Figma */
                    <div className="communities-mine-responsive-grid">
                      {mineList.map((comm) => (
                        <Link
                          key={comm.id}
                          href={`/communities/${comm.id}`}
                          style={{
                            width: '100%',
                            minHeight: '42px',
                            background: '#212121',
                            boxShadow: '1px 1px 1.2px black',
                            borderRadius: '22px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '6px 14px',
                            gap: '12px',
                            textDecoration: 'none',
                            boxSizing: 'border-box',
                            transition: 'transform 0.15s ease, background 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#282828';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#212121';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Circular 30x30 DP on left */}
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

                          {/* Community Name & Member count */}
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                            <span style={{
                              color: 'white',
                              fontSize: '13px',
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {comm.name}
                            </span>
                            <span style={{
                              color: '#AFAFAF',
                              fontSize: '10px',
                              fontFamily: 'Inter',
                              fontWeight: 300,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {comm.memberCount} members {comm.category ? `• ${comm.category}` : ''}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* ========================================================
                    SECTION 2: TOP COMMUNITY (Exact 4x2 Grid from Figma)
                   ======================================================== */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <h2 style={{
                      color: '#AFAFAF',
                      fontSize: '15px',
                      fontFamily: 'Inter',
                      fontWeight: 200,
                      margin: 0,
                      letterSpacing: '0.2px'
                    }}>
                      Top Community
                    </h2>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: '#C5F82A',
                      backgroundColor: 'rgba(197, 248, 42, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 500
                    }}>
                      <Sparkles size={11} /> Matched to your field
                    </span>
                  </div>

                  <div className="communities-top-responsive-grid">
                    {topList.slice(0, 8).map((comm, idx) => {
                      const bg = TOP_COLORS[idx % TOP_COLORS.length];
                      return (
                        <Link
                          key={comm.id}
                          href={`/communities/${comm.id}`}
                          style={{
                            width: '100%',
                            height: '186px',
                            backgroundColor: bg,
                            boxShadow: '0.3px 0.3px 1px rgba(255,255,255,0.4) inset, 0.7px 0.5px 1.2px black, 0 8px 20px rgba(0,0,0,0.5)',
                            borderRadius: '22px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px 12px',
                            boxSizing: 'border-box',
                            textDecoration: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0.4px 0.4px 1.2px rgba(255,255,255,0.6) inset, 0 14px 28px rgba(0,0,0,0.7)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0.3px 0.3px 1px rgba(255,255,255,0.4) inset, 0.7px 0.5px 1.2px black, 0 8px 20px rgba(0,0,0,0.5)';
                          }}
                        >
                          {/* 70x70 Circular DP matching Figma */}
                          <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '9999px',
                            overflow: 'hidden',
                            marginBottom: '10px',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                            border: '1.5px solid rgba(255, 255, 255, 0.25)',
                            flexShrink: 0
                          }}>
                            <img
                              src={comm.avatarData || DEFAULT_COMMUNITY_DP}
                              alt={comm.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          {/* Community Name */}
                          <div style={{
                            color: 'white',
                            fontSize: '15px',
                            fontFamily: 'Inter',
                            fontWeight: 600,
                            textAlign: 'center',
                            marginBottom: '3px',
                            lineHeight: '1.2',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                          }}>
                            {comm.name}
                          </div>

                          {/* Member Count Subtitle */}
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '10px',
                            fontFamily: 'Inter',
                            fontWeight: 200,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
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
                    SECTION 3: SUGGESTED COMMUNITY (4 Muted Cards from Figma)
                   ======================================================== */}
                <div>
                  <h2 style={{
                    color: '#AFAFAF',
                    fontSize: '15px',
                    fontFamily: 'Inter',
                    fontWeight: 200,
                    margin: '0 0 14px 0',
                    letterSpacing: '0.2px'
                  }}>
                    Suggested Community
                  </h2>

                  <div className="communities-top-responsive-grid">
                    {suggestedList.slice(0, 4).map((comm, idx) => {
                      const bg = SUGGESTED_COLORS[idx % SUGGESTED_COLORS.length];
                      return (
                        <div
                          key={comm.id}
                          style={{
                            width: '100%',
                            height: '186px',
                            backgroundColor: bg,
                            boxShadow: '0.3px 0.3px 1px rgba(255,255,255,0.35) inset, 0.7px 0.5px 1.2px black, 0 8px 20px rgba(0,0,0,0.4)',
                            borderRadius: '22px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px 12px',
                            boxSizing: 'border-box',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
                            {/* 70x70 Circular DP */}
                            <div style={{
                              width: '70px',
                              height: '70px',
                              borderRadius: '9999px',
                              overflow: 'hidden',
                              marginBottom: '8px',
                              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                              border: '1.5px solid rgba(255, 255, 255, 0.2)',
                              flexShrink: 0
                            }}>
                              <img
                                src={comm.avatarData || DEFAULT_COMMUNITY_DP}
                                alt={comm.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>

                            {/* Name */}
                            <div style={{
                              color: 'white',
                              fontSize: '15px',
                              fontFamily: 'Inter',
                              fontWeight: 600,
                              textAlign: 'center',
                              marginBottom: '2px',
                              lineHeight: '1.2',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%'
                            }}>
                              {comm.name}
                            </div>

                            {/* Member Count */}
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.85)',
                              fontSize: '9px',
                              fontFamily: 'Inter',
                              fontWeight: 200,
                              textAlign: 'center',
                              marginBottom: '8px'
                            }}>
                              {comm.memberCount > 50
                                ? `${comm.memberCount} members`
                                : `${comm.memberCount + 54}k+ members`}
                            </div>
                          </Link>

                          {/* Quick Join Button */}
                          <button
                            onClick={(e) => handleToggleJoin(comm, e)}
                            style={{
                              backgroundColor: comm.isJoined ? 'rgba(0, 0, 0, 0.5)' : '#FFFFFF',
                              color: comm.isJoined ? '#FFFFFF' : '#000000',
                              border: comm.isJoined ? '1px solid rgba(255,255,255,0.2)' : 'none',
                              borderRadius: '999px',
                              padding: '3px 14px',
                              fontSize: '11px',
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
                                <Check size={12} /> Joined
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
        </div>

        {/* Right Sidebar: Profile Card & Joined Competitions */}
        <AppRightSidebar userId={userId} mode="communities" />
      </div>

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
