import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, Building2, Trophy, Code2, UserCheck, Flame, Compass } from 'lucide-react';
import AppRightSidebar from '../components/AppRightSidebar';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string; category?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() || '';
  const currentTab = resolvedSearchParams.tab || 'explore';
  const categoryFilter = resolvedSearchParams.category || '';

  // 1. Fetch current logged-in user with relations
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      creatorProfile: true,
      following: { include: { following: true } },
      outgoingConnections: { include: { target: true } }
    }
  });

  if (!currentUser) {
    redirect('/login');
  }

  const followedIds = new Set(currentUser.following.map((f) => f.followingId));

  // 2. Fetch Users matching search query (if searching)
  let searchUsers: any[] = [];
  let searchCompetitions: any[] = [];
  if (query.length > 0) {
    const [foundUsers, foundComps] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { username: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } }
          ],
          id: { not: userId }
        },
        include: {
          personalProfile: true,
          creatorProfile: true,
          _count: { select: { followers: true } }
        },
        take: 20
      }),
      prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          creator: { select: { id: true, name: true, avatarData: true } },
          _count: { select: { registrations: true } }
        },
        take: 6
      })
    ]);
    searchUsers = foundUsers;
    searchCompetitions = foundComps;
  }

  // 3. Fetch Discovery & Network Users
  const [allUsers, topStoriesUsers] = await Promise.all([
    prisma.user.findMany({
      where: { id: { not: userId } },
      include: {
        personalProfile: true,
        creatorProfile: true,
        businessProfile: true,
        _count: { select: { followers: true, following: true } }
      },
      orderBy: { amerigamPoints: 'desc' },
      take: 40
    }),
    prisma.user.findMany({
      where: {
        id: { not: userId },
        status: 'ONLINE'
      },
      take: 10,
      orderBy: { lastSeen: 'desc' }
    })
  ]);

  // Section 1: Active Creators / Top Stories row (at least 7 items)
  const topActiveUsers = topStoriesUsers.length >= 7
    ? topStoriesUsers.slice(0, 7)
    : allUsers.slice(0, 7);

  // Section 2: Dynamic Category Counts
  const creatorCount = allUsers.filter((u) => u.accountType === 'CREATOR').length;
  const businessCount = allUsers.filter((u) => u.accountType === 'BUSINESS').length;
  const athleteCount = allUsers.filter(
    (u) =>
      u.personalProfile?.mainIdentity?.toLowerCase().includes('athlet') ||
      u.personalProfile?.skills?.toLowerCase().includes('sport') ||
      u.personalProfile?.skills?.toLowerCase().includes('fit')
  ).length;
  const techCount = allUsers.filter(
    (u) =>
      u.personalProfile?.skills?.toLowerCase().includes('tech') ||
      u.personalProfile?.skills?.toLowerCase().includes('code') ||
      u.personalProfile?.skills?.toLowerCase().includes('dev') ||
      u.personalProfile?.mainIdentity?.toLowerCase().includes('engineer')
  ).length;

  // Section 3: Suggested Users (not yet followed)
  const suggestedUsers = allUsers.filter((u) => !followedIds.has(u.id)).slice(0, 7);

  // Section 4: Team Network Users (connections or followed or colleagues)
  const teamNetworkUsers = currentUser.outgoingConnections.map((c) => c.target);
  const displayTeamUsers = teamNetworkUsers.length > 0
    ? teamNetworkUsers.slice(0, 7)
    : currentUser.following.map((f) => f.following).slice(0, 7);
  const finalTeamUsers = displayTeamUsers.length > 0 ? displayTeamUsers : allUsers.slice(7, 14);

  // Placeholder array of 7 items for empty states (Figma 18 exact 7 blue circle slots)
  const placeholderSlots = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      display: 'flex',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Center Main Content Area */}
      <div
        className="explore-container"
        style={{
          flex: 1,
          maxWidth: '920px',
          width: '100%',
          padding: '0 24px 80px 24px',
          boxSizing: 'border-box'
        }}
      >
        
        {/* ========================================================
            TOP SEARCH BAR (Illuminated Frosted Pill matching Figma 18)
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
            method="GET"
            action="/search"
            style={{ width: '100%', maxWidth: '480px', margin: 0 }}
          >
            <div
              className="explore-search-container"
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
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
            >
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search creators, skills, competitions..."
                className="explore-search-input"
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
              <button
                type="submit"
                aria-label="Search"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A1A1AA'
                }}
              >
                <Search size={18} strokeWidth={2} />
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================
            SUB-TABS: Explore | Network (Exact Figma 18 Header)
           ======================================================== */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '20px',
          paddingLeft: '4px'
        }}>
          {/* Active Tab: Explore */}
          <div style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#FFFFFF',
            position: 'relative',
            cursor: 'default',
            letterSpacing: '0.2px'
          }}>
            Explore
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

          {/* Inactive Tab: Network */}
          <Link
            href="/network"
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#71717A',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
              letterSpacing: '0.2px'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
          >
            Network
          </Link>
        </div>

        {/* ========================================================
            SEARCH RESULTS (If query is active)
           ======================================================== */}
        {query.length > 0 && (
          <div style={{
            backgroundColor: '#18181B',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Results for &quot;{query}&quot;
              </h2>
              <Link
                href="/search"
                style={{ fontSize: '12px', color: '#71717A', textDecoration: 'none' }}
              >
                Clear Search
              </Link>
            </div>

            {searchUsers.length === 0 && searchCompetitions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '28px 0',
                color: '#71717A',
                fontSize: '13px'
              }}>
                No users or competitions found matching &quot;{query}&quot;. Try exploring top creators below!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {searchUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/user/${user.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#0284C7',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {user.avatarData ? (
                          <img
                            src={user.avatarData}
                            alt={user.name || 'User'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
                            {user.name?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                          {user.name || user.username}
                        </div>
                        <div style={{ fontSize: '11px', color: '#71717A' }}>
                          @{user.username || 'user'} • {user.personalProfile?.mainIdentity || user.accountType}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 600 }}>
                      View Profile
                    </div>
                  </Link>
                ))}

                {searchCompetitions.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/competitions/${comp.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      textDecoration: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F59E0B'
                      }}>
                        <Trophy size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                          {comp.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#71717A' }}>
                          {comp.category} • {comp._count.registrations} participants
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#EAB308', fontWeight: 600 }}>
                      View Competition
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SECTION 1: TOP STORIES / ACTIVE CREATORS TRAY (Figma 18)
           ======================================================== */}
        <div
          className="explore-tray-container"
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
          {topActiveUsers.length > 0 ? (
            topActiveUsers.map((user, idx) => (
              <Link
                key={user.id || idx}
                href={`/user/${user.id}`}
                className="explore-avatar-item"
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
                {/* Blue Circular Avatar Ring matching Figma 18 */}
                <div
                  className="explore-avatar-ring"
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
                    transition: 'all 0.18s ease'
                  }}
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

                {/* 2 lines: Name & Role/Handle matching Figma lines */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.name || user.username || 'Creator'}
                  </div>
                  <div style={{
                    fontSize: '9.5px',
                    color: '#71717A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    @{user.username || 'creator'}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // Resilient Fallback: Figma 18 sleek blue circle slots with double lines
            placeholderSlots.map((num) => (
              <div
                key={num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  width: '74px',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C7',
                  opacity: 0.85,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
                }} />
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '42px', height: '3px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '999px' }} />
                  <div style={{ width: '26px', height: '3px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '999px' }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ========================================================
            SECTION 2: 4 LARGE VIBRANT CATEGORY CARDS (Figma 18)
           ======================================================== */}
        <div className="explore-category-grid">
          {/* Card 1: Vibrant Green - Creators */}
          <Link
            href="/search?category=creators"
            className="explore-card-hover explore-category-card"
            style={{
              backgroundColor: '#1E824C',
              background: 'linear-gradient(180deg, #229954 0%, #145A32 100%)',
              borderRadius: '24px',
              height: '240px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
            {/* Frosted icon badge */}
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
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div className="category-title" style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
              Creators
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {creatorCount > 0 ? `${creatorCount} active talents` : '100+ active'}
            </div>
          </Link>

          {/* Card 2: Vibrant Cyan / Teal - Founders */}
          <Link
            href="/communities"
            className="explore-card-hover explore-category-card"
            style={{
              backgroundColor: '#0D9488',
              background: 'linear-gradient(180deg, #0D9488 0%, #064E3B 100%)',
              borderRadius: '24px',
              height: '240px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
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
              <Building2 size={20} color="#FFFFFF" />
            </div>
            <div className="category-title" style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
              Founders
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {businessCount > 0 ? `${businessCount} startups` : '85+ founders'}
            </div>
          </Link>

          {/* Card 3: Vibrant Olive / Gold - Athletes */}
          <Link
            href="/competitions"
            className="explore-card-hover explore-category-card"
            style={{
              backgroundColor: '#A1A514',
              background: 'linear-gradient(180deg, #B5B017 0%, #636009 100%)',
              borderRadius: '24px',
              height: '240px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
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
              <Trophy size={20} color="#FFFFFF" />
            </div>
            <div className="category-title" style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
              Athletes
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {athleteCount > 0 ? `${athleteCount} competitors` : '150+ athletes'}
            </div>
          </Link>

          {/* Card 4: Vibrant Royal Blue - Developers */}
          <Link
            href="/network"
            className="explore-card-hover explore-category-card"
            style={{
              backgroundColor: '#2563EB',
              background: 'linear-gradient(180deg, #2563EB 0%, #1E3A8A 100%)',
              borderRadius: '24px',
              height: '240px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              cursor: 'pointer',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
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
              <Code2 size={20} color="#FFFFFF" />
            </div>
            <div className="category-title" style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
              Developers
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {techCount > 0 ? `${techCount} engineers` : '200+ tech'}
            </div>
          </Link>
        </div>

        {/* ========================================================
            SECTION 3: SUGGESTED SECTION (Figma 18)
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
              Suggested
            </h2>
            <Link
              href="/search"
              style={{ fontSize: '11px', color: '#71717A', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
            >
              View all
            </Link>
          </div>

          <div
            className="explore-tray-container"
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
            {suggestedUsers.length > 0 ? (
              suggestedUsers.map((user, idx) => (
                <Link
                  key={user.id || idx}
                  href={`/user/${user.id}`}
                  className="explore-avatar-item"
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
                    className="explore-avatar-ring"
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
                      transition: 'all 0.18s ease'
                    }}
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
                      {user.personalProfile?.mainIdentity || user.creatorProfile?.creatorType || 'Creator'}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              placeholderSlots.map((num) => (
                <div
                  key={num}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    width: '74px',
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    opacity: 0.85
                  }} />
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '40px', height: '3px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '999px' }} />
                    <div style={{ width: '24px', height: '3px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '999px' }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================================
            SECTION 4: TEAM NETWORK SECTION (Figma 18)
           ======================================================== */}
        <div>
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
              style={{ fontSize: '11px', color: '#71717A', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
            >
              View all
            </Link>
          </div>

          <div
            className="explore-tray-container"
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
            {finalTeamUsers.length > 0 ? (
              finalTeamUsers.map((user, idx) => (
                <Link
                  key={user.id || idx}
                  href={`/user/${user.id}`}
                  className="explore-avatar-item"
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
                    className="explore-avatar-ring"
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
                      transition: 'all 0.18s ease'
                    }}
                  >
                    {user.avatarData ? (
                      <img
                        src={user.avatarData}
                        alt="avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '14px' }}>
                        {user.name?.[0] || 'T'}
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
                      @{user.username || 'member'}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              placeholderSlots.map((num) => (
                <div
                  key={num}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    width: '74px',
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    opacity: 0.85
                  }} />
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '40px', height: '3px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '999px' }} />
                    <div style={{ width: '24px', height: '3px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '999px' }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Sidebar: Profile Rank Card & Active Friends (Exact Figma 18 Right Panel) */}
      <AppRightSidebar userId={userId} mode="network" />
    </div>
  );
}
