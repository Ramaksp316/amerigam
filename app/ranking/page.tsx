import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Globe, Bell, Settings, Radio, ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; geo?: string; q?: string }>;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const currentCategory = resolvedSearchParams.category || 'All';

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { personalProfile: true }
  });

  if (!currentUser) {
    redirect('/login');
  }

  // Categories matching Figma Screen 22
  const categories = [
    'All',
    'Editor',
    'Singer',
    'Dancer',
    'Gamer',
    'Footballer',
    'Developer',
    'Athlete'
  ];

  // Fetch ranked users by Amerigam Points
  let whereClause: any = {};
  if (currentCategory !== 'All') {
    whereClause = {
      OR: [
        { personalProfile: { mainIdentity: { contains: currentCategory, mode: 'insensitive' } } },
        { personalProfile: { skills: { contains: currentCategory, mode: 'insensitive' } } },
        { bio: { contains: currentCategory, mode: 'insensitive' } }
      ]
    };
  }

  const allRankedUsers = await prisma.user.findMany({
    where: whereClause,
    include: {
      personalProfile: true,
      creatorProfile: true,
      _count: { select: { followers: true } }
    },
    orderBy: { amerigamPoints: 'desc' },
    take: 40
  });

  // Top 3 Podium Users
  const top1 = allRankedUsers[0] || null;
  const top2 = allRankedUsers[1] || null;
  const top3 = allRankedUsers[2] || null;

  // Country & State users (e.g. India & Gujarat)
  const countryUsers = allRankedUsers.slice(0, 6);
  const stateUsers = allRankedUsers.length > 6 ? allRankedUsers.slice(6, 12) : allRankedUsers.slice(0, 6);

  // Helper formatting for followers
  const formatFollowers = (count?: number) => {
    if (count === undefined || count === null || count === 0) return '101K';
    if (count >= 1000000) return `${(count / 1000000).toFixed(0)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return `${count}`;
  };

  return (
    <div className="ranking-page-wrapper">
      {/* ========================================================
          TOP HEADER BAR (Matching Figma Screen 22)
         ======================================================== */}
      <header className="ranking-top-bar">
        {/* Left: Amerigam Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/amerigam-logo-transparent.png"
              alt="Amerigam"
              width={105}
              height={24}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>

        {/* Center: Frosted Illuminated Search Bar */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
          <Link
            href="/search"
            style={{
              width: '440px',
              maxWidth: '100%',
              height: '38px',
              borderRadius: '999px',
              backgroundColor: 'rgba(26, 27, 32, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '13px', color: '#71717A' }}>
              Search creators, rankings...
            </span>
            <Search size={16} color="#A1A1AA" />
          </Link>
        </div>

        {/* Right: 4 Utility Icons (Radar, Globe, Bell, Settings) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/network" title="Network" style={{ color: '#A1A1AA', display: 'flex' }}>
            <Radio size={20} strokeWidth={2} />
          </Link>
          <Link href="/communities" title="Communities" style={{ color: '#A1A1AA', display: 'flex' }}>
            <Globe size={20} strokeWidth={2} />
          </Link>
          <Link href="/notifications" title="Notification" style={{ color: '#A1A1AA', display: 'flex' }}>
            <Bell size={20} strokeWidth={2} />
          </Link>
          <Link href="/settings" title="Settings" style={{ color: '#A1A1AA', display: 'flex' }}>
            <Settings size={20} strokeWidth={2} />
          </Link>
        </div>
      </header>

      {/* ========================================================
          MAIN RANKING LAYOUT (Figma Screen 22: Left Sidebar + Content)
         ======================================================== */}
      <div className="ranking-main-layout">
        
        {/* ─── LEFT PANEL: CATEGORY SELECTOR ─── */}
        <aside className="ranking-category-sidebar">
          {/* Category Dropdown Pill */}
          <div className="ranking-category-pill-dropdown">
            <span>Category</span>
            <ChevronDown size={16} color="#A1A1AA" />
          </div>

          {/* Category List Card */}
          <div className="ranking-category-list-card">
            {categories.map((cat) => {
              const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
              return (
                <Link
                  key={cat}
                  href={`/ranking?category=${encodeURIComponent(cat)}`}
                  className={`ranking-category-item ${isActive ? 'active' : ''}`}
                >
                  <span>{cat}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* ─── RIGHT / CENTER CONTENT COLUMN ─── */}
        <main className="ranking-content-col">
          
          {/* 1. Panoramic Hero Banner matching Figma Screen 22 */}
          <div className="ranking-hero-banner-box">
            <Image
              src="/images/figma/ranking_hero_banner.png"
              alt="You can be one of them"
              width={1064}
              height={232}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover'
              }}
              priority
            />
          </div>

          {/* 2. Top Rank Section (Podiums 1, 2, 3) */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              paddingLeft: '4px',
              paddingRight: '4px'
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Top Rank
              </h2>
              <Link href="/ranking" style={{ fontSize: '12px', color: '#71717A', textDecoration: 'none' }}>
                View all
              </Link>
            </div>

            {/* 3 Podium Cards Grid */}
            <div className="ranking-podium-grid">
              
              {/* ─── PODIUM CARD 1 (Rank 1 - Blue Amerigam Emblem) ─── */}
              <Link
                href={top1 ? `/user/${top1.id}` : '#'}
                className="ranking-podium-card"
              >
                {/* Top Half: Blue Shield + "1 Rank" */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '60px',
                    height: '66px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.4))'
                  }}>
                    <img
                      src="/images/figma/badge_164_318.png"
                      alt="Rank 1 Emblem"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: '1.1' }}>
                      1 Rank
                    </div>
                    <div style={{ fontSize: '13px', color: '#A1A1AA', fontWeight: 500 }}>
                      {top1?.personalProfile?.mainIdentity || currentCategory !== 'All' ? currentCategory : 'Editor'}
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

                {/* Bottom Half: Circular Avatar + Creator Details */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                  }}>
                    {top1?.avatarData ? (
                      <img src={top1.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>
                        {top1?.name?.[0] || 'C'}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                        {top1?.username || top1?.name || 'creator'}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{formatFollowers(top1?._count?.followers)}</span>
                          <div style={{ color: '#71717A', fontSize: '9px' }}>Followers</div>
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{top1?.amerigamPoints || 1200}</span>
                          <div style={{ color: '#71717A', fontSize: '9px' }}>AP</div>
                        </div>
                      </div>
                    </div>
                    <p style={{
                      margin: '6px 0 0 0',
                      fontSize: '10px',
                      color: '#A1A1AA',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {top1?.bio || 'This creator has mastery at his own field of Editing. Design is not just what it looks like and feels like.'}
                    </p>
                  </div>
                </div>
              </Link>

              {/* ─── PODIUM CARD 2 (Rank 2 - Green Emblem) ─── */}
              <Link
                href={top2 ? `/user/${top2.id}` : '#'}
                className="ranking-podium-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '60px',
                    height: '66px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 4px 12px rgba(22, 163, 74, 0.4))'
                  }}>
                    <img
                      src="/images/figma/badge_164_290.png"
                      alt="Rank 2 Emblem"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: '1.1' }}>
                      2 Rank
                    </div>
                    <div style={{ fontSize: '13px', color: '#A1A1AA', fontWeight: 500 }}>
                      {top2?.personalProfile?.mainIdentity || currentCategory !== 'All' ? currentCategory : 'Editor'}
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                  }}>
                    {top2?.avatarData ? (
                      <img src={top2.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>
                        {top2?.name?.[0] || 'M'}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                        {top2?.username || top2?.name || 'major'}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{formatFollowers(top2?._count?.followers)}</span>
                          <div style={{ color: '#71717A', fontSize: '9px' }}>Followers</div>
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{top2?.amerigamPoints || 1200}</span>
                          <div style={{ color: '#71717A', fontSize: '9px' }}>AP</div>
                        </div>
                      </div>
                    </div>
                    <p style={{
                      margin: '6px 0 0 0',
                      fontSize: '10px',
                      color: '#A1A1AA',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {top2?.bio || 'This creator has mastery at his own field of Editing. Design is not just what it looks like and feels like.'}
                    </p>
                  </div>
                </div>
              </Link>

              {/* ─── PODIUM CARD 3 (Rank 3 - Gold Emblem) ─── */}
              <Link
                href={top3 ? `/user/${top3.id}` : '#'}
                className="ranking-podium-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '60px',
                    height: '66px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 4px 12px rgba(234, 179, 8, 0.4))'
                  }}>
                    <img
                      src="/images/figma/badge_164_309.png"
                      alt="Rank 3 Emblem"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: '1.1' }}>
                      3 Rank
                    </div>
                    <div style={{ fontSize: '13px', color: '#A1A1AA', fontWeight: 500 }}>
                      {top3?.personalProfile?.mainIdentity || currentCategory !== 'All' ? currentCategory : 'Editor'}
                    </div>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                  }}>
                    {top3?.avatarData ? (
                      <img src={top3.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>
                        {top3?.name?.[0] || 'D'}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                        {top3?.username || top3?.name || 'davis'}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{formatFollowers(top3?._count?.followers)}</span>
                          <div style={{ color: '#71717A', fontSize: '9px' }}>Followers</div>
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{top3?.amerigamPoints || 1200}</span>
                          <div style={{ color: '#71717A', fontSize: '9px' }}>AP</div>
                        </div>
                      </div>
                    </div>
                    <p style={{
                      margin: '6px 0 0 0',
                      fontSize: '10px',
                      color: '#A1A1AA',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {top3?.bio || 'This creator has mastery at his own field of Editing. Design is not just what it looks like and feels like.'}
                    </p>
                  </div>
                </div>
              </Link>

            </div>
          </div>

          {/* 3. Geographic Ranking: Country Row ("India ˅") */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingLeft: '4px',
              paddingRight: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                <span>India</span>
                <ChevronDown size={14} color="#A1A1AA" />
              </div>
              <Link href="/ranking" style={{ fontSize: '12px', color: '#71717A', textDecoration: 'none' }}>
                View all
              </Link>
            </div>

            {/* Horizontal Scrollable Row */}
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '6px',
              scrollbarWidth: 'none'
            }}>
              {countryUsers.length > 0 ? (
                countryUsers.map((u, i) => (
                  <Link
                    key={u.id || i}
                    href={`/user/${u.id}`}
                    className="ranking-compact-card"
                  >
                    <div style={{
                      width: '38px',
                      height: '42px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src="/images/figma/badge_164_290.png"
                        alt="badge"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1.1' }}>
                        {i + 1} Rank
                      </div>
                      <div style={{ fontSize: '11px', color: '#A1A1AA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.personalProfile?.mainIdentity || 'Editor'}
                      </div>
                    </div>
                    <span style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', color: '#71717A' }}>
                      India
                    </span>
                  </Link>
                ))
              ) : (
                [1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="ranking-compact-card">
                    <div style={{ width: '38px', height: '42px', backgroundColor: '#22C55E', opacity: 0.8, borderRadius: '8px' }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>{num} Rank</div>
                      <div style={{ fontSize: '11px', color: '#A1A1AA' }}>Editor</div>
                    </div>
                    <span style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', color: '#71717A' }}>India</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. Geographic Ranking: State Row ("Gujarat ˅") */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingLeft: '4px',
              paddingRight: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                <span>Gujarat</span>
                <ChevronDown size={14} color="#A1A1AA" />
              </div>
              <Link href="/ranking" style={{ fontSize: '12px', color: '#71717A', textDecoration: 'none' }}>
                View all
              </Link>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '6px',
              scrollbarWidth: 'none'
            }}>
              {stateUsers.length > 0 ? (
                stateUsers.map((u, i) => (
                  <Link
                    key={u.id || i}
                    href={`/user/${u.id}`}
                    className="ranking-compact-card"
                  >
                    <div style={{
                      width: '38px',
                      height: '42px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src="/images/figma/badge_164_318.png"
                        alt="badge"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', lineHeight: '1.1' }}>
                        {i + 1} Rank
                      </div>
                      <div style={{ fontSize: '11px', color: '#A1A1AA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.personalProfile?.mainIdentity || 'Editor'}
                      </div>
                    </div>
                    <span style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', color: '#71717A' }}>
                      Gujarat
                    </span>
                  </Link>
                ))
              ) : (
                [1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="ranking-compact-card">
                    <div style={{ width: '38px', height: '42px', backgroundColor: '#3B82F6', opacity: 0.8, borderRadius: '8px' }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>{num} Rank</div>
                      <div style={{ fontSize: '11px', color: '#A1A1AA' }}>Editor</div>
                    </div>
                    <span style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', color: '#71717A' }}>Gujarat</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
