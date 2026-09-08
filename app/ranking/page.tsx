import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Search, Bell, Trophy, CheckCircle2, MapPin } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ type?: string, geo?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { personalProfile: true }
  });

  if (!currentUser) redirect('/login');

  const resolvedSearchParams = await searchParams;
  const currentType = resolvedSearchParams.type || 'personal';
  const currentGeo = resolvedSearchParams.geo || 'international';

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false }
  });

  // Map types to AccountType enum
  let typeFilter = 'PERSONAL';
  if (currentType === 'business') typeFilter = 'BUSINESS';
  if (currentType === 'creator') typeFilter = 'CREATOR';
  if (currentType === 'influencer') typeFilter = 'INFLUENCER';

  let rankedUsers: any[] = [];
  if (typeFilter === 'PERSONAL') {
    const { getLeaderboard } = await import('../../lib/ranking-service');
    
    let locationValue = undefined;
    if (currentGeo === 'national') locationValue = currentUser.country || undefined;
    if (currentGeo === 'state') locationValue = currentUser.state || undefined;
    if (currentGeo === 'city') locationValue = currentUser.city || currentUser.district || undefined;

    const categoryMatch = currentUser.personalProfile?.mainIdentity || undefined;

    const leaderboard = await getLeaderboard(
      currentGeo.toUpperCase() as any, 
      locationValue, 
      50,
      0,
      categoryMatch
    );

    // We fetch outgoingConnections for identity line in the UI
    const usersWithConns = await prisma.user.findMany({
      where: { id: { in: leaderboard.map((u: any) => u.id) } },
      include: { outgoingConnections: { include: { target: true } } }
    });

    rankedUsers = leaderboard.map((lu: any) => ({
      ...lu,
      outgoingConnections: usersWithConns.find(u => u.id === lu.id)?.outgoingConnections || [],
      accountType: 'PERSONAL',
      // Store real rank on the object to use in UI instead of array index
      computedRank: lu.rank
    }));
  } else {
    rankedUsers = await prisma.user.findMany({
      where: {
        accountType: typeFilter,
        onboarded: true
      },
      include: { outgoingConnections: { include: { target: true } } },
      orderBy: { amerigamPoints: 'desc' },
      take: 50
    });

    if (rankedUsers.every((u: any) => u.amerigamPoints === 0)) {
      rankedUsers = rankedUsers.map((u: any, i: number) => ({
        ...u,
        amerigamPoints: Math.floor(10000 / (i + 1)) + (u.name?.length || 0) * 10
      })).sort((a: any, b: any) => b.amerigamPoints - a.amerigamPoints);
    }
    }

  // Filter out any deleted users
  rankedUsers = rankedUsers.filter(u => u.name !== 'Deleted User' && !u.username?.startsWith('deleted_'));

  const top3 = rankedUsers.slice(0, 3);
  const theRest = rankedUsers.slice(3);

  const currentUserRankIndex = rankedUsers.findIndex(u => u.id === userId);
  const isCurrentUserInTop3 = currentUserRankIndex !== -1 && currentUserRankIndex < 3;
  const isCurrentUserInList = currentUserRankIndex !== -1;

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100%', maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' }}>
      
      {/* Mobile Sticky Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top Icons Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/feed">
              <Image 
                src="/logo-new.jpg" 
                alt="Amerigam" 
                width={34} 
                height={34} 
                style={{ objectFit: 'contain', mixBlendMode: 'screen' }}
                priority
              />
            </Link>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>Ranking</span>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/search" style={{ color: 'white' }}>
              <Search size={22} strokeWidth={2.5} />
            </Link>
            <Link href="/notifications" style={{ color: 'white', position: 'relative' }}>
              <Bell size={22} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#F91880',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: '2px solid #000'
                }} />
              )}
            </Link>
          </div>
        </div>

        {/* Account Type Scroller */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '8px 16px 12px 16px',
          gap: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          
          {['Personal', 'Business', 'Creator', 'Influencer'].map((typeLabel) => {
            const typeKey = typeLabel.toLowerCase();
            const isActive = currentType === typeKey;
            return (
              <Link key={typeKey} href={`/ranking?type=${typeKey}&geo=${currentGeo}`} style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: isActive ? '#1D9BF0' : '#18181B',
                color: isActive ? 'white' : '#A1A1AA',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                border: isActive ? '1px solid #1D9BF0' : '1px solid #27272A'
              }}>
                {typeLabel}
              </Link>
            );
          })}
        </div>

        {/* Geography Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #27272A',
          padding: '0 8px'
        }}>
          {['International', 'National', 'State', 'City'].map((geoLabel) => {
            const geoKey = geoLabel.toLowerCase();
            const isActive = currentGeo === geoKey;
            return (
              <Link key={geoKey} href={`/ranking?type=${currentType}&geo=${geoKey}`} style={{
                flex: 1, textAlign: 'center', padding: '12px 0',
                color: isActive ? 'white' : '#71717A',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                position: 'relative',
                fontSize: '13px'
              }}>
                {geoLabel}
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '36px', height: '3px', background: '#FFFFFF', borderRadius: '4px 4px 0 0' }} />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      <div style={{ paddingBottom: '120px' }}>
        
        {/* Premium Top 3 Area */}
        {top3.length > 0 && (
          <div style={{ 
            padding: '24px 16px 32px 16px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '16px',
            borderBottom: '1px solid #27272A'
          }}>
            {/* 2nd Place */}
            {top3[1] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', gap: '8px' }}>
                <div style={{ color: '#E5E7EB', fontSize: '15px', fontWeight: 600 }}>2</div>
                <Link href={`/user/${top3[1].id}`}>
                  <div style={{ border: '2px solid #E5E7EB', borderRadius: '50%', padding: '2px' }}>
                    <ProfilePicture user={top3[1]} size={56} showStatus={false} />
                  </div>
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{top3[1].name || top3[1].username}</div>
                  <div style={{ color: '#E5E7EB', fontWeight: 500, fontSize: '13px', marginTop: '2px' }}>{top3[1].amerigamPoints.toLocaleString()} AP</div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%', gap: '8px', paddingBottom: '12px' }}>
              <div style={{ color: '#F59E0B', fontSize: '15px', fontWeight: 600 }}>1</div>
              <Link href={`/user/${top3[0].id}`}>
                <div style={{ border: '3px solid #F59E0B', borderRadius: '50%', padding: '3px' }}>
                  <ProfilePicture user={top3[0]} size={64} showStatus={false} />
                </div>
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '15px', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{top3[0].name || top3[0].username}</div>
                <div style={{ color: '#F59E0B', fontWeight: 500, fontSize: '14px', marginTop: '2px' }}>{top3[0].amerigamPoints.toLocaleString()} AP</div>
              </div>
            </div>

            {/* 3rd Place */}
            {top3[2] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', gap: '8px' }}>
                <div style={{ color: '#B45309', fontSize: '15px', fontWeight: 600 }}>3</div>
                <Link href={`/user/${top3[2].id}`}>
                  <div style={{ border: '2px solid #B45309', borderRadius: '50%', padding: '2px' }}>
                    <ProfilePicture user={top3[2]} size={56} showStatus={false} />
                  </div>
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{top3[2].name || top3[2].username}</div>
                  <div style={{ color: '#B45309', fontWeight: 500, fontSize: '13px', marginTop: '2px' }}>{top3[2].amerigamPoints.toLocaleString()} AP</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* The Rest of the Ranking List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {theRest.map((person, index) => {
            const rank = person.computedRank ?? (index + 4);
            const isMe = person.id === userId;
            const isVerified = person.accountType !== 'PERSONAL' || (person.followers && person.followers.length > 100);

            let identityLine = '';
            if (person.outgoingConnections && person.outgoingConnections.length > 0) {
              const conn = person.outgoingConnections[0];
              identityLine = `${conn.role.replace('_', ' ')} • ${conn.target?.name || conn.target?.username || ''}`;
            } else {
              identityLine = person.accountType.charAt(0) + person.accountType.slice(1).toLowerCase();
            }

            return (
              <Link key={person.id} href={`/user/${person.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  borderBottom: '1px solid #18181B',
                  backgroundColor: isMe ? '#18181B' : 'transparent',
                  gap: '16px'
                }}>
                  <div style={{ width: '24px', color: '#A1A1AA', fontWeight: 600, fontSize: '15px' }}>
                    {rank}
                  </div>
                  
                  <ProfilePicture user={person} size={40} showStatus={false} />
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {person.name || person.username}
                      </span>
                      {isVerified && <CheckCircle2 size={14} color="#1D9BF0" fill="#1D9BF0" style={{ flexShrink: 0 }} />}
                    </div>
                    <span style={{ color: '#71717A', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {identityLine}
                    </span>
                  </div>

                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', display: 'flex', gap: '4px', alignItems: 'baseline' }}>
                    {person.amerigamPoints.toLocaleString()} <span style={{ color: '#71717A', fontSize: '12px', fontWeight: 500 }}>AP</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sticky Current User Rank (if not in top 3) */}
      {!isCurrentUserInTop3 && currentUser && currentUser.accountType === typeFilter && (
        <div style={{
          position: 'fixed',
          bottom: '72px', // above standard tab bar
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          background: 'rgba(29, 155, 240, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(29, 155, 240, 0.2)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '24px', textAlign: 'center', color: '#1D9BF0', fontWeight: 700, fontSize: '15px' }}>
            {currentUserRankIndex !== -1 ? (rankedUsers[currentUserRankIndex].computedRank ?? (currentUserRankIndex + 1)) : '-'}
          </div>
          
          <ProfilePicture user={currentUser as any} size={40} showStatus={false} />
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Your Ranking</span>
            </div>
            <div style={{ color: '#1D9BF0', fontSize: '12px' }}>
              {currentUser.accountType.charAt(0) + currentUser.accountType.slice(1).toLowerCase()}
            </div>
          </div>

          <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>
            {currentUserRankIndex !== -1 ? rankedUsers[currentUserRankIndex].amerigamPoints.toLocaleString() : currentUser.amerigamPoints.toLocaleString()} <span style={{ color: '#71717A', fontSize: '12px' }}>AP</span>
          </div>
        </div>
      )}

    </div>
  );
}
