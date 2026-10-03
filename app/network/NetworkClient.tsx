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
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scissors':
      case 'Film':
        return <Film size={20} color="#FFFFFF" />;
      case 'Sparkles':
        return <Sparkles size={20} color="#FFFFFF" />;
      case 'PenTool':
        return <PenTool size={20} color="#FFFFFF" />;
      case 'Camera':
        return <Camera size={20} color="#FFFFFF" />;
      case 'Code2':
        return <Code2 size={20} color="#FFFFFF" />;
      case 'Palette':
        return <Palette size={20} color="#FFFFFF" />;
      case 'TrendingUp':
        return <TrendingUp size={20} color="#FFFFFF" />;
      case 'Building2':
        return <Building2 size={20} color="#FFFFFF" />;
      case 'Users':
        return <Users size={20} color="#FFFFFF" />;
      case 'HeartPulse':
        return <HeartPulse size={20} color="#FFFFFF" />;
      case 'Apple':
        return <Apple size={20} color="#FFFFFF" />;
      case 'UserCheck':
        return <UserCheck size={20} color="#FFFFFF" />;
      default:
        return <Sparkles size={20} color="#FFFFFF" />;
    }
  };

  // Card background gradients matching Image 4 reference
  const getCardBackground = (colorIndex: number) => {
    switch (colorIndex) {
      case 1:
        // Vibrant Forest Green
        return 'linear-gradient(180deg, #16A34A 0%, #14532D 100%)';
      case 2:
        // Vibrant Cyan / Teal
        return 'linear-gradient(180deg, #0D9488 0%, #115E59 100%)';
      case 3:
        // Vibrant Olive / Mustard Gold
        return 'linear-gradient(180deg, #A1A514 0%, #713F12 100%)';
      case 4:
      default:
        // Vibrant Royal Blue
        return 'linear-gradient(180deg, #2563EB 0%, #1E40AF 100%)';
    }
  };

  // Filter suggested users if a category card is clicked
  const displayedSuggested = selectedCategory
    ? suggestedUsers.filter((u) => {
        const str = `${u.name || ''} ${u.personalProfile?.mainIdentity || ''} ${u.creatorProfile?.creatorType || ''} ${u.personalProfile?.skills || ''} ${u.accountType || ''}`.toLowerCase();
        return str.includes(selectedCategory.toLowerCase());
      })
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
              {/* Blue Circular Avatar Ring matching Image 4 */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  border: '2px solid rgba(255, 255, 255, 0.12)',
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
          const isSelected = selectedCategory === cat.title;
          return (
            <div
              key={cat.title}
              onClick={() => setSelectedCategory(isSelected ? null : cat.title)}
              style={{
                background: getCardBackground(cat.color),
                borderRadius: '24px',
                height: '240px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                boxShadow: isSelected ? '0 12px 32px rgba(2, 132, 199, 0.45)' : '0 8px 24px rgba(0, 0, 0, 0.45)',
                border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.12)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxSizing: 'border-box',
                transform: isSelected ? 'translateY(-4px)' : 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Frosted Icon Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.28)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getIcon(cat.icon)}
              </div>

              {/* Title & Dynamic Count */}
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
                  {cat.count > 0 ? `${cat.count} available` : 'Active'}
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
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(2, 132, 199, 0.2)',
                color: '#38BDF8',
                border: '1px solid rgba(2, 132, 199, 0.4)'
              }}>
                Filtered by {selectedCategory} • <span onClick={() => setSelectedCategory(null)} style={{ cursor: 'pointer', fontWeight: 700 }}>×</span>
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
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
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
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
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
