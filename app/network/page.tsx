import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Search, UserPlus, Users, Sparkles, Building2, Trophy, Code2 } from 'lucide-react';
import AppRightSidebar from '../components/AppRightSidebar';

export const dynamic = 'force-dynamic';

export default async function NetworkPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || 'network';
  const searchQuery = resolvedSearchParams.q || '';

  // 1. Fetch current logged-in user with relations
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalProfile: true,
      outgoingConnections: { include: { target: true } },
      following: { include: { following: true } }
    }
  });

  if (!currentUser) redirect('/login');

  // 2. Fetch network users
  const followedUsers = currentUser.following.map((f) => f.following);

  // 3. Fetch all other users for suggestions & categories
  const allUsers = await prisma.user.findMany({
    where: { id: { not: userId } },
    include: {
      personalProfile: true,
      creatorProfile: true,
      businessProfile: true,
      _count: { select: { followers: true, following: true } }
    },
    take: 35
  });

  // Category counts
  const creatorCount = allUsers.filter((u) => u.accountType === 'CREATOR').length;
  const businessCount = allUsers.filter((u) => u.accountType === 'BUSINESS').length;
  const athleteCount = allUsers.filter((u) => u.personalProfile?.mainIdentity?.toLowerCase().includes('athlet') || u.personalProfile?.skills?.includes('Sport')).length;
  const techCount = allUsers.filter((u) => u.personalProfile?.skills?.includes('Tech') || u.personalProfile?.skills?.includes('Code')).length;

  // Suggested users (exclude already followed)
  const followedIds = new Set(currentUser.following.map((f) => f.followingId));
  const suggestedUsers = allUsers.filter((u) => !followedIds.has(u.id)).slice(0, 7);

  // Team Network (users connected via EntityConnection or colleagues)
  const teamNetworkUsers = currentUser.outgoingConnections.map((c) => c.target);
  const displayTeamUsers = teamNetworkUsers.length > 0 ? teamNetworkUsers : allUsers.slice(7, 14);

  // Top Connections Row (followed or first 7 users)
  const topCarouselUsers = followedUsers.length >= 7 ? followedUsers.slice(0, 7) : allUsers.slice(0, 7);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      display: 'flex',
      justifyContent: 'center'
    }}>
      {/* Center Main Content Area */}
      <div style={{
        flex: 1,
        maxWidth: '920px',
        padding: '0 24px 60px 24px',
        boxSizing: 'border-box'
      }}>
        
        {/* ========================================================
            TOP SEARCH BAR (Pill shape, centered)
           ======================================================== */}
        <div style={{
          width: '100%',
          padding: '16px 0 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '460px',
            maxWidth: '100%',
            height: '38px',
            borderRadius: '999px',
            backgroundColor: '#18181B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '10px'
          }}>
            <input
              type="text"
              placeholder="Search users or network..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                width: '100%',
                outline: 'none'
              }}
            />
            <Search size={16} color="#71717A" />
          </div>
        </div>

        {/* ========================================================
            TABS: Explore | Network
           ======================================================== */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '20px',
          paddingLeft: '4px'
        }}>
          <Link
            href="/search"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#71717A',
              textDecoration: 'none',
              transition: 'color 0.15s'
            }}
          >
            Explore
          </Link>
          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#FFFFFF',
            position: 'relative',
            cursor: 'default'
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
            SECTION 1: TOP STORIES / HORIZONTAL USER AVATARS ROW
           ======================================================== */}
        <div style={{
          backgroundColor: '#18181B',
          borderRadius: '24px',
          padding: '18px 24px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto'
        }}>
          {topCarouselUsers.map((user, idx) => (
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
              {/* Blue Circular Avatar */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.1)'
              }}>
                {user.avatarData ? (
                  <img src={user.avatarData} alt={user.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>
                    {user.name?.[0] || 'U'}
                  </span>
                )}
              </div>

              {/* 2 lines: Name & Role/Username */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.name || user.username || 'User'}
                </div>
                <div style={{
                  fontSize: '9px',
                  color: '#71717A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  @{user.username || 'member'}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ========================================================
            SECTION 2: 4 LARGE VIBRANT CATEGORY CARDS
           ======================================================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Card 1: Vibrant Green */}
          <div style={{
            backgroundColor: '#1E824C',
            borderRadius: '24px',
            height: '240px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            boxSizing: 'border-box'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
              Creators
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {creatorCount > 0 ? `${creatorCount} active` : '100+ members'}
            </div>
          </div>

          {/* Card 2: Vibrant Cyan / Teal */}
          <div style={{
            backgroundColor: '#0D9488',
            borderRadius: '24px',
            height: '240px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            boxSizing: 'border-box'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} color="#FFFFFF" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
              Founders
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {businessCount > 0 ? `${businessCount} startups` : '85+ founders'}
            </div>
          </div>

          {/* Card 3: Vibrant Olive / Gold */}
          <div style={{
            backgroundColor: '#A1A514',
            borderRadius: '24px',
            height: '240px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            boxSizing: 'border-box'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={20} color="#FFFFFF" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
              Athletes
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {athleteCount > 0 ? `${athleteCount} competitors` : '150+ athletes'}
            </div>
          </div>

          {/* Card 4: Vibrant Royal Blue */}
          <div style={{
            backgroundColor: '#2563EB',
            borderRadius: '24px',
            height: '240px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            boxSizing: 'border-box'
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code2 size={20} color="#FFFFFF" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>
              Developers
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {techCount > 0 ? `${techCount} engineers` : '200+ tech'}
            </div>
          </div>
        </div>

        {/* ========================================================
            SECTION 3: SUGGESTED SECTION
           ======================================================== */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
              Suggested
            </h2>
            <Link href="/search" style={{ fontSize: '11px', color: '#71717A', textDecoration: 'none' }}>
              View all
            </Link>
          </div>

          <div style={{
            backgroundColor: '#18181B',
            borderRadius: '24px',
            padding: '18px 24px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflowX: 'auto'
          }}>
            {suggestedUsers.map((user, idx) => (
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
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {user.avatarData ? (
                    <img src={user.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    fontSize: '9px',
                    color: '#71717A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.personalProfile?.mainIdentity || 'Creator'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================
            SECTION 4: TEAM NETWORK SECTION
           ======================================================== */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
              Team Network
            </h2>
            <Link href="/search" style={{ fontSize: '11px', color: '#71717A', textDecoration: 'none' }}>
              View all
            </Link>
          </div>

          <div style={{
            backgroundColor: '#18181B',
            borderRadius: '24px',
            padding: '18px 24px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflowX: 'auto'
          }}>
            {displayTeamUsers.map((user, idx) => (
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
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {user.avatarData ? (
                    <img src={user.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    fontSize: '9px',
                    color: '#71717A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    @{user.username || 'member'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Right Sidebar: Profile Card & Active Friends */}
      <AppRightSidebar userId={userId} mode="network" />
    </div>
  );
}
