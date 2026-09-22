import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Search, Users, Gamepad2, Car, Trophy, Waves, Palette, Briefcase, Cpu, Music } from 'lucide-react';
import AppRightSidebar from '../components/AppRightSidebar';

export const dynamic = 'force-dynamic';

export default async function CommunitiesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  // 1. Fetch user's joined communities
  const joinedMemberships = await prisma.communityMember.findMany({
    where: { userId },
    include: {
      community: {
        include: {
          _count: { select: { members: true } }
        }
      }
    },
    orderBy: { joinedAt: 'desc' },
    take: 6
  });

  const mineCommunities = joinedMemberships.map((m) => m.community);

  // 2. Fetch all public communities to populate Top & Suggested
  const allCommunities = await prisma.community.findMany({
    include: {
      _count: { select: { members: true } },
      members: { where: { userId } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  // Default Top Community Cards metadata matching media_1790064910900.png
  const defaultTopCards = [
    {
      name: 'Welcome Gamers',
      membersLabel: '104k+ members are joined',
      bg: '#991B1B', // Crimson
      icon: Gamepad2,
      badgeBg: '#18181B'
    },
    {
      name: 'Racers',
      membersLabel: '504k+ members are joined',
      bg: '#5A2A27', // Rust / Brown
      icon: Car,
      badgeBg: '#27272A'
    },
    {
      name: 'Athletes',
      membersLabel: '104k+ members are joined',
      bg: '#16A34A', // Emerald green
      icon: Trophy,
      badgeBg: '#F59E0B'
    },
    {
      name: 'Chill World',
      membersLabel: '104k+ members are joined',
      bg: '#0D9488', // Teal
      icon: Waves,
      badgeBg: '#0284C7'
    },
    {
      name: 'Creative Arts',
      membersLabel: '88k+ members are joined',
      bg: '#831843', // Deep magenta
      icon: Palette,
      badgeBg: '#BE185D'
    },
    {
      name: 'Entrepreneurs',
      membersLabel: '142k+ members are joined',
      bg: '#B45309', // Amber / Gold
      icon: Briefcase,
      badgeBg: '#D97706'
    },
    {
      name: 'Tech & AI',
      membersLabel: '220k+ members are joined',
      bg: '#1E1B4B', // Deep Violet / Indigo
      icon: Cpu,
      badgeBg: '#4F46E5'
    },
    {
      name: 'Music & Beats',
      membersLabel: '95k+ members are joined',
      bg: '#9A3412', // Burnt Orange
      icon: Music,
      badgeBg: '#EA580C'
    }
  ];

  // Default Suggested Community Cards metadata matching media_1790064910900.png
  const defaultSuggestedCards = [
    { name: 'Nature Explorers', bg: '#2E4F4F', category: 'Outdoors' },
    { name: 'Indie Developers', bg: '#1E3A5F', category: 'Technology' },
    { name: 'Book Enthusiasts', bg: '#3C2A3E', category: 'Literature' },
    { name: 'Film & Media', bg: '#1B3B2B', category: 'Cinema' }
  ];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
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
              TOP SEARCH BAR (Pill shape, centered matching Figma)
             ======================================================== */}
          <div className="responsive-search-pill" style={{
            height: '64px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            backgroundColor: '#000000',
            zIndex: 40
          }}>
            <div style={{
              width: '440px',
              maxWidth: '100%',
              height: '38px',
              borderRadius: '999px',
              backgroundColor: '#18181B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '10px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
            }}>
              <input
                type="text"
                placeholder=""
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <Search size={16} color="#A1A1AA" style={{ flexShrink: 0 }} />
            </div>
          </div>

          {/* MAIN PAGE BODY */}
          <div className="responsive-page-container">

            {/* ========================================================
                SECTION 1: MINE COMMUNITY (2-Column Capsule Pills)
               ======================================================== */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: '0 0 16px 0',
                letterSpacing: '-0.2px'
              }}>
                Mine Community
              </h2>

              <div className="communities-mine-responsive-grid">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const comm = mineCommunities[idx] || allCommunities[idx];
                  const linkUrl = comm ? `/communities/${comm.id}` : '#';

                  return (
                    <Link
                      key={comm?.id || idx}
                      href={linkUrl}
                      className="comm-capsule-item"
                      style={{
                        borderRadius: '999px',
                        height: '48px',
                        padding: '0 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        textDecoration: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      {/* Blue circle avatar on left matching Figma */}
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: '#0284C7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        {comm?.avatarData ? (
                          <img src={comm.avatarData} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : null}
                      </div>

                      {/* 2 skeleton bars matching Figma */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                        <div style={{
                          width: idx % 2 === 0 ? '90px' : '75px',
                          height: '5px',
                          backgroundColor: 'rgba(255, 255, 255, 0.45)',
                          borderRadius: '999px'
                        }} />
                        <div style={{
                          width: idx % 2 === 0 ? '55px' : '45px',
                          height: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '999px'
                        }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ========================================================
                SECTION 2: TOP COMMUNITY (Exact 4x2 Grid from Figma media_1790064910900.png)
               ======================================================== */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: '0 0 16px 0',
                letterSpacing: '-0.2px'
              }}>
                Top Community
              </h2>

              <div className="communities-top-responsive-grid">
                {/* Card 1: Welcome Gamers (Crimson Red with black circle & white Amerigam logo) */}
                <Link
                  href={allCommunities.find(c => c.name.toLowerCase().includes('gamer')) ? `/communities/${allCommunities.find(c => c.name.toLowerCase().includes('gamer'))?.id}` : '#'}
                  className="comm-top-card"
                  style={{
                    backgroundColor: '#991B1B',
                    borderRadius: '24px',
                    height: '175px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5)',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#111113',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}>
                    <img src="/amerigam-logo-transparent.png" alt="logo" style={{ width: '26px', height: '14px', objectFit: 'contain' }} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: '4px', lineHeight: '1.2' }}>
                    Welcome Gamers
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', fontWeight: 500 }}>
                    104k+ members are joined
                  </div>
                </Link>

                {/* Card 2: Racers (Sienna Rust with car graphic) */}
                <Link
                  href={allCommunities.find(c => c.name.toLowerCase().includes('racer')) ? `/communities/${allCommunities.find(c => c.name.toLowerCase().includes('racer'))?.id}` : '#'}
                  className="comm-top-card"
                  style={{
                    backgroundColor: '#5C2825',
                    borderRadius: '24px',
                    height: '175px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5)',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#1C1C1E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    overflow: 'hidden'
                  }}>
                    <Car size={24} color="#EF4444" />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: '4px', lineHeight: '1.2' }}>
                    Racers
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', fontWeight: 500 }}>
                    504k+ members are joined
                  </div>
                </Link>

                {/* Card 3: Athletes (Green with Gold Trophy) */}
                <Link
                  href={allCommunities.find(c => c.name.toLowerCase().includes('athlete')) ? `/communities/${allCommunities.find(c => c.name.toLowerCase().includes('athlete'))?.id}` : '#'}
                  className="comm-top-card"
                  style={{
                    backgroundColor: '#16A34A',
                    borderRadius: '24px',
                    height: '175px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5)',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#EAB308',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Trophy size={24} color="#FFFFFF" />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: '4px', lineHeight: '1.2' }}>
                    Athletes
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', fontWeight: 500 }}>
                    104k+ members are joined
                  </div>
                </Link>

                {/* Card 4: Chill Word (Teal with Swirling Waves) */}
                <Link
                  href={allCommunities.find(c => c.name.toLowerCase().includes('chill')) ? `/communities/${allCommunities.find(c => c.name.toLowerCase().includes('chill'))?.id}` : '#'}
                  className="comm-top-card"
                  style={{
                    backgroundColor: '#0D9488',
                    borderRadius: '24px',
                    height: '175px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.5)',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Waves size={24} color="#FFFFFF" />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: '4px', lineHeight: '1.2' }}>
                    Chill Word
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', fontWeight: 500 }}>
                    104k+ members are joined
                  </div>
                </Link>

                {/* Row 2: 4 Solid Color Cards matching Figma (Deep Wine, Mustard Gold, Indigo, Burnt Orange) */}
                {[
                  { bg: '#881337', name: 'Creative Arts' },
                  { bg: '#B45309', name: 'Entrepreneurs' },
                  { bg: '#1E1B4B', name: 'Tech & AI' },
                  { bg: '#9A3412', name: 'Music & Beats' }
                ].map((item, idx) => {
                  const comm = allCommunities.find(c => c.name.toLowerCase().includes(item.name.toLowerCase())) || allCommunities[idx + 4];
                  const linkUrl = comm ? `/communities/${comm.id}` : '#';

                  return (
                    <Link
                      key={idx}
                      href={linkUrl}
                      className="comm-top-card"
                      style={{
                        backgroundColor: item.bg,
                        borderRadius: '24px',
                        height: '175px',
                        display: 'block',
                        textDecoration: 'none',
                        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.4)',
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* ========================================================
                SECTION 3: SUGGESTED COMMUNITY (Exact 4 Muted Squircles from Figma)
               ======================================================== */}
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                margin: '0 0 16px 0',
                letterSpacing: '-0.2px'
              }}>
                Suggested Community
              </h2>

              <div className="communities-top-responsive-grid">
                {[
                  { bg: '#3F6E5D' },
                  { bg: '#2A5979' },
                  { bg: '#4B3B57' },
                  { bg: '#254530' }
                ].map((item, idx) => {
                  const comm = allCommunities[idx + 8] || allCommunities[idx];
                  const linkUrl = comm ? `/communities/${comm.id}` : '#';

                  return (
                    <Link
                      key={idx}
                      href={linkUrl}
                      className="comm-suggested-card"
                      style={{
                        backgroundColor: item.bg,
                        borderRadius: '24px',
                        height: '150px',
                        display: 'block',
                        textDecoration: 'none',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Sidebar: Profile Card & Joined Competitions */}
        <AppRightSidebar userId={userId} mode="communities" />
      </div>
    </div>
  );
}
