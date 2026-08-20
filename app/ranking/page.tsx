import { prisma } from '../../lib/prisma';
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
    where: { id: userId }
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

  let rankedUsers = await prisma.user.findMany({
    where: {
      accountType: typeFilter,
      onboarded: true
    },
    include: { outgoingConnections: { include: { target: true } } },
    orderBy: { amerigamPoints: 'desc' },
    take: 50
  });

  // Fallback sorting by followers if AP is all 0 (since it was just added)
  // For the beta, to show UI, if everyone has 0 AP, we'll randomize or sort by ID just to show rankings.
  if (rankedUsers.every(u => u.amerigamPoints === 0)) {
    // Generate deterministic fake AP for UI showcase
    rankedUsers = rankedUsers.map((u, i) => ({
      ...u,
      amerigamPoints: Math.floor(10000 / (i + 1)) + (u.name?.length || 0) * 10
    })).sort((a, b) => b.amerigamPoints - a.amerigamPoints);
  }

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
        
        {/* Top 3 Podium Experience */}
        {top3.length > 0 && (
          <div style={{ 
            padding: '32px 16px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '12px',
            background: 'radial-gradient(ellipse at top, #152238 0%, #000000 70%)',
            borderBottom: '1px solid #18181B'
          }}>
            {/* 2nd Place */}
            {top3[1] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                <div style={{ color: '#A1A1AA', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>2</div>
                <Link href={`/user/${top3[1].id}`}>
                  <div style={{ border: '3px solid #71717A', borderRadius: '50%', padding: '2px' }}>
                    <ProfilePicture user={top3[1]} size={60} showStatus={false} />
                  </div>
                </Link>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', marginTop: '8px', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{top3[1].name}</div>
                <div style={{ color: '#1D9BF0', fontWeight: 700, fontSize: '12px', marginTop: '2px' }}>{top3[1].amerigamPoints.toLocaleString()} AP</div>
              </div>
            )}

            {/* 1st Place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%', paddingBottom: '16px' }}>
              <div style={{ color: '#FCD34D', fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>1</div>
              <Link href={`/user/${top3[0].id}`}>
                <div style={{ border: '4px solid #FCD34D', borderRadius: '50%', padding: '3px' }}>
                  <ProfilePicture user={top3[0]} size={80} showStatus={false} />
                </div>
              </Link>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginTop: '8px', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{top3[0].name}</div>
              <div style={{ color: '#FCD34D', fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>{top3[0].amerigamPoints.toLocaleString()} AP</div>
            </div>

            {/* 3rd Place */}
            {top3[2] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                <div style={{ color: '#B45309', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>3</div>
                <Link href={`/user/${top3[2].id}`}>
                  <div style={{ border: '3px solid #B45309', borderRadius: '50%', padding: '2px' }}>
                    <ProfilePicture user={top3[2]} size={60} showStatus={false} />
                  </div>
                </Link>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', marginTop: '8px', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{top3[2].name}</div>
                <div style={{ color: '#1D9BF0', fontWeight: 700, fontSize: '12px', marginTop: '2px' }}>{top3[2].amerigamPoints.toLocaleString()} AP</div>
              </div>
            )}
          </div>
        )}

        {/* The Rest of the Ranking List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {theRest.map((person, index) => {
            const rank = index + 4;
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
              <Link href={`/user/${person.id}`} key={person.id} style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid #18181B',
                gap: '16px',
                textDecoration: 'none',
                backgroundColor: isMe ? 'rgba(29, 155, 240, 0.05)' : 'transparent'
              }}>
                <div style={{ width: '24px', textAlign: 'center', color: isMe ? '#1D9BF0' : '#71717A', fontWeight: 700, fontSize: '15px' }}>
                  {rank}
                </div>
                
                <ProfilePicture user={person} size={46} />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: isMe ? '#1D9BF0' : 'white', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.2px' }}>
                      {person.name || person.username}
                    </span>
                    {isVerified && <CheckCircle2 size={14} color="#1D9BF0" fill="#1D9BF0" />}
                  </div>
                  <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '2px', fontWeight: 400 }}>
                    {identityLine}
                  </div>
                </div>

                <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>
                  {person.amerigamPoints.toLocaleString()} <span style={{ color: '#71717A', fontSize: '12px' }}>AP</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>

      {/* Sticky Current User Anchor if not in Top 3 and scrolled or just floating at bottom */}
      {(!isCurrentUserInTop3 && currentUser && currentUser.accountType === typeFilter) && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#000000',
          borderTop: '1px solid #27272A',
          borderBottom: '1px solid #27272A',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          zIndex: 40
        }}>
          <div style={{ width: '24px', textAlign: 'center', color: '#1D9BF0', fontWeight: 700, fontSize: '15px' }}>
            {currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : '-'}
          </div>
          
          <ProfilePicture user={currentUser} size={46} />
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#1D9BF0', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.2px' }}>
              You
            </span>
            <div style={{ fontSize: '13px', color: '#A1A1AA', marginTop: '2px', fontWeight: 400 }}>
              {currentUser.accountType.charAt(0) + currentUser.accountType.slice(1).toLowerCase()}
            </div>
          </div>

          <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>
            {currentUserRankIndex !== -1 ? rankedUsers[currentUserRankIndex].amerigamPoints.toLocaleString() : '0'} <span style={{ color: '#71717A', fontSize: '12px' }}>AP</span>
          </div>
        </div>
      )}

    </div>
  );
}
