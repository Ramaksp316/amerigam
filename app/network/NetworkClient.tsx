'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Building2,
  Trophy,
  Code2,
  Film,
  Camera,
  PenTool,
  Palette,
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  Layers,
  HeartPulse,
  Apple,
  X,
  ChevronRight
} from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';

export default function NetworkClient({
  currentUser,
  connectedUsers = [],
  roleCategories = [],
  suggestedUsers = [],
  teamNetworkUsers = [],
  initialQuery = ''
}: {
  currentUser: any;
  connectedUsers: any[];
  roleCategories: Array<{
    title: string;
    desc: string;
    icon: string;
    queryKey: string;
    count: number;
    color: number;
  }>;
  suggestedUsers: any[];
  teamNetworkUsers: any[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Icon mapping helper
  const getIcon = (iconName: string, iconColor = '#FFFFFF') => {
    switch (iconName) {
      case 'Scissors':
      case 'Film':
        return <Film size={20} color={iconColor} />;
      case 'Sparkles':
        return <Sparkles size={20} color={iconColor} />;
      case 'PenTool':
        return <PenTool size={20} color={iconColor} />;
      case 'Camera':
        return <Camera size={20} color={iconColor} />;
      case 'Code2':
        return <Code2 size={20} color={iconColor} />;
      case 'Palette':
        return <Palette size={20} color={iconColor} />;
      case 'TrendingUp':
        return <TrendingUp size={20} color={iconColor} />;
      case 'Building2':
        return <Building2 size={20} color={iconColor} />;
      case 'Users':
        return <Users size={20} color={iconColor} />;
      case 'HeartPulse':
        return <HeartPulse size={20} color={iconColor} />;
      case 'Apple':
        return <Apple size={20} color={iconColor} />;
      case 'UserCheck':
        return <UserCheck size={20} color={iconColor} />;
      default:
        return <Sparkles size={20} color={iconColor} />;
    }
  };

  // Sleek dark Amerigam accents for category cards
  const getCategoryAccent = (colorIndex: number) => {
    switch (colorIndex) {
      case 1:
        return {
          border: 'rgba(16, 185, 129, 0.28)',
          badgeBg: 'rgba(16, 185, 129, 0.12)',
          iconColor: '#10B981',
          dotColor: '#10B981',
          gradient: 'linear-gradient(180deg, #1A1F1D 0%, #111413 100%)'
        };
      case 2:
        return {
          border: 'rgba(6, 182, 212, 0.28)',
          badgeBg: 'rgba(6, 182, 212, 0.12)',
          iconColor: '#06B6D4',
          dotColor: '#06B6D4',
          gradient: 'linear-gradient(180deg, #182024 0%, #111416 100%)'
        };
      case 3:
        return {
          border: 'rgba(245, 158, 11, 0.28)',
          badgeBg: 'rgba(245, 158, 11, 0.12)',
          iconColor: '#F59E0B',
          dotColor: '#F59E0B',
          gradient: 'linear-gradient(180deg, #221E19 0%, #151310 100%)'
        };
      case 4:
      default:
        return {
          border: 'rgba(59, 130, 246, 0.28)',
          badgeBg: 'rgba(59, 130, 246, 0.12)',
          iconColor: '#3B82F6',
          dotColor: '#3B82F6',
          gradient: 'linear-gradient(180deg, #181C26 0%, #101217 100%)'
        };
    }
  };

  const userMatchesCategory = (u: any, queryKey: string) => {
    const text = `${u.name || ''} ${u.username || ''} ${u.bio || ''} ${u.personalProfile?.mainIdentity || ''} ${u.creatorProfile?.creatorType || ''} ${u.personalProfile?.skills || ''} ${u.accountType || ''}`.toLowerCase();
    const q = queryKey.toLowerCase();
    if (q === 'developer') return text.includes('dev') || text.includes('code') || text.includes('engineer') || text.includes('software');
    if (q === 'designer') return text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('visual') || text.includes('motion');
    if (q === 'editor') return text.includes('edit') || text.includes('cut') || text.includes('colorist') || text.includes('vfx') || text.includes('sound');
    if (q === 'creator') return text.includes('creator') || text.includes('content') || text.includes('direct') || text.includes('cinemat') || text.includes('film');
    if (q === 'writer') return text.includes('writ') || text.includes('script') || text.includes('story') || text.includes('essay');
    if (q === 'producer') return text.includes('produc') || text.includes('show') || text.includes('exec');
    if (q === 'founder') return text.includes('founder') || text.includes('startup') || text.includes('build') || text.includes('ceo');
    if (q === 'marketer') return text.includes('market') || text.includes('growth') || text.includes('sales');
    if (q === 'photographer') return text.includes('photo') || text.includes('camera') || text.includes('shoot');
    return text.includes(q);
  };

  // Filter suggested users when category card is clicked
  const displayedSuggested = selectedCategory
    ? suggestedUsers.filter((u) => userMatchesCategory(u, selectedCategory))
    : suggestedUsers;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ========================================================
          TOP SEARCH BAR (Centered Frosted Pill matching Figma 18)
         ======================================================== */}
      <div style={{
        width: '100%',
        padding: '18px 0 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/network?q=${encodeURIComponent(searchQuery)}`);
          }}
          style={{ width: '100%', maxWidth: '480px', margin: 0 }}
        >
          <div
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '999px',
              backgroundColor: 'rgba(26, 27, 32, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 18px',
              gap: '12px',
              boxSizing: 'border-box'
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users or network..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 400,
                width: '100%',
                outline: 'none'
              }}
            />
            {searchQuery.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  router.push('/network');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#A1A1AA',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            ) : (
              <button
                type="submit"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#A1A1AA',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Search size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ========================================================
          SUB-TABS: Explore | Network (Exact Reference Blueprint)
         ======================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '20px',
        paddingLeft: '4px'
      }}>
        {/* Inactive Tab: Explore */}
        <Link
          href="/explore"
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: '#71717A',
            textDecoration: 'none',
            letterSpacing: '0.2px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
        >
          Explore
        </Link>

        {/* Active Tab: Network */}
        <div style={{
          fontSize: '15px',
          fontWeight: 700,
          color: '#FFFFFF',
          position: 'relative',
          letterSpacing: '0.2px'
        }}>
          Network
          <span style={{
            position: 'absolute',
            bottom: '-6px',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: '#FFFFFF',
            borderRadius: '999px'
          }} />
        </div>
      </div>

      {/* ========================================================
          SECTION 1: CONNECTED & FIELD-ALIGNED NETWORK MEMBERS (Image 4)
         ======================================================== */}
      {connectedUsers.length > 0 && (
        <div
          style={{
            backgroundColor: '#18181B',
            borderRadius: '24px',
            padding: '18px 24px',
            marginBottom: '26px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflowX: 'auto',
            gap: '16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          {connectedUsers.map((user, idx) => (
            <Link
              key={user.id || idx}
              href={`/user/${user.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                width: '74px',
                flexShrink: 0
              }}
            >
              {/* Circular Avatar with no glow */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#27272A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  transition: 'transform 0.18s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {user.avatarData ? (
                  <img
                    src={user.avatarData}
                    alt={user.name || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>
                    {user.name?.[0] || 'U'}
                  </span>
                )}
              </div>

              {/* 2 lines: Name & Role/Field */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.name || user.username || 'Member'}
                </div>
                <div style={{
                  fontSize: '9.5px',
                  color: '#71717A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.personalProfile?.mainIdentity || user.creatorProfile?.creatorType || user.accountType || 'Network'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ========================================================
          SECTION 2: 4 SPECIFIC CATEGORY BOXES (Role-by-Role Playbook)
         ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }} className="network-category-grid">
        {roleCategories.map((cat) => {
          const isSelected = selectedCategory === cat.queryKey;
          const accent = getCategoryAccent(cat.color);
          return (
            <div
              key={cat.title}
              onClick={() => setSelectedCategory(isSelected ? null : cat.queryKey)}
              style={{
                background: isSelected ? 'linear-gradient(180deg, #1C2430 0%, #10151E 100%)' : accent.gradient,
                borderRadius: '22px',
                height: '210px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSelected ? '0 12px 32px rgba(0, 157, 255, 0.35)' : '0 8px 24px rgba(0, 0, 0, 0.45)',
                border: isSelected ? '1.5px solid #009DFF' : `1px solid ${accent.border}`,
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxSizing: 'border-box',
                transform: isSelected ? 'translateY(-3px)' : 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Top: Icon Badge & Live Count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: accent.badgeBg,
                  border: `1px solid ${accent.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon(cat.icon, accent.iconColor)}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: isSelected ? '#FFFFFF' : '#A1A1AA',
                  backgroundColor: isSelected ? 'rgba(0, 157, 255, 0.2)' : 'rgba(0, 0, 0, 0.35)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: isSelected ? '1px solid rgba(0, 157, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accent.dotColor }} />
                  <span>{cat.count} available</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: '12px', color: '#8E8E93', fontWeight: 400 }}>
                  {cat.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          SECTION 3: SUGGESTED ROW (Image 4)
         ======================================================== */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingLeft: '4px',
          paddingRight: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
              Suggested
            </h2>
            {selectedCategory && (
              <span style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(0, 157, 255, 0.15)',
                color: '#38BDF8',
                border: '1px solid rgba(0, 157, 255, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Filtered by {roleCategories.find(c => c.queryKey === selectedCategory)?.title || selectedCategory}
                <span
                  onClick={() => setSelectedCategory(null)}
                  style={{ cursor: 'pointer', fontWeight: 700, marginLeft: '2px', fontSize: '13px' }}
                >
                  ×
                </span>
              </span>
            )}
          </div>
          <Link
            href="/explore"
            style={{
              fontSize: '12px',
              color: '#71717A',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
          >
            View all
          </Link>
        </div>

        <div
          style={{
            backgroundColor: '#18181B',
            borderRadius: '24px',
            padding: '18px 24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflowX: 'auto',
            gap: '16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          {displayedSuggested.length > 0 ? (
            displayedSuggested.slice(0, 7).map((user, idx) => (
              <Link
                key={user.id || idx}
                href={`/user/${user.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  width: '74px',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#27272A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    transition: 'transform 0.18s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {user.avatarData ? (
                    <img
                      src={user.avatarData}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
                      {user.name?.[0] || 'U'}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.name || user.username}
                  </div>
                  <div style={{
                    fontSize: '9.5px',
                    color: '#71717A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.personalProfile?.mainIdentity || user.creatorProfile?.creatorType || user.accountType || 'Creator'}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ textAlign: 'center', width: '100%', padding: '16px 0', color: '#71717A', fontSize: '13px' }}>
              No suggested users found in this category.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          SECTION 4: TEAM NETWORK ROW (Image 4)
         ======================================================== */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingLeft: '4px',
          paddingRight: '4px'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
            Team Network
          </h2>
          <Link
            href="/network"
            style={{
              fontSize: '12px',
              color: '#71717A',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
          >
            View all
          </Link>
        </div>

        <div
          style={{
            backgroundColor: '#18181B',
            borderRadius: '24px',
            padding: '18px 24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflowX: 'auto',
            gap: '16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          {teamNetworkUsers.length > 0 ? (
            teamNetworkUsers.slice(0, 7).map((user, idx) => (
              <Link
                key={user.id || idx}
                href={`/user/${user.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  width: '74px',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#27272A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    transition: 'transform 0.18s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {user.avatarData ? (
                    <img
                      src={user.avatarData}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
                      {user.name?.[0] || 'U'}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.name || user.username}
                  </div>
                  <div style={{
                    fontSize: '9.5px',
                    color: '#71717A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.personalProfile?.mainIdentity || user.creatorProfile?.creatorType || user.accountType || 'Colleague'}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ textAlign: 'center', width: '100%', padding: '16px 0', color: '#71717A', fontSize: '13px' }}>
              No team network connections yet. Connect with teammates on their profile to see them here.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
